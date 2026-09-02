"use server";

import { createClient } from "@/lib/supabase-server";
import { rateLimiter } from "@/lib/rate-limit";

export async function cancelApplication(appId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const { success: rateLimitSuccess } = rateLimiter.check(`app-${user.id}`, 10, 60000);
  if (!rateLimitSuccess) return { success: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." };

  // 1. 신청 내역 소유자 확인
  const { data: app, error: fetchError } = await supabase
    .from("applications")
    .select("applicant_id")
    .eq("id", appId)
    .single();

  if (fetchError || !app) {
    return { success: false, error: "신청 내역을 찾을 수 없습니다." };
  }

  if (app.applicant_id !== user.id) {
    return { success: false, error: "본인의 신청 내역만 취소할 수 있습니다." };
  }

  // 2. 삭제 실행
  const { error: deleteError } = await supabase
    .from("applications")
    .delete()
    .eq("id", appId);

  if (deleteError) {
    return { success: false, error: "취소 처리에 실패했습니다." };
  }

  return { success: true };
}

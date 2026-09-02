"use server";

import { createClient } from "@/lib/supabase-server";
import { rateLimiter } from "@/lib/rate-limit";

export async function toggleRecruitStatus(table: "recruits" | "buses", id: number, newStatus: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "로그인이 필요합니다." };

  const { success: rateLimitSuccess } = rateLimiter.check(`recruit-${user.id}`, 10, 60000);
  if (!rateLimitSuccess) return { success: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." };

  // 1. 게시글 소유자 확인
  const { data: post, error: fetchError } = await supabase
    .from(table)
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !post) {
    return { success: false, error: "게시글을 찾을 수 없습니다." };
  }

  if (post.user_id !== user.id) {
    return { success: false, error: "작성자만 상태를 변경할 수 있습니다." };
  }

  // 2. 업데이트 실행
  const updates: Record<string, string> = { status: newStatus };
  if (newStatus === "모집중") {
    updates.created_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from(table)
    .update(updates)
    .eq("id", id);

  if (updateError) {
    return { success: false, error: "상태 변경에 실패했습니다." };
  }

  return { success: true };
}

export async function deleteRecruit(table: "recruits" | "buses", id: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "로그인이 필요합니다." };

  const { success: rateLimitSuccess } = rateLimiter.check(`recruit-${user.id}`, 10, 60000);
  if (!rateLimitSuccess) return { success: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." };

  // 1. 게시글 소유자 확인
  const { data: post, error: fetchError } = await supabase
    .from(table)
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !post) {
    return { success: false, error: "게시글을 찾을 수 없습니다." };
  }

  if (post.user_id !== user.id) {
    return { success: false, error: "작성자만 삭제할 수 있습니다." };
  }

  // 2. 삭제 실행
  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { success: false, error: "삭제에 실패했습니다." };
  }

  return { success: true };
}

export async function updateRecruit(table: "recruits" | "buses", id: number, updateData: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "로그인이 필요합니다." };

  const { success: rateLimitSuccess } = rateLimiter.check(`recruit-${user.id}`, 10, 60000);
  if (!rateLimitSuccess) return { success: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." };

  // 서버사이드 입력 길이 및 타입 재검증
  if (updateData.title && (typeof updateData.title !== 'string' || updateData.title.length > 100)) return { success: false, error: "제목이 너무 길거나 형식이 올바르지 않습니다." };
  if (updateData.description && (typeof updateData.description !== 'string' || updateData.description.length > 2000)) return { success: false, error: "본문이 너무 길거나 형식이 올바르지 않습니다." };
  if (updateData.dungeon && (typeof updateData.dungeon !== 'string' || updateData.dungeon.length > 100)) return { success: false, error: "던전 이름이 너무 깁니다." };
  if (updateData.time && (typeof updateData.time !== 'string' || updateData.time.length > 100)) return { success: false, error: "시간 형식이 올바르지 않습니다." };

  // 1. 게시글 소유자 확인
  const { data: post, error: fetchError } = await supabase
    .from(table)
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !post) {
    return { success: false, error: "게시글을 찾을 수 없습니다." };
  }

  if (post.user_id !== user.id) {
    return { success: false, error: "작성자만 수정할 수 있습니다." };
  }

  // 2. 보호되어야 할 필드 무시 (종족, 서버, 작성자명 등)
  const safeData = { ...updateData };
  delete safeData.user_id;
  delete safeData.author;
  delete safeData.race;
  delete safeData.server;
  delete safeData.is_verified;
  delete safeData.char_level;
  delete safeData.char_jobclass;
  delete safeData.char_itemlevel;
  delete safeData.char_combatpower;
  delete safeData.char_profileimage;
  delete safeData.created_at;

  // 3. 업데이트 실행
  const { error: updateError } = await supabase
    .from(table)
    .update(safeData)
    .eq("id", id);

  if (updateError) {
    return { success: false, error: "수정에 실패했습니다." };
  }

  return { success: true };
}

export async function createRecruit(table: "recruits" | "buses", postData: Record<string, unknown>) {
  const supabase = await createClient();
  
  // 1. 유저 인증 확인
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const { success: rateLimitSuccess } = rateLimiter.check(`recruit-${user.id}`, 10, 60000);
  if (!rateLimitSuccess) return { success: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." };

  // 서버사이드 입력 길이 및 타입 재검증
  if (postData.title && (typeof postData.title !== 'string' || postData.title.length > 100)) return { success: false, error: "제목이 너무 길거나 형식이 올바르지 않습니다." };
  if (postData.description && (typeof postData.description !== 'string' || postData.description.length > 2000)) return { success: false, error: "본문이 너무 길거나 형식이 올바르지 않습니다." };
  if (postData.dungeon && (typeof postData.dungeon !== 'string' || postData.dungeon.length > 100)) return { success: false, error: "던전 이름이 너무 깁니다." };
  if (postData.time && (typeof postData.time !== 'string' || postData.time.length > 100)) return { success: false, error: "시간 형식이 올바르지 않습니다." };

  // 2. 보호되어야 할 필드를 서버 사이드 세션에서 강제로 주입
  const secureData = {
    ...postData,
    user_id: user.id,
    author: user.user_metadata?.charNickname || "익명",
    race: user.user_metadata?.charRace || "",
    server: user.user_metadata?.charServer || "",
    is_verified: user.user_metadata?.isVerified || false,
    char_level: user.user_metadata?.char_level,
    char_jobclass: user.user_metadata?.char_jobclass,
    char_itemlevel: user.user_metadata?.char_itemlevel,
    char_combatpower: user.user_metadata?.char_combatpower,
    char_profileimage: user.user_metadata?.char_profileimage,
    status: "모집중",
    created_at: new Date().toISOString()
  };

  // 3. DB 삽입
  const { error } = await supabase.from(table).insert([secureData]);

  if (error) {
    console.error("게시글 생성 에러:", error);
    return { success: false, error: "게시글 등록에 실패했습니다." };
  }

  return { success: true };
}

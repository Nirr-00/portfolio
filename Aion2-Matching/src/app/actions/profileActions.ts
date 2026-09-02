"use server";

import { createClient } from "@/lib/supabase-server";
import { CharacterSearchResult } from "@/types/character";
import { rateLimiter } from "@/lib/rate-limit";

export async function syncCharacterInfo(newCharInfo: CharacterSearchResult) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const { success: rateLimitSuccess } = rateLimiter.check(`profile-${user.id}`, 5, 60000);
  if (!rateLimitSuccess) return { success: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." };

  // 1. 유저 메타데이터 업데이트
  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      char_level: newCharInfo.level,
      char_jobclass: newCharInfo.jobClass,
      char_itemlevel: newCharInfo.itemLevel,
      char_combatpower: newCharInfo.combatPower,
      char_profileimage: newCharInfo.profileImage,
    }
  });

  if (updateError) return { success: false, error: "프로필 메타데이터 업데이트에 실패했습니다." };

  // 2. 작성된 모집글 일괄 업데이트
  const bulkUpdates = {
    char_level: newCharInfo.level,
    char_jobclass: newCharInfo.jobClass,
    char_itemlevel: newCharInfo.itemLevel,
    char_combatpower: newCharInfo.combatPower,
    char_profileimage: newCharInfo.profileImage,
  };

  await Promise.all([
    supabase.from("recruits").update(bulkUpdates).eq("user_id", user.id),
    supabase.from("buses").update(bulkUpdates).eq("user_id", user.id)
  ]);

  return { success: true };
}

export interface ProfileUpdates {
  data: {
    nickname?: string;
    charRace?: string;
    charServer?: string;
    charNickname?: string;
    isVerified?: boolean;
  };
  password?: string;
}

export async function updateUserProfile(updates: ProfileUpdates) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const { success: rateLimitSuccess } = rateLimiter.check(`profile-${user.id}`, 5, 60000);
  if (!rateLimitSuccess) return { success: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." };

  // 보안 필터링: 클라이언트가 isVerified를 강제로 true로 설정하려는 시도 차단
  // 현재 유저 상태가 인증되지 않았는데 업데이트 요청에서 true로 온다면 무시합니다.
  // (인증은 오직 /api/verify-character API를 통해서만 가능해야 함)
  const currentIsVerified = user.user_metadata?.isVerified || false;
  if (updates.data && updates.data.isVerified === true && !currentIsVerified) {
    updates.data.isVerified = false; 
  }

  const { error } = await supabase.auth.updateUser(updates);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

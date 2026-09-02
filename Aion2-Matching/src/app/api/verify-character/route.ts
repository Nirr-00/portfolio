import { NextResponse } from "next/server";
import { SERVER_MAP } from "@/constants/servers";
import { createAdminClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { rateLimiter } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // 인증 API는 더 빡빡하게 1분당 1회 제한
  const ip = request.headers.get("x-forwarded-for") || "unknown-ip";
  const { success } = rateLimiter.check(ip, 1, 60 * 1000);
  if (!success) {
    return NextResponse.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { nickname, race, server } = body;

    if (!nickname || !race || !server) {
      return NextResponse.json({ error: "모든 캐릭터 정보(종족, 서버, 닉네임)가 필요합니다." }, { status: 400 });
    }

    // Authorization 헤더 확인 (유저 토큰)
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "인증 토큰이 누락되었습니다." }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Supabase 설정이 누락되었습니다." }, { status: 500 });
    }

    // 클라이언트가 보낸 토큰으로 서버 클라이언트 생성 (해당 유저 권한으로 동작)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "유효하지 않은 세션입니다." }, { status: 401 });
    }

    // 실제 API 검증 로직
    const raceId = race === "천족" ? "1" : "2";
    const serverId = server && server !== "전체" ? SERVER_MAP[server] || "" : "";

    const searchUrl = `https://aion2.plaync.com/api/search/character?keyword=${encodeURIComponent(nickname)}&race=${raceId}&serverId=${serverId}&page=1&size=30`;
    
    const searchRes = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    
    if (!searchRes.ok) {
      throw new Error(`Search API error: ${searchRes.status}`);
    }

    const searchData = await searchRes.json();

    if (!searchData.list || searchData.list.length === 0) {
      return NextResponse.json({ error: "해당 캐릭터를 찾을 수 없습니다." }, { status: 404 });
    }

    const cleanName = (htmlName: string) => htmlName ? htmlName.replace(/<[^>]*>?/gm, '') : '';
    const exactMatch = searchData.list.find((c: { name: string }) => cleanName(c.name) === nickname);
    const targetCharacter = exactMatch || searchData.list[0];
    const characterId = targetCharacter.characterId;
    const foundServerId = targetCharacter.serverId;

    const detailUrl = `https://aion2.plaync.com/api/character/info?lang=ko&characterId=${characterId}&serverId=${foundServerId}`;
    
    const detailRes = await fetch(detailUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    if (!detailRes.ok) {
      throw new Error(`Detail API error: ${detailRes.status}`);
    }

    const detailData = await detailRes.json();
    const profile = detailData.profile || {};
    
    // 칭호 필드 확인 (NC API 스펙에 따라 title, titleName 등이 사용될 수 있음)
    const currentTitle = profile.title || profile.titleName || profile.equippedTitle || "";

    const expectedTitle = race === "천족" ? "카이시넬의 근원을 마주하다" : "지켈의 근원을 마주하다";

    if (currentTitle === expectedTitle) {
      const adminClient = createAdminClient();
      const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          isVerified: true,
          charNickname: nickname,
          charRace: race,
          charServer: server,
          charJobClass: profile.className || "알 수 없음"
        }
      });

      if (updateError) {
        throw new Error(`메타데이터 업데이트 실패: ${updateError.message}`);
      }

      return NextResponse.json({ success: true, message: "칭호 인증이 완료되었습니다." });
    } else {
      return NextResponse.json({ 
        error: `인증 실패: 현재 장착 중인 칭호가 '${expectedTitle}'가 아닙니다.`,
        currentTitle: currentTitle || "칭호 없음"
      }, { status: 400 });
    }

  } catch (error: unknown) {
    console.error("Verification API Error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "API 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}

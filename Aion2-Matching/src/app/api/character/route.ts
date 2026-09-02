import { NextResponse } from "next/server";
import { SERVER_MAP } from "@/constants/servers";
import { rateLimiter } from "@/lib/rate-limit";

export async function GET(request: Request) {
  // 간단한 IP 기반 Rate Limiting (1분당 5회)
  const ip = request.headers.get("x-forwarded-for") || "unknown-ip";
  const { success } = rateLimiter.check(ip, 5, 60 * 1000);
  if (!success) {
    return NextResponse.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const nickname = searchParams.get("nickname");
  const race = searchParams.get("race"); // "천족" | "마족"
  const server = searchParams.get("server"); // "전체" | "시엘" 등

  if (!nickname) {
    return NextResponse.json({ error: "Nickname is required" }, { status: 400 });
  }

  const raceId = race === "천족" ? "1" : "2";
  const serverId = server && server !== "전체" ? SERVER_MAP[server] || "" : "";

  try {
    // 1. 검색 API 호출하여 characterId 획득
    const searchUrl = `https://aion2.plaync.com/api/search/character?keyword=${encodeURIComponent(nickname)}&race=${raceId}&serverId=${serverId}&page=1&size=30`;
    
    const searchRes = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    
    if (!searchRes.ok) {
      throw new Error(`Search API responded with ${searchRes.status}`);
    }

    const searchData = await searchRes.json();

    if (!searchData.list || searchData.list.length === 0) {
      return NextResponse.json({ error: "캐릭터를 찾을 수 없습니다." }, { status: 404 });
    }

    // 이름에 <strong> 태그가 포함되어 오므로 제거 후 비교
    const cleanName = (htmlName: string) => htmlName ? htmlName.replace(/<[^>]*>?/gm, '') : '';
    const exactMatch = searchData.list.find((c: { name: string; characterId: string; serverId: string }) => cleanName(c.name) === nickname);
    
    const targetCharacter = exactMatch || searchData.list[0];
    const characterId = targetCharacter.characterId; // 이미 인코딩된 상태(%3D 등)
    const foundServerId = targetCharacter.serverId;

    // 2. 상세 정보 API 호출하여 전투력 및 스펙 획득
    // characterId가 이미 URL 인코딩 되어있으므로 다시 encodeURIComponent 하지 않음
    const detailUrl = `https://aion2.plaync.com/api/character/info?lang=ko&characterId=${characterId}&serverId=${foundServerId}`;
    
    const detailRes = await fetch(detailUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    if (!detailRes.ok) {
      throw new Error(`Detail API responded with ${detailRes.status}`);
    }

    const detailData = await detailRes.json();

    // 데이터 파싱
    const profile = detailData.profile || {};
    const stats = detailData.stat?.statList || [];
    const rankings = detailData.ranking?.rankingList || [];

    const itemLevelStat = stats.find((s: { type: string; value: number }) => s.type === "ItemLevel");
    const abyssRank = rankings.find((r: { rankingContentsName: string; rank: number }) => r.rankingContentsName === "어비스");

    return NextResponse.json({
      nickname: profile.characterName || nickname,
      race: profile.raceName || race,
      server: profile.serverName || server,
      jobClass: profile.className || "알 수 없음",
      itemLevel: itemLevelStat ? itemLevelStat.value : 0,
      combatPower: profile.combatPower || 0,
      rank: abyssRank && abyssRank.rank ? abyssRank.rank : "-",
      profileImage: profile.profileImage || null,
      level: profile.characterLevel || 1
    });

  } catch (error: unknown) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "API 호출 중 오류가 발생했습니다." }, { status: 500 });
  }
}

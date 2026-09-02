"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import RecruitFilter, { FilterState } from "@/components/recruit/RecruitFilter";
import SliderSection from "@/components/common/SliderSection";
import HeroSearch from "@/components/home/HeroSearch";
import { Recruit } from "@/types/recruit";
import { supabaseClient } from "@/lib/supabase-client";

/**
 * 메인 페이지의 클라이언트 상호작용(필터링, 슬라이더)을 담당하는 컴포넌트
 */
export default function HomeClient({ initialData }: { initialData: Recruit[] }) {
  const router = useRouter();
  
  const handleWriteClick = async (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      alert("로그인이 필요합니다.");
      return;
    }
    router.push(path);
  };

  const [appliedPostIds, setAppliedPostIds] = useState<Set<number>>(new Set());

  // 현재 유저의 신청 내역을 가져옵니다
  useEffect(() => {
    const fetchAppliedPostIds = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session?.user) {
        const { data } = await supabaseClient
          .from('applications')
          .select('post_id')
          .eq('applicant_id', session.user.id);
        if (data) {
          setAppliedPostIds(new Set(data.map((app: { post_id: number }) => app.post_id)));
        }
      }
    };
    fetchAppliedPostIds();
  }, []);

  const [filters, setFilters] = useState<FilterState>({
    type: [],
    race: [],
    role: [],
    dungeon: [],
    keyword: "",
  });

  const [busFilters, setBusFilters] = useState<FilterState>({
    type: [],
    race: [],
    role: [],
    dungeon: [],
    keyword: "",
  });

  // 파티용 사용 가능한 필터 옵션 추출
  const partyAvailableOptions = useMemo(() => {
    const partyRawData = initialData.filter(
      (post) => post.type === "구인" || post.type === "구직"
    );
    const types = ["구인중", "구직중"];
    const roles = ["탱커", "딜러", "힐러"];
    const races = ["천족", "마족"];
    const jobClasses = Array.from(new Set(partyRawData.map((d) => d.jobClass)));
    const dungeons = ["성역", "초월", "원정"];
    const fields = ["어비스", "시공"];
    const servers = Array.from(new Set(partyRawData.map((d) => d.server)));

    return { types, roles, jobClasses, dungeons, fields, servers, races };
  }, [initialData]);

  // 버스용 사용 가능한 필터 옵션 추출
  const busAvailableOptions = useMemo(() => {
    const types = ["기사 구함", "승객 모집"];
    const roles = ["탱커", "딜러", "힐러"];
    const races = ["천족", "마족"];
    const dungeons = ["성역", "초월", "원정"];
    const fields = ["어비스", "시공"];

    return { types, roles, races, dungeons, fields };
  }, []);

  // 필터링된 파티 데이터
  const filteredPartyData = useMemo(() => {
    const partyRawData = initialData.filter(
      (post) => post.type === "구인" || post.type === "구직"
    );
    return partyRawData.filter((post) => {
      if (filters.type.length > 0) {
        const mappedTypes = filters.type.map(t => t === "구인중" ? "구인" : (t === "구직중" ? "구직" : t));
        if (!mappedTypes.includes(post.type)) return false;
      }
      if (filters.role.length > 0 && !filters.role.includes(post.role)) return false;
      if (filters.race.length > 0 && !filters.race.includes(post.race)) return false;
      
      if (filters.dungeon && filters.dungeon.length > 0) {
        // post.dungeon 이 선택된 필터 항목들 중 하나를 포함하는지 확인 (예: "성역" 선택 시 "성역 1층"도 매칭되도록)
        const hasDungeon = filters.dungeon.some(d => post.dungeon && post.dungeon.includes(d));
        if (!hasDungeon) return false;
      }
      
      if (filters.keyword) {
        const lowerKeyword = filters.keyword.toLowerCase();
        const textToSearch = `${post.title || ''} ${post.description || ''} ${post.author || ''} ${post.dungeon || ''} ${post.jobClass || ''} ${post.server || ''}`.toLowerCase();
        if (!textToSearch.includes(lowerKeyword)) return false;
      }
      return true;
    });
  }, [initialData, filters]);

  // 필터링된 버스 데이터
  const filteredBusData = useMemo(() => {
    const busRawData = initialData.filter(
      (post) => post.type === "버스승객모집" || post.type === "버스기사구함"
    );
    return busRawData.filter((post) => {
      if (busFilters.type.length > 0) {
        const mappedTypes = busFilters.type.map(t => t === "승객 모집" ? "버스승객모집" : (t === "기사 구함" ? "버스기사구함" : t));
        if (!mappedTypes.includes(post.type)) return false;
      }
      if (busFilters.role.length > 0 && !busFilters.role.includes(post.role)) return false;
      if (busFilters.race.length > 0 && !busFilters.race.includes(post.race)) return false;

      if (busFilters.dungeon && busFilters.dungeon.length > 0) {
        const hasDungeon = busFilters.dungeon.some(d => post.dungeon && post.dungeon.includes(d));
        if (!hasDungeon) return false;
      }

      if (busFilters.keyword) {
        const lowerKeyword = busFilters.keyword.toLowerCase();
        const textToSearch = `${post.title || ''} ${post.description || ''} ${post.author || ''} ${post.dungeon || ''} ${post.jobClass || ''} ${post.server || ''}`.toLowerCase();
        if (!textToSearch.includes(lowerKeyword)) return false;
      }
      return true;
    });
  }, [initialData, busFilters]);

  // 최신 등록 순서로 정렬하고, 필터된 데이터로부터 파티원 모집/찾기 분류
  const recentPosts = [...filteredPartyData].slice(0, 10);
  const recruitPosts = [...filteredPartyData]
    .filter((post) => post.type === "구인")
    .slice(0, 10);
  const seekPosts = [...filteredPartyData]
    .filter((post) => post.type === "구직")
    .slice(0, 10);

  // 버스 관련 데이터
  const recentBusPosts = [...filteredBusData].slice(0, 10);
  const busPosts = [...filteredBusData]
    .filter((post) => post.type === "버스승객모집")
    .slice(0, 10);
  const busSeekPosts = [...filteredBusData]
    .filter((post) => post.type === "버스기사구함")
    .slice(0, 10);

  return (
    <>
      <HeroSearch />

      {/* 게시글 목록 영역 */}
      <div className="mx-auto max-w-6xl px-6 py-16 space-y-16 overflow-hidden">
        {/* 파티 모집 섹션 (필터) */}
        <div id="party-section" className="scroll-mt-8">
          <RecruitFilter
            onFilterChange={setFilters}
            availableOptions={partyAvailableOptions}
          >
            <div className="flex gap-3">
              <Link
                href="/recruits"
                className="rounded-full bg-cyan-600/20 px-5 py-2 text-sm font-medium text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all cursor-pointer"
              >
                모집글 전체 보기
              </Link>
              <button
                onClick={(e) => handleWriteClick(e, "/recruits/new")}
                className="rounded-full bg-cyan-500 px-5 py-2 text-sm font-bold text-gray-900 hover:bg-cyan-400 transition-all cursor-pointer"
              >
                새 글쓰기
              </button>
            </div>
          </RecruitFilter>
        </div>

        {/* 1. 최근 올라온 파티 */}
        <SliderSection
          title="최근 올라온 파티"
          posts={recentPosts}
          moreLink="/recruits"
          borderClass="border-l-4 border-cyan-400 pl-3"
          isLoading={false}
          appliedPostIds={appliedPostIds}
        />

        {/* 2. 파티원 모집 (구인) */}
        <SliderSection
          title="파티원 모집 (구인)"
          posts={recruitPosts}
          borderClass="border-l-4 border-emerald-400 pl-3"
          isLoading={false}
          appliedPostIds={appliedPostIds}
        />

        {/* 3. 파티 찾기 (구직) */}
        <SliderSection
          title="파티 찾기 (구직)"
          posts={seekPosts}
          borderClass="border-l-4 border-purple-400 pl-3"
          isLoading={false}
          appliedPostIds={appliedPostIds}
        />

        {/* 버스 모집 섹션 (필터) */}
        <div id="bus-section" className="border-t border-gray-800 pt-12 scroll-mt-8">
          <RecruitFilter
            onFilterChange={setBusFilters}
            availableOptions={busAvailableOptions}
          >
            <div className="flex gap-3">
              <Link
                href="/buses"
                className="rounded-full bg-amber-500/20 px-5 py-2 text-sm font-medium text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-all cursor-pointer"
              >
                버스글 전체 보기
              </Link>
              <button
                onClick={(e) => handleWriteClick(e, "/buses/new")}
                className="rounded-full bg-amber-500 px-5 py-2 text-sm font-bold text-gray-900 hover:bg-amber-400 transition-all cursor-pointer"
              >
                새 글쓰기
              </button>
            </div>
          </RecruitFilter>
        </div>

        {/* 4. 최근 올라온 버스 모집 */}
        <SliderSection
          title="최근 올라온 버스 모집"
          posts={recentBusPosts}
          moreLink="/buses"
          moreLinkColor="text-amber-500 hover:text-amber-400"
          borderClass="border-l-4 border-amber-500 pl-3"
          appliedPostIds={appliedPostIds}
        />

        {/* 5. 승객 모집 */}
        <SliderSection
          title="승객 모집"
          posts={busPosts}
          borderClass="border-l-4 border-blue-600 pl-3"
          appliedPostIds={appliedPostIds}
        />

        {/* 6. 기사 구함 */}
        <SliderSection
          title="기사 구함"
          posts={busSeekPosts}
          borderClass="border-l-4 border-purple-600 pl-3"
          appliedPostIds={appliedPostIds}
        />
      </div>
    </>
  );
}

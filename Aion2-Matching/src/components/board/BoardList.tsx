"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import RecruitCard from "@/components/recruit/RecruitCard";
import SkeletonCard from "@/components/common/SkeletonCard";
import { supabaseClient } from "@/lib/supabase-client";
import { Recruit, RecruitRow, isValidRecruitType, isValidRace, isValidRole } from "@/types/recruit";

const PAGE_SIZE = 20;

type BoardType = "recruits" | "buses";

type BoardListProps = {
  boardType: BoardType;
};

// 게시판 종류별 설정
const BOARD_CONFIG = {
  recruits: {
    tabs: [
      { id: "구인", label: "파티원 모집 (구인)" },
      { id: "구직", label: "파티 찾기 (구직)" },
    ],
    defaultTab: "구인",
    titleMap: {
      구인: "파티원 모집 목록",
      구직: "파티 찾기 목록",
    },
    activeColor: "bg-cyan-600 border border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]",
    appPostType: "recruit",
    hideRoleFilterOnTab: null, // 항상 직업 필터 표시
  },
  buses: {
    tabs: [
      { id: "버스승객모집", label: "승객 모집" },
      { id: "버스기사구함", label: "기사 구함" },
    ],
    defaultTab: "버스승객모집",
    titleMap: {
      버스승객모집: "버스 승객 모집 목록",
      버스기사구함: "버스 기사 구함 목록",
    },
    activeColor: "bg-amber-600 border border-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]",
    appPostType: "bus",
    hideRoleFilterOnTab: "버스승객모집", // 버스승객모집일 때는 직업 필터 숨김
  },
};

export default function BoardList({ boardType }: BoardListProps) {
  const config = BOARD_CONFIG[boardType];
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") || "";

  const [activeTab, setActiveTab] = useState(config.defaultTab);
  const [selectedRace, setSelectedRace] = useState("전체");
  const [selectedRole, setSelectedRole] = useState("전체");

  const [posts, setPosts] = useState<Recruit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [appliedPostIds, setAppliedPostIds] = useState<Set<number>>(new Set());

  const fetchPosts = useCallback(async (currentPage: number, reset: boolean) => {
    try {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      const { data: sessionData } = await supabaseClient.auth.getSession();
      const user = sessionData?.session?.user || null;

      let query = supabaseClient
        .from(boardType)
        .select('*', { count: 'exact' });

      // 필터 적용
      if (boardType === "recruits") {
        if (activeTab !== "전체") {
          query = query.eq('type', activeTab);
        }
      } else {
        // buses는 '전체' 탭이 없으므로 무조건 조건 걸기
        query = query.eq('type', activeTab);
      }
      
      if (selectedRace !== "전체") {
        query = query.eq('race', selectedRace);
      }
      
      // 직업 필터 적용 (hideRoleFilterOnTab 조건일 때는 적용 안함)
      if (config.hideRoleFilterOnTab !== activeTab && selectedRole !== "전체") {
        const ALLOWED_ROLES = ["탱커", "딜러", "힐러"];
        if (ALLOWED_ROLES.includes(selectedRole)) {
          query = query.or(`role.eq.${selectedRole},jobclass.eq.${selectedRole}`);
        }
      }

      // 키워드 검색 적용
      if (keyword) {
        const sanitizedKeyword = keyword.replace(/[%_]/g, '\\$&');
        const columns = ['title', 'description', 'author', 'dungeon', 'jobclass', 'server'];
        const orQuery = columns.map(col => `${col}.ilike.%${sanitizedKeyword}%`).join(',');
        query = query.or(orQuery);
      }

      // 페이지네이션 적용
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error("데이터를 불러오지 못했습니다.", error);
      } else if (data) {
        const mappedData = data.map((item: RecruitRow) => ({
          ...item,
          type: isValidRecruitType(item.type) ? item.type : "구인",
          race: isValidRace(item.race) ? item.race : "천족",
          role: isValidRole(item.role) ? item.role : item.role,
          jobClass: item.jobclass,
          is_verified: item.is_verified ?? false,
          user_id: item.user_id ?? undefined,
          description: item.description ?? undefined,
          char_profileimage: item.char_profileimage ?? undefined,
          createdAt: new Date(item.created_at)
        }));

        if (reset) {
          setPosts(mappedData);
        } else {
          setPosts(prev => [...prev, ...mappedData]);
        }

        if (count !== null) {
          setHasMore(to < count - 1);
        } else {
          setHasMore(data.length === PAGE_SIZE);
        }
      }

      if (user) {
        const { data: appData } = await supabaseClient
          .from('applications')
          .select('post_id')
          .eq('applicant_id', user.id)
          .eq('post_type', config.appPostType);
        if (appData) {
          setAppliedPostIds(new Set(appData.map(a => a.post_id)));
        }
      }
    } catch (err) {
      console.error('Unhandled fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [boardType, activeTab, selectedRace, selectedRole, keyword, config.appPostType, config.hideRoleFilterOnTab]);

  // 필터 변경 시 리셋
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(0);
     
    setHasMore(true);
    fetchPosts(0, true);
  }, [fetchPosts]);

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, false);
    }
  };

  const showRoleFilter = config.hideRoleFilterOnTab !== activeTab;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* 빠른 이동 메뉴 */}
      <div className="mb-8">
        <div className="bg-gray-900/50 rounded-xl shadow-lg border border-gray-800 p-4 flex gap-4 backdrop-blur-sm">
          <Link
            href="/recruits"
            className="flex-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 py-3.5 font-bold text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)] transition-all hover:bg-cyan-500 hover:text-gray-900 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center gap-2 group"
          >
            <span className="group-hover:scale-110 transition-transform">⚔️</span> 파티 모집 바로가기
          </Link>
          
          <Link
            href="/buses"
            className="flex-1 rounded-xl bg-amber-500/10 border border-amber-500/30 py-3.5 font-bold text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.1)] transition-all hover:bg-amber-500 hover:text-gray-900 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center justify-center gap-2 group"
          >
            <span className="group-hover:scale-110 transition-transform">🚌</span> 버스 매칭 바로가기
          </Link>
        </div>
      </div>

      {/* === 탭 버튼 영역 시작 === */}
      <div className="flex space-x-2 border-b-2 border-gray-800 mb-6 pb-2">
        {config.tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 font-bold rounded-t-lg transition-all ${
              activeTab === tab.id
                ? config.activeColor
                : "bg-gray-900 border border-gray-800 border-b-0 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* === 탭 버튼 영역 끝 === */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">
          {(config.titleMap as Record<string, string>)[activeTab] || ""}
        </h1>
        <div className="flex gap-2 items-center">
          {boardType === "buses" ? (
            <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
              <button
                onClick={() => setSelectedRace("전체")}
                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${
                  selectedRace === "전체"
                    ? "bg-gray-700 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setSelectedRace("천족")}
                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${
                  selectedRace === "천족"
                    ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                    : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
                }`}
              >
                천족
              </button>
              <button
                onClick={() => setSelectedRace("마족")}
                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${
                  selectedRace === "마족"
                    ? "bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                    : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
                }`}
              >
                마족
              </button>
            </div>
          ) : (
            <select
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value)}
              className="rounded-lg border border-gray-800 bg-gray-900 text-gray-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            >
              <option value="전체">모든종족</option>
              <option value="천족">천족</option>
              <option value="마족">마족</option>
            </select>
          )}

          {showRoleFilter && (
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className={`rounded-lg border border-gray-800 bg-gray-900 text-gray-300 px-3 py-2 text-sm outline-none transition-all ${
                boardType === "buses" ? "focus:border-amber-500 focus:ring-1 focus:ring-amber-500" : "focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              }`}
            >
              <option value="전체">모든 역할군</option>
              <option value="탱커">탱커</option>
              <option value="딜러">딜러</option>
              <option value="힐러">힐러</option>
            </select>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          조건에 맞는 모집글이 없습니다.
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <RecruitCard
                key={post.id}
                id={post.id}
                title={post.title}
                author={post.author}
                race={post.race}
                server={post.server}
                role={post.role}
                jobClass={post.jobClass}
                dungeon={post.dungeon}
                time={post.time}
                status={post.status}
                type={post.type}
                isVerified={post.is_verified}
                hasApplied={appliedPostIds.has(post.id)}
                createdAt={post.createdAt}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isFetchingMore}
                className="px-8 py-3 bg-gray-900 border border-gray-800 text-gray-400 font-bold rounded-full shadow-sm hover:bg-gray-800 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50 transition-all"
              >
                {isFetchingMore ? "불러오는 중..." : "더보기"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

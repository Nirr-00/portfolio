"use client";

import { useState, useEffect, useCallback } from "react";
import RecruitCard from "@/components/recruit/RecruitCard";
import SkeletonCard from "@/components/common/SkeletonCard";
import { supabaseClient } from "@/lib/supabase-client";
import { Recruit, RecruitRow, isValidRecruitType, isValidRace, isValidRole } from "@/types/recruit";

const PAGE_SIZE = 20;

export default function MyPostList() {
  const [activeTab, setActiveTab] = useState<"recruits" | "buses">("recruits");
  const [posts, setPosts] = useState<Recruit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchMyPosts = useCallback(async (currentPage: number, reset: boolean) => {
    try {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      const { data: sessionData } = await supabaseClient.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        setPosts([]);
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabaseClient
        .from(activeTab)
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
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
    } catch (err) {
      console.error('Unhandled fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [activeTab]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(0);
    setHasMore(true);
    fetchMyPosts(0, true);
  }, [fetchMyPosts]);

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMyPosts(nextPage, false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">작성글</h1>
      </div>

      {/* === 탭 버튼 영역 시작 === */}
      <div className="flex space-x-2 border-b-2 border-gray-200 mb-6 pb-2">
        <button
          onClick={() => setActiveTab("recruits")}
          className={`px-6 py-2 font-bold rounded-t-lg transition-colors ${
            activeTab === "recruits"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          파티 매칭
        </button>
        <button
          onClick={() => setActiveTab("buses")}
          className={`px-6 py-2 font-bold rounded-t-lg transition-colors ${
            activeTab === "buses"
              ? "bg-amber-600 text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          버스 매칭
        </button>
      </div>
      {/* === 탭 버튼 영역 끝 === */}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          작성한 글이 없습니다.
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
                hasApplied={false}
                createdAt={post.createdAt}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isFetchingMore}
                className="px-8 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-full shadow-sm hover:bg-gray-50 hover:shadow disabled:opacity-50 transition-all"
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

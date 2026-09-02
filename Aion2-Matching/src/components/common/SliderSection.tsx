"use client";

import Link from "next/link";
import { useRef } from "react";
import RecruitCard from "../recruit/RecruitCard";
import { Recruit } from "@/types/recruit";

type SliderSectionProps = {
  title: string;
  posts: Recruit[];
  moreLink?: string;
  moreLinkColor?: string;
  borderClass?: string;
  rightElement?: React.ReactNode;
  isLoading?: boolean;
  appliedPostIds?: Set<number>;
};

/**
 * 가로 스크롤 가능한 캐러셀 형태의 게시글 목록 섹션
 */
export default function SliderSection({
  title,
  posts,
  moreLink,
  moreLinkColor,
  borderClass,
  rightElement,
  isLoading,
  appliedPostIds,
}: SliderSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 화살표 클릭 시 가로로 스크롤 이동
  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 350; // 카드 한 장 너비 정도 이동
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section>
      {/* 섹션 제목 및 더보기 버튼 */}
      <div className="mb-6 flex items-end justify-between">
        <h2 className={`text-2xl font-bold text-gray-200 md:text-3xl ${borderClass || ""}`}>
          {title}
        </h2>
        {rightElement ? (
          rightElement
        ) : (
          moreLink && (
            <Link href={moreLink} className={`text-sm font-medium transition-colors hover:underline ${moreLinkColor || "text-cyan-400 hover:text-cyan-300"}`}>
              더보기 &rarr;
            </Link>
          )
        )}
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-gray-500 border border-gray-800 border-dashed rounded-2xl bg-gray-900/30">
          불러오는 중...
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center text-gray-500 border border-gray-800 border-dashed rounded-2xl bg-gray-900/30">
          아직 등록된 모집글이 없습니다.
        </div>
      ) : (
        <div className="relative group/slider">
          {/* 왼쪽 화살표 (마우스 올렸을 때만 표시) */}
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 hidden h-11 w-11 items-center justify-center rounded-full bg-gray-800 border border-gray-700 text-gray-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition hover:bg-gray-700 hover:text-white group-hover/slider:flex"
            aria-label="이전 항목 보기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* 스크롤되는 카드 컨테이너 */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory px-4 pb-8 pt-4 hide-scrollbar"
          >
            {posts.map((post) => (
              <div key={post.id} className="min-w-[300px] max-w-[320px] flex-shrink-0 snap-start">
                <RecruitCard
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
                  hasApplied={appliedPostIds?.has(post.id)}
                  createdAt={post.createdAt}
                />
              </div>
            ))}
          </div>

          {/* 오른쪽 화살표 (마우스 올렸을 때만 표시) */}
          <button
            onClick={() => handleScroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 hidden h-11 w-11 items-center justify-center rounded-full bg-gray-800 border border-gray-700 text-gray-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition hover:bg-gray-700 hover:text-white group-hover/slider:flex"
            aria-label="다음 항목 보기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}

import Header from "@/components/common/Header";
import SkeletonCard from "@/components/common/SkeletonCard";

export default function Loading() {
  return (
    <>
      <Header />
      <main>
        {/* 히어로 검색 영역 스켈레톤 (단순화된 형태) */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-900 py-20 animate-pulse">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <div className="h-10 bg-gray-700/50 rounded-lg w-3/4 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-700/50 rounded-lg w-1/2 mx-auto mb-10"></div>
            <div className="h-14 bg-gray-700/50 rounded-2xl w-full max-w-2xl mx-auto border border-gray-600/50"></div>
          </div>
        </section>

        {/* 본문 콘텐츠 스켈레톤 */}
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

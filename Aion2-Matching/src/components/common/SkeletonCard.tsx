export default function SkeletonCard() {
  return (
    <div className="relative flex flex-col h-full rounded-xl border border-gray-200 p-5 shadow-sm bg-white animate-pulse min-h-[200px]">
      {/* 왼쪽 위 등록 시간 배지 스켈레톤 */}
      <div className="absolute top-3 left-3 bg-gray-200 rounded-md w-24 h-6 z-10"></div>

      <div className="flex-1 min-w-0">
        {/* 제목 스켈레톤 */}
        <div className="mb-4 mt-8 h-6 bg-gray-200 rounded-md w-3/4"></div>
        
        {/* 본문 텍스트 라인 스켈레톤 */}
        <div className="space-y-2 mt-4">
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
          <div className="h-4 bg-gray-100 rounded w-4/6"></div>
        </div>
      </div>

      {/* 하단 상태 태그 영역 스켈레톤 */}
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        <div className="ml-auto h-7 bg-gray-300 rounded-lg w-16"></div>
      </div>
    </div>
  );
}

import Header from "@/components/common/Header";
import SkeletonCard from "@/components/common/SkeletonCard";

export default function Loading() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="h-10 bg-gray-800 rounded-lg w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-800 rounded-lg w-32 animate-pulse"></div>
        </div>
        <div className="mb-6 h-14 bg-gray-800 rounded-xl w-full animate-pulse border border-gray-700/50"></div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </main>
    </>
  );
}

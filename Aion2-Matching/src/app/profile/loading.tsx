import Header from "@/components/common/Header";

export default function Loading() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold text-white">내 프로필</h1>
        
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 shadow-xl animate-pulse">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="h-28 w-28 rounded-2xl bg-gray-800"></div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-800 rounded w-48"></div>
              <div className="h-4 bg-gray-800 rounded w-32"></div>
              <div className="h-4 bg-gray-800 rounded w-full max-w-md"></div>
              <div className="h-10 bg-gray-800 rounded w-32 mt-4"></div>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-6">
          <div className="h-8 bg-gray-800 rounded w-48"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-800 rounded-xl w-full"></div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

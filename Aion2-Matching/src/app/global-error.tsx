"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 max-w-lg w-full shadow-sm">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              치명적인 시스템 오류
            </h2>
            <p className="text-gray-600 mb-8">
              애플리케이션 전체에 영향을 미치는 오류가 발생했습니다.<br/>
              문제가 지속되면 관리자에게 문의해 주세요.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => reset()}
                className="bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition"
              >
                다시 시도하기
              </button>
              <Link 
                href="/"
                className="bg-white border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition"
                onClick={() => window.location.href = '/'}
              >
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

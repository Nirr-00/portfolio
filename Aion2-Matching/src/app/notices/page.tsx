"use client";

import Header from "@/components/common/Header";

interface Notice {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  author: string;
}

const noticeData: Notice[] = [
  {
    id: 1,
    title: "아이온2 매칭 서비스 오픈!",
    content: "아이온2 파티 매칭 서비스가 오픈되었습니다.",
    createdAt: new Date(2026, 5, 20, 10, 0),
    author: "관리자",
  },
  {
    id: 2,
    title: "필터 기능 추가 안내",
    content: "메인 페이지에서 전체 필터 기능을 사용할 수 있습니다.",
    createdAt: new Date(2026, 5, 19, 14, 30),
    author: "관리자",
  },
];

import { formatDate } from "@/utils/dateUtils";

export default function NoticePage() {

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold">공지사항</h1>

        {/* 공지사항 목록 */}
        <div className="space-y-4">
          {noticeData.map((notice) => (
            <div
              key={notice.id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="mb-2 text-lg font-semibold text-gray-900">
                    {notice.title}
                  </h2>
                  <p className="mb-3 text-gray-600">{notice.content}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{formatDate(notice.createdAt)}</p>
                  <p className="mt-1">{notice.author}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

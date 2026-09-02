"use client";

import Header from "@/components/common/Header";
import BoardList from "@/components/board/BoardList";
import { Suspense } from "react";

export default function RecruitsPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="py-20 text-center">로딩 중...</div>}>
        <BoardList boardType="recruits" />
      </Suspense>
    </>
  );
}
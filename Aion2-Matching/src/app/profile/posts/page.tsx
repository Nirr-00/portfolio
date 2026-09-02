"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import MyPostList from "@/components/profile/MyPostList";
import { supabaseClient } from "@/lib/supabase-client";

export default function MyPostsPage() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        alert("로그인이 필요한 페이지입니다.");
        router.replace("/login");
      } else {
        setIsAuthChecking(false);
      }
    });
  }, [router]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <MyPostList />
      </main>
    </div>
  );
}

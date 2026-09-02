"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";
import { useDialog } from "@/contexts/DialogContext";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { showAlert } = useDialog();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      await showAlert("데이터베이스(Supabase) 설정이 완료되지 않았습니다. 개발자에게 문의하세요.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
      } else {
        // 로그인 성공, 메인 페이지로 이동
        router.push("/");
        router.refresh(); // 헤더 업데이트를 위해 리프레시
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/">
          <h2 className="text-center text-3xl font-extrabold text-cyan-400 hover:text-cyan-300 transition" style={{ textShadow: '0 0 10px rgba(34,211,238,0.5)' }}>
            아이온2 매칭
          </h2>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold text-white">
          계정에 로그인하세요
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-800">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-300">이메일 주소</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
                  placeholder="hello@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">비밀번호</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-red-400 text-sm text-center font-medium bg-red-900/30 p-2 rounded border border-red-900/50">
                {errorMsg}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-bold text-gray-900 bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? "로그인 중..." : "로그인"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">계정이 없으신가요?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/signup">
                <button
                  type="button"
                  className="w-full flex justify-center py-2.5 px-4 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white focus:outline-none transition-colors"
                >
                  새 계정 만들기
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

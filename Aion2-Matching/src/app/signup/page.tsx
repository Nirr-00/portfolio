"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";
import { useToast } from "@/contexts/ToastContext";
import { useDialog } from "@/contexts/DialogContext";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { toast } = useToast();
  const { showAlert } = useDialog();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password || !nickname) {
      setErrorMsg("모든 항목을 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      await showAlert("데이터베이스(Supabase) 설정이 완료되지 않았습니다. 개발자에게 문의하세요.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname: nickname, // 메타데이터에 닉네임 저장
          }
        }
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        toast("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
        router.push("/login");
      }
    } catch (err) {
      console.error("Signup error:", err);
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
          새 계정 만들기
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-800">
          <form className="space-y-6" onSubmit={handleSignup}>
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
              <label className="block text-sm font-medium text-gray-300">닉네임</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
                  placeholder="사이트에서 사용할 닉네임"
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
                  placeholder="6자 이상 입력"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">비밀번호 확인</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
                  placeholder="비밀번호 다시 입력"
                  minLength={6}
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
                {isLoading ? "가입하는 중..." : "회원가입"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">이미 계정이 있으신가요?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/login">
                <button
                  type="button"
                  className="w-full flex justify-center py-2.5 px-4 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white focus:outline-none transition-colors"
                >
                  로그인하러 가기
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

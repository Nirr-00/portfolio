"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { supabaseClient } from "@/lib/supabase-client";

export default function Header() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [nickname, setNickname] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      router.push(`/recruits?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  useEffect(() => {
    // 현재 세션 가져오기
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.user_metadata?.nickname) {
        setNickname(session.user.user_metadata.nickname);
      }
    });

    // 로그인/로그아웃 상태 변화 감지
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.user_metadata?.nickname) {
        setNickname(session.user.user_metadata.nickname);
      } else {
        setNickname("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    setIsMobileMenuOpen(false);
    router.refresh();
  };

  return (
    <header className="sticky top-0 border-b border-gray-800 bg-gray-950/80 backdrop-blur-lg text-gray-200 z-40 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-white drop-shadow-md">
              AION2 <span className="text-cyan-400">MATCHING</span>
            </span>
          </Link>

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden md:flex gap-8 text-sm font-semibold items-center">
            <Link href="/" className="relative py-1 text-white transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-center after:scale-x-0 after:bg-white after:shadow-[0_0_8px_rgba(255,255,255,0.8)] after:transition-transform hover:after:scale-x-100">홈</Link>
            <Link href="/recruits" className="relative py-1 hover:text-cyan-400 transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-center after:scale-x-0 after:bg-cyan-400 after:shadow-[0_0_8px_rgba(34,211,238,0.8)] after:transition-transform hover:after:scale-x-100">파티매칭</Link>
            <Link href="/buses" className="relative py-1 hover:text-amber-400 transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-center after:scale-x-0 after:bg-amber-400 after:shadow-[0_0_8px_rgba(251,191,36,0.8)] after:transition-transform hover:after:scale-x-100">버스매칭</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium">
          {/* Header Search */}
          <form 
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center bg-gray-800/60 rounded-full px-4 py-1.5 border border-gray-700 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all"
          >
            <input 
              type="text" 
              placeholder="파티/키워드 검색" 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="bg-transparent text-gray-200 text-sm outline-none w-40 placeholder-gray-500"
            />
            <button type="submit" aria-label="검색">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {session ? (
            <>
              <span className="text-gray-400 hidden sm:flex items-center gap-2">
                <span className="text-white font-bold">{nickname || session.user.email}</span>님
              </span>
              <Link 
                href="/profile/posts"
                className="hidden md:block hover:text-cyan-400 px-3 py-2 transition-colors text-sm font-medium"
                title="작성글"
              >
                작성글
              </Link>
              <Link 
                href="/profile" 
                className="hidden md:block hover:text-cyan-400 px-3 py-2 transition-colors text-sm font-medium"
                title="프로필"
              >
                프로필
              </Link>
              <button 
                onClick={handleLogout}
                className="hidden md:block border border-gray-700 hover:bg-gray-800 px-4 py-1.5 rounded-full transition-colors cursor-pointer text-gray-300"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden md:block border border-gray-700 hover:bg-gray-800 px-5 py-1.5 rounded-full transition-colors text-gray-300">
                로그인
              </Link>
              <Link 
                href="/signup" 
                className="hidden md:block bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500 hover:text-gray-900 px-5 py-1.5 rounded-full font-bold transition-all shadow-[0_0_10px_rgba(34,211,238,0.2)] hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]"
              >
                회원가입
              </Link>
            </>
          )}

          {/* 모바일 햄버거 메뉴 버튼 */}
          <button 
            className="md:hidden p-2 text-gray-400 hover:text-white focus:outline-none cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="메뉴 열기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900 border-b border-gray-800 shadow-lg z-50">
          <nav className="flex flex-col px-6 py-4 gap-4 text-sm font-medium">
            {session && (
              <div className="pb-3 border-b border-gray-800 mb-1 flex items-center gap-2">
                <span className="text-white font-bold">{nickname || session.user.email}</span>
                <span className="text-gray-400">님 환영합니다!</span>
              </div>
            )}
            
            <Link href="/" className="hover:text-cyan-400 py-2 transition" onClick={() => setIsMobileMenuOpen(false)}>홈</Link>
            <Link href="/recruits" className="hover:text-cyan-400 py-2 transition" onClick={() => setIsMobileMenuOpen(false)}>파티 매칭</Link>
            <Link href="/buses" className="hover:text-amber-400 py-2 transition" onClick={() => setIsMobileMenuOpen(false)}>버스매칭</Link>
            
            <div className="pt-3 border-t border-gray-800 mt-1 flex flex-col gap-3">
              {session ? (
                <>
                  <Link 
                    href="/profile/posts" 
                    className="flex items-center gap-2 py-2 text-gray-400 hover:text-white transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                      <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    작성글
                  </Link>
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-2 py-2 text-gray-400 hover:text-white transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    프로필
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-left py-2 text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="py-2 text-gray-400 hover:text-white transition" onClick={() => setIsMobileMenuOpen(false)}>
                    로그인
                  </Link>
                  <Link 
                    href="/signup" 
                    className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 px-4 py-2 rounded-lg text-center font-bold transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

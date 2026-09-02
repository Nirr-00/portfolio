"use client";

import { useState, useRef, useEffect } from "react";

import Image from "next/image";
import { SERVER_LIST } from "@/constants/servers";
import { CharacterSearchResult } from "@/types/character";
import { useDialog } from "@/contexts/DialogContext";

/**
 * 메인 페이지 상단의 히어로 배너 및 전적 검색 컴포넌트
 */
export default function HeroSearch() {
  const [searchRace, setSearchRace] = useState("천족");
  const [searchServer, setSearchServer] = useState("전체");
  const [searchNickname, setSearchNickname] = useState("");
  const [searchResult, setSearchResult] = useState<CharacterSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { showAlert } = useDialog();

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 바깥 영역 클릭 시 검색 결과창 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchResult(null);
        setIsSearching(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRaceSelect = (race: string) => {
    setSearchRace(race);
    setSearchServer("전체"); // 종족 변경 시 서버 선택 초기화
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchNickname.trim()) {
      await showAlert("검색할 캐릭터 닉네임을 입력해주세요!");
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      const queryParams = new URLSearchParams({
        nickname: searchNickname,
        race: searchRace,
        server: searchServer
      });

      const res = await fetch(`/api/character?${queryParams.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        await showAlert(data.error || "캐릭터를 찾을 수 없거나 서버 오류가 발생했습니다.");
        setIsSearching(false);
        return;
      }

      setSearchResult({
        nickname: data.nickname,
        race: data.race,
        server: data.server,
        jobClass: data.jobClass,
        itemLevel: data.itemLevel,
        combatPower: data.combatPower,
        rank: data.rank,
        profileImage: data.profileImage,
        level: data.level
      });
    } catch (err) {
      console.error(err);
      await showAlert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="py-12 text-center text-gray-200 border-b border-gray-800/50 bg-gray-900/40">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="mb-4 text-3xl font-extrabold md:text-5xl text-white drop-shadow-lg">
          아이온2 파티 매칭의 모든 것
        </h1>
        <p className="mb-10 text-base text-gray-400 md:text-lg">
          어비스, 레이드, 인던 어디든 함께할 든든한 동료를 가장 빠르게 찾아보세요.
        </p>

        {/* 캐릭터 검색 창 (2줄 레이아웃 + 플로팅 결과) */}
        <div ref={searchContainerRef} className="relative mx-auto max-w-2xl text-left z-30">
          <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-gray-700/50">
            <form onSubmit={handleSearch} className="flex flex-col gap-4">
              {/* 1번째 줄: 종족 & 서버 선택 */}
              <div className="flex gap-4">
                {/* 종족 선택 (버튼) */}
                <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-600">
                  <button
                    type="button"
                    onClick={() => handleRaceSelect("천족")}
                    className={`px-6 py-2 text-sm font-bold rounded-md transition-all border cursor-pointer ${
                      searchRace === "천족"
                        ? "text-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)] border-blue-600 hover:bg-blue-600/10 hover:text-blue-400"
                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 border-transparent"
                    }`}
                  >
                    천족
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRaceSelect("마족")}
                    className={`px-6 py-2 text-sm font-bold rounded-md transition-all border cursor-pointer ${
                      searchRace === "마족"
                        ? "text-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.3)] border-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 border-transparent"
                    }`}
                  >
                    마족
                  </button>
                </div>

                {/* 서버 선택 */}
                <select
                  aria-label="서버 선택"
                  value={searchServer}
                  onChange={(e) => setSearchServer(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 hover:border-gray-400 hover:bg-gray-700/80 transition-all cursor-pointer"
                >
                  <option value="전체" className="bg-gray-800 text-gray-400">모든 서버</option>
                  {SERVER_LIST[searchRace]?.map((server) => (
                    <option key={server} value={server} className="bg-gray-800 text-white">
                      {server}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2번째 줄: 닉네임 검색 */}
              <div className="flex overflow-hidden rounded-lg bg-gray-800 border border-gray-600 shadow-inner focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 hover:border-gray-500 transition-all">
                <input
                  type="text"
                  aria-label="캐릭터 닉네임"
                  value={searchNickname}
                  onChange={(e) => setSearchNickname(e.target.value)}
                  disabled={searchServer === "전체"}
                  placeholder={searchServer === "전체" ? "서버를 먼저 선택해주세요" : "캐릭터 닉네임"}
                  className="w-full flex-1 bg-transparent px-6 py-4 text-white outline-none placeholder:text-gray-400 text-lg disabled:text-gray-500 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={searchServer === "전체"}
                  className="flex items-center justify-center bg-cyan-500/40 text-cyan-300 border-l border-gray-700/50 px-8 py-4 font-bold transition hover:bg-cyan-400 hover:text-gray-900 text-lg disabled:hover:bg-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  검색
                </button>
              </div>
            </form>
          </div>

          {/* 검색 중 로딩 */}
          {isSearching && (
            <div className="absolute top-full left-0 right-0 mt-4 bg-gray-900/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-700 z-50">
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-500 border-t-transparent"></div>
              </div>
            </div>
          )}

          {/* 검색 결과 표시 영역 (플로팅) */}
          {!isSearching && searchResult && (
            <div className="absolute top-full left-0 right-0 mt-4 bg-gray-900/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700 text-left animate-fade-in z-50">
              <div className="flex items-center gap-6">
                {/* 아바타 */}
                <div className={`h-24 w-24 rounded-full p-1 flex-shrink-0 bg-gradient-to-tr ${
                  searchResult.race === "천족" 
                    ? "from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    : "from-purple-400 to-fuchsia-600 shadow-[0_0_15px_rgba(192,132,252,0.3)]"
                }`}>
                  <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center border-2 border-gray-800 overflow-hidden">
                    {searchResult.profileImage ? (
                      <Image src={searchResult.profileImage} alt={searchResult.nickname} width={100} height={100} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">👤</span>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded ${searchResult.race === "천족" ? "bg-blue-600/20 text-blue-600 border border-blue-600/30" : "bg-purple-500/20 text-purple-400 border border-purple-500/30"}`}>
                      {searchResult.race}
                    </span>
                    <span className="text-gray-400 text-sm font-medium">{searchResult.server}</span>
                  </div>
                  <h3 className="text-3xl font-extrabold text-white mb-1 flex items-end gap-3">
                    {searchResult.nickname}
                    <span className="text-lg font-normal text-gray-500">
                      (Lv.{searchResult.level} {searchResult.jobClass})
                    </span>
                  </h3>
                </div>
              </div>

              {/* 능력치 카드 */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-800/80 rounded-xl p-5 border border-gray-700 shadow-inner">
                  <p className="text-sm text-gray-400 mb-1">아이템 레벨</p>
                  <p className="text-3xl font-bold text-white tracking-tight">Lv. {searchResult.itemLevel}</p>
                </div>
                <div className="bg-gray-800/80 rounded-xl p-5 border border-gray-700 shadow-inner">
                  <p className="text-sm text-gray-400 mb-1">종합 전투력</p>
                  <p className={`text-3xl font-bold tracking-tight ${
                    searchResult.race === "천족" ? "text-cyan-400" : "text-purple-400"
                  }`}>
                    {searchResult.combatPower.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";

import Image from "next/image";
import { SERVER_LIST } from "@/constants/servers";
import { CharacterSearchResult } from "@/types/character";
import { useDialog } from "@/contexts/DialogContext";

export default function GlobalSearchSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchRace, setSearchRace] = useState("천족");
  const [searchServer, setSearchServer] = useState("전체");
  const [searchNickname, setSearchNickname] = useState("");
  const [searchResult, setSearchResult] = useState<CharacterSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { showAlert } = useDialog();

  const handleRaceSelect = (race: string) => {
    setSearchRace(race);
    setSearchServer("전체");
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
    <>
      {/* 닫혀있을 때 화면 왼쪽에 살짝 보이는 열기 버튼 */}
      <div 
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-[60] transition-transform duration-300 ${isOpen ? '-translate-x-full' : 'translate-x-0'}`}
      >
        <button 
          onClick={() => setIsOpen(true)}
          aria-label="사이드바 열기"
          className="bg-gray-900/90 text-white p-3 py-6 rounded-r-2xl shadow-2xl border-y border-r border-white/20 hover:bg-gray-800 transition-colors flex flex-col items-center gap-2 group backdrop-blur-md"
        >
          <span className="writing-vertical text-sm font-bold opacity-70 group-hover:opacity-100">캐릭터 검색</span>
        </button>
      </div>

      {/* 사이드바 본체 */}
      <div 
        className={`fixed top-1/2 left-0 -translate-y-1/2 h-[540px] max-h-[90vh] w-full sm:w-[340px] bg-gray-900/95 backdrop-blur-2xl shadow-2xl z-[80] border-y border-r border-white/10 rounded-r-2xl transition-transform duration-300 overflow-y-auto flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            캐릭터 검색
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            aria-label="사이드바 닫기"
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 폼 및 결과 컨텐츠 */}
        <div className="p-5 flex flex-col gap-5">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleRaceSelect("천족")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all border cursor-pointer ${
                  searchRace === "천족"
                    ? "bg-gray-800 text-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)] border-blue-600"
                    : "bg-white/5 text-gray-400 border-transparent hover:bg-white/10"
                }`}
              >
                천족
              </button>
              <button
                type="button"
                onClick={() => handleRaceSelect("마족")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all border cursor-pointer ${
                  searchRace === "마족"
                    ? "bg-gray-800 text-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.3)] border-purple-400"
                    : "bg-white/5 text-gray-400 border-transparent hover:bg-white/10"
                }`}
              >
                마족
              </button>
            </div>
            
            <select 
              aria-label="서버 선택"
              value={searchServer}
              onChange={(e) => setSearchServer(e.target.value)}
              className="w-full rounded-lg border border-gray-700/50 bg-gray-900/60 backdrop-blur-md px-4 py-3 text-white outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all appearance-none cursor-pointer"
            >
              <option value="전체" className="bg-gray-800 text-gray-400">모든 서버</option>
              {SERVER_LIST[searchRace]?.map((server) => (
                <option key={server} value={server} className="bg-gray-800 text-white">
                  {server}
                </option>
              ))}
            </select>

            <div className="flex overflow-hidden rounded-lg bg-gray-900/60 border border-gray-700/50 backdrop-blur-md focus-within:border-cyan-500/50 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all">
              <input
                type="text"
                aria-label="캐릭터 닉네임"
                value={searchNickname}
                onChange={(e) => setSearchNickname(e.target.value)}
                disabled={searchServer === "전체"}
                placeholder={searchServer === "전체" ? "서버를 먼저 선택해주세요" : "캐릭터 닉네임"}
                className="w-full flex-1 bg-transparent px-4 py-3 text-white outline-none placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={searchServer === "전체"}
                className="flex items-center justify-center bg-cyan-500/40 text-cyan-300 border-l border-gray-700/50 px-4 py-3 font-bold transition hover:bg-cyan-400 hover:text-gray-900 shrink-0 disabled:hover:bg-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                검색
              </button>
            </div>
          </form>

          {isSearching && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent"></div>
            </div>
          )}

          {!isSearching && searchResult && (
            <div className="mt-4 animate-fade-in flex flex-col gap-6">
              <div className="flex items-center gap-5">
                <div className={`h-20 w-20 rounded-full p-1 shrink-0 bg-gradient-to-tr ${
                  searchResult.race === "천족"
                    ? "from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    : "from-purple-400 to-fuchsia-600 shadow-[0_0_15px_rgba(192,132,252,0.3)]"
                }`}>
                  <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center border border-white/20 overflow-hidden">
                    {searchResult.profileImage ? (
                      <Image src={searchResult.profileImage} alt={searchResult.nickname} width={80} height={80} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">👤</span>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${searchResult.race === "천족" ? "bg-blue-600/20 text-blue-500 border border-blue-600/30" : "bg-purple-500/20 text-purple-300 border border-purple-500/30"}`}>
                      {searchResult.race}
                    </span>
                    <span className="text-gray-400 text-xs font-medium truncate">{searchResult.server}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2 truncate">
                    {searchResult.nickname}
                  </h3>
                  <p className="text-gray-300 text-sm mt-1">
                    Lv.{searchResult.level} {searchResult.jobClass}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 rounded-xl p-4 border border-white/10 text-center shadow-inner">
                  <p className="text-xs text-gray-400 mb-1">아이템 레벨</p>
                  <p className="text-2xl font-bold text-white tracking-tight">Lv.{searchResult.itemLevel}</p>
                </div>
                <div className="bg-black/40 rounded-xl p-4 border border-white/10 text-center shadow-inner">
                  <p className="text-xs text-gray-400 mb-1">종합 전투력</p>
                  <p className={`text-2xl font-bold tracking-tight ${
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
    </>
  );
}

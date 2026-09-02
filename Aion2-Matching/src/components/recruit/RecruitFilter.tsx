"use client";

import { useState } from "react";

export interface FilterState {
  type: string[];
  race: string[];
  role: string[];
  dungeon: string[];
  keyword: string;
}

interface RecruitFilterProps {
  onFilterChange: (filters: FilterState) => void;
  // 부모로부터 받는 옵션 목록 구조도 필요한 항목만 남깁니다.
  availableOptions: {
    types: string[];
    races: string[];
    roles: string[];
    dungeons: string[];
    fields?: string[];
  };
  children?: React.ReactNode;
}

export default function RecruitFilter({ onFilterChange, availableOptions, children }: RecruitFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    race: [],
    role: [],
    dungeon: [],
    keyword: "",
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleCheckboxChange = (category: keyof Omit<FilterState, "keyword">, value: string) => {
    setFilters((prev) => {
      const updated = { ...prev };
      if (updated[category].includes(value)) {
        updated[category] = updated[category].filter((item) => item !== value);
      } else {
        updated[category] = [...updated[category], value];
      }
      return updated;
    });
  };

  const handleKeywordChange = (value: string) => {
    setFilters((prev) => {
      return { ...prev, keyword: value };
    });
  };

  const handleApply = () => {
    onFilterChange(filters);
  };

  // 3. 리셋 함수에서도 불필요한 속성들을 완벽히 제거했습니다.
  const handleReset = () => {
    const emptyFilters: FilterState = {
      type: [],
      race: [],
      role: [],
      dungeon: [],
      keyword: "",
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="mb-8">
      {/* 상단 정렬 맞춤 버튼 영역 */}
      <div className="flex items-center justify-between">
        {/* 필터 토글 버튼 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 rounded-full bg-gray-800 px-5 py-2 text-sm font-medium text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white transition cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4a1 1 0 00-1 1v2.586a1 1 0 00.293.707l6.414 6.414v9.172a1 1 0 00.5.866l2 1a1 1 0 001.5-.866v-9.172l6.414-6.414A1 1 0 0021 7.586V5a1 1 0 00-1-1h-16z"
            />
          </svg>
          필터
        </button>

        {/* 우측 정렬 대상 요소들 */}
        {children}
      </div>

      {/* 필터 패널 */}
      {isOpen && (
        <div className="mt-4 p-6 rounded-2xl border border-gray-800 bg-gray-900/60 backdrop-blur-md shadow-xl">
          <div className="flex flex-col gap-6">

            {/* 1. 모집 유형 (상단에 가로로) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h4 className="w-24 font-bold text-gray-300">분류</h4>
              <div className="flex flex-wrap gap-2">
                {availableOptions.types.map((type) => {
                  const isActive = filters.type.includes(type);
                  let activeClasses = "";
                  let dotClass = "bg-gray-600";
                  
                  if (isActive) {
                    if (type.includes("구인")) {
                      activeClasses = "bg-gray-800 border-emerald-400 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]";
                      dotClass = "bg-emerald-400";
                    } else if (type.includes("구직")) {
                      activeClasses = "bg-gray-800 border-teal-400 text-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.3)]";
                      dotClass = "bg-teal-400";
                    } else if (type.includes("승객")) {
                      activeClasses = "bg-gray-800 border-yellow-400 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]";
                      dotClass = "bg-yellow-400";
                    } else if (type.includes("기사")) {
                      activeClasses = "bg-gray-800 border-orange-400 text-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.3)]";
                      dotClass = "bg-orange-400";
                    } else {
                      activeClasses = "bg-gray-800 border-stone-300 text-stone-300 shadow-[0_0_10px_rgba(214,211,209,0.3)]";
                      dotClass = "bg-stone-300";
                    }
                  } else {
                    activeClasses = "bg-gray-800/50 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500";
                  }

                  return (
                    <button
                      key={type}
                      onClick={() => handleCheckboxChange("type", type)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${activeClasses}`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${dotClass}`}></span>
                        {type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. 종족 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h4 className="w-24 font-bold text-gray-300">종족</h4>
              <div className="flex flex-wrap gap-2">
                {availableOptions.races.map((race) => {
                  const isElyos = race === "천족";
                  const isActive = filters.race.includes(race);
                  
                  return (
                    <button
                      key={race}
                      onClick={() => handleCheckboxChange("race", race)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        isActive && isElyos
                          ? "bg-gray-800 border-blue-600 text-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                          : isActive && !isElyos
                          ? "bg-gray-800 border-purple-400 text-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.3)]"
                          : "bg-gray-800/50 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isActive ? (isElyos ? 'bg-blue-600' : 'bg-purple-400') : 'bg-gray-600'}`}></span>
                        {race}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. 역할군 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h4 className="w-24 font-bold text-gray-300">역할군</h4>
              <div className="flex flex-wrap gap-2">
                {availableOptions.roles.map((role) => {
                  const isActive = filters.role.includes(role);
                  let activeClasses = "";
                  let dotClass = "bg-gray-600";
                  
                  if (isActive) {
                    if (role === "탱커") {
                      activeClasses = "bg-gray-800 border-blue-400 text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.3)]";
                      dotClass = "bg-blue-400";
                    } else if (role === "딜러") {
                      activeClasses = "bg-gray-800 border-green-400 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.3)]";
                      dotClass = "bg-green-400";
                    } else if (role === "힐러") {
                      activeClasses = "bg-gray-800 border-yellow-400 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]";
                      dotClass = "bg-yellow-400";
                    } else {
                      activeClasses = "bg-gray-800 border-stone-300 text-stone-300 shadow-[0_0_10px_rgba(214,211,209,0.3)]";
                      dotClass = "bg-stone-300";
                    }
                  } else {
                    activeClasses = "bg-gray-800/50 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500";
                  }

                  return (
                    <button
                      key={role}
                      onClick={() => handleCheckboxChange("role", role)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${activeClasses}`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${dotClass}`}></span>
                        {role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. 던전 부류 & 필드 부류 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h4 className="w-24 font-bold text-gray-300">파티</h4>
              <div className="flex flex-wrap gap-2">
                {[...(availableOptions.dungeons || []), ...(availableOptions.fields || [])].map((dungeon) => {
                  const isActive = filters.dungeon.includes(dungeon);
                  let activeClasses = "";
                  let dotClass = "bg-gray-600";
                  
                  if (isActive) {
                    if (dungeon.includes("성역")) {
                      activeClasses = "bg-gray-800 border-slate-300 text-slate-300 shadow-[0_0_10px_rgba(203,213,225,0.3)]";
                      dotClass = "bg-slate-300";
                    } else if (dungeon.includes("초월")) {
                      activeClasses = "bg-gray-800 border-pink-400 text-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.3)]";
                      dotClass = "bg-pink-400";
                    } else if (dungeon.includes("원정")) {
                      activeClasses = "bg-gray-800 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]";
                      dotClass = "bg-amber-500";
                    } else if (dungeon.includes("어비스")) {
                      activeClasses = "bg-gray-800 border-rose-500 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]";
                      dotClass = "bg-rose-500";
                    } else if (dungeon.includes("시공")) {
                      activeClasses = "bg-gray-800 border-lime-400 text-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.3)]";
                      dotClass = "bg-lime-400";
                    } else {
                      activeClasses = "bg-gray-800 border-stone-300 text-stone-300 shadow-[0_0_10px_rgba(214,211,209,0.3)]";
                      dotClass = "bg-stone-300";
                    }
                  } else {
                    activeClasses = "bg-gray-800/50 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500";
                  }

                  return (
                    <button
                      key={dungeon}
                      onClick={() => handleCheckboxChange("dungeon", dungeon)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${activeClasses}`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${dotClass}`}></span>
                        {dungeon}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 하단 영역 (검색창 & 액션 버튼) */}
          <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-end items-center gap-4">
            {/* 텍스트 검색창 */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="제목, 내용, 작성자 등 검색..."
                value={filters.keyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApply();
                  }
                }}
                className="w-full rounded-full border border-gray-700 bg-gray-800/50 px-4 py-2 pr-10 text-sm text-gray-200 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-shadow"
              />
              <button 
                onClick={handleApply}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-cyan-400 transition-colors focus:outline-none rounded-full cursor-pointer"
                aria-label="검색"
              >
                <svg 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* 액션 버튼 (적용 / 초기화) */}
            <div className="flex w-full sm:w-auto gap-3 shrink-0">
              <button
                onClick={handleApply}
                className="flex-1 sm:flex-none rounded-full bg-cyan-600/20 border border-cyan-500/50 px-6 py-2 text-sm font-bold text-cyan-400 hover:bg-cyan-500 hover:text-gray-900 transition-all shadow-[0_0_10px_rgba(34,211,238,0.2)] hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] cursor-pointer"
              >
                적용
              </button>
              <button
                onClick={handleReset}
                className="flex-1 sm:flex-none rounded-full border border-gray-700 bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors cursor-pointer"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
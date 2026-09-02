import Link from "next/link";
import { useSyncExternalStore } from "react";
import { getDisplayStatus } from "@/utils/recruitUtils";

type RecruitCardProps = {
  id: number;
  title: string;
  author: string;
  race: string;
  server: string;
  role: string;
  jobClass: string;
  dungeon: string;
  time: string;
  status: string;
  type: "구인" | "구직" | "버스승객모집" | "버스기사구함";
  isVerified?: boolean;
  hasApplied?: boolean;
  createdAt: Date;
};

import { formatDate } from "@/utils/dateUtils";

const emptySubscribe = () => () => {};

export default function RecruitCard({
  id, title, author, race, server, role, jobClass, dungeon, time, status, type, isVerified, hasApplied, createdAt,
}: RecruitCardProps) {
  // Hydration Error 방지: SSR 시점에는 false, 클라이언트 마운트 후 true
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const displayStatus = isMounted ? getDisplayStatus(status, createdAt) : status;
  const isCompleted = displayStatus.includes("완료");
  const isBus = type.includes("버스");
  const href = `/${isBus ? "buses" : "recruits"}/${id}`;

  const formatDungeon = (dungeonStr: string) => {
    if (!dungeonStr) return "";
    const spaceIndex = dungeonStr.indexOf(" ");
    if (spaceIndex === -1) return `[${dungeonStr}]`; // Only category
    const category = dungeonStr.slice(0, spaceIndex);
    const name = dungeonStr.slice(spaceIndex + 1);
    return `[${category}] ${name}`;
  };

  const getRoleOrClassColor = (name: string) => {
    if (name === "수호성" || name === "탱커") return "text-blue-400";
    if (["검성", "살성", "궁성", "마도성", "정령성", "딜러"].includes(name)) return "text-green-400";
    if (["치유성", "호법성", "힐러"].includes(name)) return "text-yellow-400";
    return "text-gray-300";
  };

  const displayString = type === "버스기사구함" ? "승객" : (jobClass && jobClass !== "제한없음" ? jobClass : role);
  const displayElements = displayString ? displayString.split(", ").map((item, index, array) => (
    <span key={index}>
      <span className={`${getRoleOrClassColor(item)} font-bold`}>{item}</span>
      {index < array.length - 1 && <span className="text-gray-500 font-normal">, </span>}
    </span>
  )) : <span className="text-gray-300 font-bold">제한없음</span>;

  return (
    <Link href={href} className="block h-full group">
      <div className={`relative flex flex-col h-full rounded-2xl border p-5 shadow-sm transition-all duration-300 group-hover:-translate-y-1 ${
        isCompleted 
          ? "bg-gray-900/50 border-gray-800 opacity-60 grayscale-[50%]" 
          : "bg-gray-800/80 border-gray-700 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]"
      }`}>
        
        {/* 오른쪽 위 이미 신청한 글 표시 (파란색 네모 띠) */}
        {hasApplied && (
          <div className="absolute top-0 right-0 z-10">
            <div className="bg-cyan-600 text-white text-xs font-bold px-3 py-1.5 rounded-tr-2xl rounded-bl-xl shadow-md">
              신청완료
            </div>
          </div>
        )}

        {/* 상단 뱃지 영역 */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold border ${
              isCompleted
                ? "bg-gray-800 text-gray-500 border-gray-700"
                : type === "구인"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : type === "구직"
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                    : type === "버스승객모집"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}
          >
            {isCompleted ? "모집완료" : (
              <>
                {type === "구인" && "구인중"}
                {type === "구직" && "구직중"}
                {type === "버스승객모집" && "승객 모집"}
                {type === "버스기사구함" && "기사 구함"}
              </>
            )}
          </span>
          <span className="text-gray-400 text-sm font-medium">{formatDungeon(dungeon)}</span>
        </div>

        {/* 본문 영역 */}
        <div className="flex-1 min-w-0">
          {/* 제목 */}
          <div className="marquee-container mb-3">
            <h2 className="marquee-text text-lg font-bold text-white transition-colors">
              {title}
            </h2>
          </div>
          
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-start gap-2 text-sm">
              <span className="text-gray-500 font-medium whitespace-nowrap shrink-0">모집 직업</span>
              <div className="flex flex-wrap gap-x-1">
                {displayElements}
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-gray-500 font-medium whitespace-nowrap shrink-0">출발시간</span>
              <span className="text-white font-bold">
                {time || "미정"}
              </span>
            </div>
          </div>
        </div>

        {/* 하단 푸터 (프로필 및 시간) */}
        <div className="mt-6 pt-4 border-t border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600 overflow-hidden">
              <span className="text-sm">👤</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-gray-200">{author}</span>
                {isVerified && (
                  <span className="flex items-center justify-center bg-cyan-500/20 text-cyan-400 rounded-full p-0.5" title="공식 인증 완료 캐릭터">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">{race} • {server}</span>
            </div>
          </div>
          
          <div className="text-xs font-medium text-gray-500 min-w-[70px] text-right">
            {isMounted ? formatDate(createdAt) : ""}
          </div>
        </div>
      </div>
    </Link>
  );
}
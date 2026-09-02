"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SERVER_LIST } from "@/constants/servers";
import { useToast } from "@/contexts/ToastContext";
import { useDialog } from "@/contexts/DialogContext";
import { createRecruit } from "@/app/actions/recruitActions";

import { ROLE_CLASS_LIST, DUNGEON_LIST } from "@/constants/options";

interface RecruitFormProps {
  initialUserMeta: {
    charNickname?: string;
    charRace?: string;
    charServer?: string;
    isVerified?: boolean;
  } | null;
}

export default function RecruitForm({ initialUserMeta }: RecruitFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { showAlert } = useDialog();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState(initialUserMeta?.charNickname || "");
  const isVerified = initialUserMeta?.isVerified || false;
  const [race, setRace] = useState(initialUserMeta?.charRace || "");
  const [server, setServer] = useState(initialUserMeta?.charServer || "");
  const [jobClass, setJobClass] = useState("");
  const [jobClasses, setJobClasses] = useState<string[]>([]);
  const [type, setType] = useState<"구인" | "구직" | "">(""); 
  const [dungeonCategory, setDungeonCategory] = useState(""); 
  const [dungeonName, setDungeonName] = useState("");         
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  const handleRaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRace(e.target.value);
    setServer("");
  };

  const handleDungeonCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDungeonCategory(e.target.value);
    setDungeonName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalRole = "";
    let finalJobClass = "";

    if (!type) {
      await showAlert("모집 유형을 먼저 선택해주세요!");
      return;
    }

    if (type === "구인") {
      if (jobClasses.length === 0) {
        await showAlert("모집할 직업을 1개 이상 선택해주세요!");
        return;
      }

      const selectedRoles = new Set<string>();
      const finalJobClassesArr: string[] = [];

      Object.entries(ROLE_CLASS_LIST).forEach(([r, classes]) => {
        const checkedClassesInRole = classes.filter(c => jobClasses.includes(c));
        if (checkedClassesInRole.length > 0) {
          selectedRoles.add(r);
          if (checkedClassesInRole.length === classes.length && r !== "탱커") {
            finalJobClassesArr.push(r);
          } else {
            finalJobClassesArr.push(...checkedClassesInRole);
          }
        }
      });

      finalRole = Array.from(selectedRoles).join(", ");
      finalJobClass = finalJobClassesArr.join(", ");
    } else {
      if (!jobClass) {
        await showAlert("직업을 선택해주세요!");
        return;
      }
      Object.entries(ROLE_CLASS_LIST).forEach(([r, classes]) => {
        if (classes.includes(jobClass)) {
          finalRole = r;
        }
      });
      finalJobClass = jobClass;
    }

    const isDungeonNameRequired = dungeonCategory && DUNGEON_LIST[dungeonCategory]?.length > 0;

    if (!title || !author || !race || !server || !finalRole || !finalJobClass || !dungeonCategory || (isDungeonNameRequired && !dungeonName)) {
      await showAlert("모든 항목을 입력해주세요!");
      return;
    }

    const postData = {
      type: type,
      title,
      role: finalRole,
      jobclass: finalJobClass,
      dungeon: `${dungeonCategory} ${dungeonName}`.trim(),
      time,
      description,
    };

    const result = await createRecruit("recruits", postData);

    if (!result.success) {
      await showAlert(result.error || "등록 중 오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }

    toast("등록이 완료되었습니다!");
    router.push("/recruits");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">제목</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-3 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">닉네임</label>
        <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} disabled={isVerified} placeholder="캐릭터 닉네임을 입력하세요" className={`w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-3 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all ${isVerified ? 'bg-gray-800/50 text-gray-500' : ''}`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">종족</label>
          <select value={race} onChange={handleRaceChange} disabled={isVerified} className={`w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-3 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all ${isVerified ? 'bg-gray-800/50 text-gray-500' : ''}`}>
            <option value="">-</option>
            <option value="천족">천족</option>
            <option value="마족">마족</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">서버</label>
          <select value={server} onChange={(e) => setServer(e.target.value)} disabled={!race || isVerified} className={`w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-3 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all ${(!race || isVerified) ? 'bg-gray-800/50 text-gray-500' : ''}`}>
            <option value="">-</option>
            {race && SERVER_LIST[race].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">파티 부류</label>
          <select value={dungeonCategory} onChange={handleDungeonCategoryChange} className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-3 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all">
            <option value="">-</option>
            {Object.keys(DUNGEON_LIST).map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">상세 설정</label>
          <select 
            value={dungeonName} 
            onChange={(e) => setDungeonName(e.target.value)} 
            disabled={!dungeonCategory || DUNGEON_LIST[dungeonCategory]?.length === 0} 
            className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-3 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:bg-gray-800/50 disabled:text-gray-500"
          >
            <option value="">-</option>
            {dungeonCategory && DUNGEON_LIST[dungeonCategory]?.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* 구인/구직 탭 */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-300">모집 유형</label>
        <div className="flex gap-2 rounded-lg border border-gray-800 bg-gray-950 p-1">
          <button
            type="button"
            onClick={() => setType("구인")}
            className={`flex-1 rounded-md py-2 px-3 font-medium transition-all ${type === "구인"
                ? "bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                : "bg-transparent text-gray-500 hover:text-white"
              }`}
          >
            파티원 모집 (구인)
          </button>

          <div className="w-px bg-gray-800 my-1"></div>

          <button
            type="button"
            onClick={() => setType("구직")}
            className={`flex-1 rounded-md py-2 px-3 font-medium transition-all ${type === "구직"
                ? "bg-teal-600 text-white shadow-[0_0_10px_rgba(13,148,136,0.4)]"
                : "bg-transparent text-gray-500 hover:text-white"
              }`}
          >
            파티 찾기 (구직)
          </button>
        </div>
      </div>

      {type && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            {type === "구인" ? "모집 직업 (다중 선택 가능) *" : "본인 직업 (단일 선택) *"}
          </label>
          <div className="rounded-lg border border-gray-800 bg-gray-950 p-5">
            {Object.entries(ROLE_CLASS_LIST).map(([r, classes]) => (
              <div key={r} className="mb-4 last:mb-0">
                <h4 className="mb-3 font-semibold text-white">{r}</h4>
                <div className="flex flex-wrap gap-4">
                  {classes.map((c) => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name={type === "구인" ? undefined : "jobClassGroup"}
                        checked={type === "구인" ? jobClasses.includes(c) : jobClass === c}
                        onChange={(e) => {
                          if (type === "구인") {
                            if (e.target.checked) {
                              setJobClasses(prev => [...prev, c]);
                            } else {
                              setJobClasses(prev => prev.filter(jc => jc !== c));
                            }
                          } else {
                            if (e.target.checked) {
                              setJobClass(c);
                            } else {
                              if (jobClass === c) setJobClass("");
                            }
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-950 transition-all cursor-pointer"
                      />
                      <span className="text-sm text-gray-300">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">출발 시간</label>
        <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-3 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all">
          <option value="">- 선택 -</option>
          <option value="바로 출발">바로 출발</option>
          <option value="10분 후">10분 후</option>
          <option value="20분 후">20분 후</option>
          <option value="30분 후">30분 후</option>
          <option value="1시간 후">1시간 후</option>
          <option value="시간 협의">시간 협의</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">상세 설명</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} placeholder="상세 내용을 입력하세요." rows={4} className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-3 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-500" />
      </div>
      <button type="submit" className="w-full rounded-lg bg-cyan-600 px-5 py-3 text-white transition-all hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] font-bold">등록하기</button>
    </form>
  );
}

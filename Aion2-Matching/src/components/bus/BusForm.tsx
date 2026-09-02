"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SERVER_LIST } from "@/constants/servers";
import { useToast } from "@/contexts/ToastContext";
import { useDialog } from "@/contexts/DialogContext";
import { createRecruit } from "@/app/actions/recruitActions";

const ROLE_CLASS_LIST: Record<string, string[]> = {
  "탱커": ["수호성"],
  "딜러": ["검성", "살성", "궁성", "마도성", "정령성"],
  "힐러": ["치유성", "호법성"],
};

const DUNGEON_LIST: Record<string, string[]> = {
  "성역": ["심연의 재련: 루드라", "침식의 정화소", "무스펠의 성배"],
  "초월": ["데우스 연구기지", "조각난 아르카니스", "가라앉은 생명의 신전"],
  "원정": ["푸섬"],
  "어비스": ["중층", "하층"],
  "시공": ["공격 시공", "방어 시공"]
};

interface BusFormProps {
  initialUserMeta: {
    charNickname?: string;
    charRace?: string;
    charServer?: string;
    isVerified?: boolean;
  } | null;
}

export default function BusForm({ initialUserMeta }: BusFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { showAlert } = useDialog();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState(initialUserMeta?.charNickname || "");
  const isVerified = initialUserMeta?.isVerified || false;
  const [race, setRace] = useState(initialUserMeta?.charRace || "");
  const [server, setServer] = useState(initialUserMeta?.charServer || "");
  const [jobClass, setJobClass] = useState("");
  const [type, setType] = useState<"버스승객모집" | "버스기사구함" | "">(""); 
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

    if (!type) {
      await showAlert("버스 모집 유형을 먼저 선택해주세요!");
      return;
    }

    const isDungeonNameRequired = dungeonCategory && DUNGEON_LIST[dungeonCategory]?.length > 0;

    if (!title || !author || !race || !server || !dungeonCategory || (isDungeonNameRequired && !dungeonName)) {
      await showAlert("모든 항목을 입력해주세요!");
      return;
    }

    if (type === "버스승객모집" && !jobClass) {
      await showAlert("본인의 상세 직업을 선택해주세요!");
      return;
    }

    let finalRole = "승객";
    let finalJobClass = "승객";

    if (type === "버스승객모집") {
      Object.entries(ROLE_CLASS_LIST).forEach(([r, classes]) => {
        if (classes.includes(jobClass)) {
          finalRole = r;
        }
      });
      finalJobClass = jobClass;
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

    const result = await createRecruit("buses", postData);

    if (!result.success) {
      await showAlert(result.error || "등록 중 오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }

    toast("등록이 완료되었습니다!");
    router.push("/buses");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">제목</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="예) 이스라펠 버스 구해요" className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-gray-500" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">닉네임</label>
        <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} disabled={isVerified} placeholder="캐릭터 닉네임을 입력하세요" className={`w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-gray-500 ${isVerified ? 'bg-gray-800/50 text-gray-500' : ''}`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">종족</label>
          <select value={race} onChange={handleRaceChange} disabled={isVerified} className={`w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all ${isVerified ? 'bg-gray-800/50 text-gray-500' : ''}`}>
            <option value="">-</option>
            <option value="천족">천족</option>
            <option value="마족">마족</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">서버</label>
          <select value={server} onChange={(e) => setServer(e.target.value)} disabled={!race || isVerified} className={`w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all ${(!race || isVerified) ? 'bg-gray-800/50 text-gray-500' : ''}`}>
            <option value="">-</option>
            {race && SERVER_LIST[race].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">파티 부류</label>
          <select value={dungeonCategory} onChange={handleDungeonCategoryChange} className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all">
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
            className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all disabled:bg-gray-800/50 disabled:text-gray-500"
          >
            <option value="">-</option>
            {dungeonCategory && DUNGEON_LIST[dungeonCategory]?.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* 버스 모집 유형 */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-300">버스 모집 유형</label>
        <div className="flex gap-2 rounded-lg border border-gray-800 bg-gray-950 p-1">
          <button
            type="button"
            onClick={() => setType("버스승객모집")}
            className={`flex-1 rounded-md py-2 px-3 font-medium transition-all ${type === "버스승객모집"
                ? "bg-amber-600 text-white shadow-[0_0_10px_rgba(217,119,6,0.4)]"
                : "bg-transparent text-gray-500 hover:text-white"
              }`}
          >
            승객 모집
          </button>

          <div className="w-px bg-gray-800 my-1"></div>

          <button
            type="button"
            onClick={() => setType("버스기사구함")}
            className={`flex-1 rounded-md py-2 px-3 font-medium transition-all ${type === "버스기사구함"
                ? "bg-rose-600 text-white shadow-[0_0_10px_rgba(225,29,72,0.4)]"
                : "bg-transparent text-gray-500 hover:text-white"
              }`}
          >
            기사 구함
          </button>
        </div>
      </div>

      {type === "버스승객모집" && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            본인 직업 (단일 선택) *
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
                        name="busJobClassGroup"
                        checked={jobClass === c}
                        onChange={(e) => {
                          if (e.target.checked) setJobClass(c);
                        }}
                        className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-gray-950 transition-all cursor-pointer"
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
        <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all">
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
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} placeholder="상세 내용을 입력하세요." rows={4} className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-gray-500" />
      </div>

      <button type="submit" className="w-full rounded-lg bg-amber-600 px-5 py-3 text-white transition-all hover:bg-amber-500 shadow-[0_0_15px_rgba(217,119,6,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] font-bold">등록하기</button>
    </form>
  );
}

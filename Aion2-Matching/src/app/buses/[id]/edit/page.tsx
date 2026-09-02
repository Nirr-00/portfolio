"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/common/Header";
import { supabaseClient } from "@/lib/supabase-client";
import { SERVER_LIST } from "@/constants/servers";
import { useToast } from "@/contexts/ToastContext";
import { useDialog } from "@/contexts/DialogContext";
import { updateRecruit } from "@/app/actions/recruitActions";

import { ROLE_CLASS_LIST, DUNGEON_LIST } from "@/constants/options";

export default function BusEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const { showAlert } = useDialog();

  const [isLoading, setIsLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState(""); // 작성자 닉네임
  const [race, setRace] = useState("");
  const [server, setServer] = useState("");
  const [jobClass, setJobClass] = useState("");
  const [type, setType] = useState<"버스승객모집" | "버스기사구함" | "">(""); // 기본 선택 없음
  const [dungeonCategory, setDungeonCategory] = useState(""); // 던전 분류
  const [dungeonName, setDungeonName] = useState("");         // 던전명
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        toast("로그인이 필요합니다.");
        router.replace("/login");
        return;
      }

      // Fetch the post
      const { data: post, error } = await supabaseClient
        .from("buses")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !post) {
        await showAlert("게시글을 찾을 수 없습니다.");
        router.replace("/buses");
        return;
      }

      if (post.user_id !== session.user.id) {
        await showAlert("작성자만 수정할 수 있습니다.");
        router.replace("/buses");
        return;
      }

      // Fill author data from post
      setTitle(post.title);
      setAuthor(post.author);
      setRace(post.race);
      setServer(post.server);
      setType(post.type as "버스승객모집" | "버스기사구함");
      setTime(post.time);
      setDescription(post.description);

      // parse dungeon
      const dungeonParts = post.dungeon.split(" ");
      if (dungeonParts.length > 0) {
        const category = dungeonParts[0];
        setDungeonCategory(category);
        if (dungeonParts.length > 1) {
          setDungeonName(dungeonParts.slice(1).join(" "));
        }
      }

      // parse jobclass
      if (post.type === "버스승객모집") {
        setJobClass(post.jobclass);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [id, router, toast, showAlert]);

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

    // 공통 필수값 체크
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

    // 1. 현재 로그인된 유저 세션 가져오기
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      await showAlert("로그인이 필요합니다!");
      router.push("/login");
      return;
    }

    const updateData = {
      type: type,
      title,
      role: finalRole,
      jobclass: finalJobClass,
      dungeon: `${dungeonCategory} ${dungeonName}`.trim(),
      time,
      description
    };

    const res = await updateRecruit("buses", Number(id), updateData);

    if (!res.success) {
      console.error("버스 모집글 수정 중 오류 발생");
      await showAlert("수정 중 오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }

    toast("수정이 완료되었습니다!");
    router.push(`/buses/${id}`);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-10">
          <div className="text-center py-20 text-gray-500">데이터를 불러오는 중입니다...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-6 text-3xl font-bold">버스 모집글 수정</h1>
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">제목</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="예) 이스라펠 버스 구해요" className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">닉네임</label>
            <input type="text" value={author} disabled className={`w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500 bg-gray-100 text-gray-500`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">종족</label>
              <select value={race} disabled className={`w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500 bg-gray-100 text-gray-500`}>
                <option value="">-</option>
                <option value="천족">천족</option>
                <option value="마족">마족</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">서버</label>
              <select value={server} disabled className={`w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500 bg-gray-100 text-gray-500`}>
                <option value="">-</option>
                {race && SERVER_LIST[race].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">파티 부류</label>
              <select value={dungeonCategory} onChange={handleDungeonCategoryChange} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500">
                <option value="">-</option>
                {Object.keys(DUNGEON_LIST).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">상세 설정</label>
              <select 
                value={dungeonName} 
                onChange={(e) => setDungeonName(e.target.value)} 
                disabled={!dungeonCategory || DUNGEON_LIST[dungeonCategory]?.length === 0} 
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">-</option>
                {dungeonCategory && DUNGEON_LIST[dungeonCategory]?.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* 버스 모집 유형 */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">버스 모집 유형</label>
            <div className="flex gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setType("버스승객모집")}
                className={`flex-1 rounded-md py-2 px-3 font-medium transition ${type === "버스승객모집"
                    ? "bg-amber-600 text-white"
                    : "bg-transparent text-gray-600 hover:text-gray-900"
                  }`}
              >
                승객 모집
              </button>

              <div className="w-px bg-gray-300 my-1"></div>

              <button
                type="button"
                onClick={() => setType("버스기사구함")}
                className={`flex-1 rounded-md py-2 px-3 font-medium transition ${type === "버스기사구함"
                    ? "bg-rose-600 text-white"
                    : "bg-transparent text-gray-600 hover:text-gray-900"
                  }`}
              >
                기사 구함
              </button>
            </div>
          </div>

          {type === "버스승객모집" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                본인 직업 (단일 선택) *
              </label>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                {Object.entries(ROLE_CLASS_LIST).map(([r, classes]) => (
                  <div key={r} className="mb-4 last:mb-0">
                    <h4 className="mb-3 font-semibold text-gray-800">{r}</h4>
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
                            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                          <span className="text-sm text-gray-700">{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}



          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">출발 시간</label>
            <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500">
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
            <label className="mb-2 block text-sm font-medium text-gray-700">상세 설명</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} placeholder="상세 내용을 입력하세요." rows={4} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500" />
          </div>

          <button type="submit" className="w-full rounded-lg bg-amber-600 px-5 py-3 text-white transition hover:bg-amber-700 font-bold cursor-pointer">수정완료</button>
        </form>
      </main>
    </>
  );
}

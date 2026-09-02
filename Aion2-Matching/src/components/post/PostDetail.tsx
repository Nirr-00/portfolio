"use client";

import { useEffect, useState } from "react";
import Header from "@/components/common/Header";
import { supabaseClient } from "@/lib/supabase-client";
import { User } from "@supabase/supabase-js";
import { Recruit, Application } from "@/types/recruit";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CharacterSearchResult } from "@/types/character";
import ApplyModal from "@/components/application/ApplyModal";
import { useToast } from "@/contexts/ToastContext";
import { useDialog } from "@/contexts/DialogContext";
import { getDisplayStatus } from "@/utils/recruitUtils";
import { toggleRecruitStatus, deleteRecruit } from "@/app/actions/recruitActions";
import { cancelApplication } from "@/app/actions/applicationActions";
import { formatDate } from "@/utils/dateUtils";

type PostDetailProps = {
  id: string;
  postType: "recruits" | "buses";
};

export default function PostDetail({ id, postType }: PostDetailProps) {
  const router = useRouter();
  const [post, setPost] = useState<Recruit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { showAlert, showConfirm } = useDialog();
  const [characterInfo, setCharacterInfo] = useState<CharacterSearchResult | null>(null);
  
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isAppsLoading, setIsAppsLoading] = useState(false);

  // ApplyModal에 전달할 postType (ApplyModal은 "recruit" | "bus"를 받음)
  const modalPostType = postType === "recruits" ? "recruit" : "bus";

  useEffect(() => {
    const fetchPostAndUser = async () => {
      // 1. 현재 사용자 세션 가져오기
      const { data: sessionData } = await supabaseClient.auth.getSession();
      setCurrentUser(sessionData?.session?.user || null);

      // 2. 게시글 가져오기
      const { data, error } = await supabaseClient
        .from(postType)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Failed to fetch post:", error);
      }

      if (data) {
        setPost({
          ...data,
          jobClass: data.jobclass,
          createdAt: new Date(data.created_at)
        });

        // 캐시된 스펙이 있는 경우에만 캐릭터 정보 세팅
        if (data.is_verified && data.char_combatpower) {
          setCharacterInfo({
            nickname: data.author,
            race: data.race,
            server: data.server,
            level: data.char_level,
            jobClass: data.char_jobclass,
            itemLevel: data.char_itemlevel,
            combatPower: data.char_combatpower,
            profileImage: data.char_profileimage,
            rank: ""
          });
        }
      }
      setIsLoading(false);
    };

    const fetchApplications = async () => {
      setIsAppsLoading(true);
      const { data, error } = await supabaseClient
        .from("applications")
        .select("*")
        .eq("post_id", id)
        .order("created_at", { ascending: false });
        
      if (!error && data) {
        setApplications(data);
      }
      setIsAppsLoading(false);
    };

    fetchPostAndUser();
    fetchApplications();
  }, [id, postType]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-4xl px-6 py-10">
          <div className="text-center py-20 text-gray-500">데이터를 불러오는 중입니다...</div>
        </main>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-4xl px-6 py-10">
          <h1 className="text-2xl font-bold">모집글을 찾을 수 없습니다.</h1>
        </main>
      </>
    );
  }

  const isAuthor = currentUser?.id === post.user_id;
  const hasApplied = currentUser ? applications.some(app => app.applicant_id === currentUser.id) : false;
  const displayStatus = getDisplayStatus(post.status, post.createdAt);

  const handleCopyNickname = () => {
    const textToCopy = `${post.author}[${post.server}]`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast("닉네임이 복사되었습니다");
    }).catch((err) => {
      console.error('복사 실패:', err);
    });
  };

  const handleStatusToggle = async () => {
    if (!isAuthor || !currentUser) {
      await showAlert("작성자만 상태를 변경할 수 있습니다.");
      return;
    }

    const newStatus = displayStatus === "모집중" ? "모집완료" : "모집중";
    const isConfirmed = await showConfirm(`상태를 '${newStatus}'(으)로 변경하시겠습니까?`);
    if (isConfirmed) {
      const res = await toggleRecruitStatus(postType, post.id, newStatus);

      if (res.success) {
        setPost({ 
          ...post, 
          status: newStatus,
          ...(newStatus === "모집중" && { createdAt: new Date() })
        });
      } else {
        await showAlert(res.error || "상태 변경에 실패했습니다.");
      }
    }
  };

  const handleDelete = async () => {
    if (!isAuthor || !currentUser) {
      await showAlert("작성자만 삭제할 수 있습니다.");
      return;
    }

    const isConfirmed = await showConfirm("정말 이 모집글을 삭제하시겠습니까?");
    if (isConfirmed) {
      const res = await deleteRecruit(postType, post.id);

      if (res.success) {
        toast("삭제되었습니다.");
        router.back();
      } else {
        await showAlert(res.error || "삭제에 실패했습니다.");
      }
    }
  };

  const handleCancelApplication = async () => {
    if (!currentUser) return;
    
    const myApp = applications.find(app => app.applicant_id === currentUser.id);
    if (!myApp) return;

    const isConfirmed = await showConfirm("정말 신청을 취소하시겠습니까?");
    if (isConfirmed) {
      const res = await cancelApplication(myApp.id);
        
      if (res.success) {
        toast("취소가 완료 되었습니다.");
        setApplications(applications.filter(app => app.id !== myApp.id));
      } else {
        await showAlert("신청 취소에 실패했습니다.");
      }
    }
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-4 text-3xl font-bold">{post.title}</h1>
        
        {/* 캐릭터 정보 박스 (작성자 스펙) */}
        {characterInfo ? (
          <div className="mb-6 flex flex-col sm:flex-row items-center gap-6 rounded-xl bg-gray-900 p-6 shadow-md border border-gray-800">
            <div className="flex items-center gap-5 sm:flex-1">
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 p-1 shadow-lg shrink-0">
                <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center border border-white/20 overflow-hidden">
                  {characterInfo.profileImage ? (
                    <Image src={characterInfo.profileImage} alt={characterInfo.nickname} width={80} height={80} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">👤</span>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${characterInfo.race === "천족" ? "bg-blue-500/20 text-blue-300" : "bg-red-500/20 text-red-300"}`}>
                    {characterInfo.race}
                  </span>
                  <span className="text-gray-400 text-xs font-medium truncate">{characterInfo.server}</span>
                </div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2 truncate">
                  {characterInfo.nickname}
                </h3>
                <p className="text-gray-300 text-sm mt-1">
                  Lv.{characterInfo.level} {characterInfo.jobClass}
                </p>
              </div>
            </div>
            <div className="flex w-full sm:w-auto gap-4">
              <div className="flex-1 sm:flex-none bg-black/40 rounded-xl px-5 py-3 border border-white/10 text-center shadow-inner">
                <p className="text-[10px] text-gray-400 mb-1">아이템 레벨</p>
                <p className="text-xl font-bold text-white tracking-tight">Lv.{characterInfo.itemLevel}</p>
              </div>
              <div className="flex-1 sm:flex-none bg-black/40 rounded-xl px-5 py-3 border border-white/10 text-center shadow-inner">
                <p className="text-[10px] text-gray-400 mb-1">종합 전투력</p>
                <p className="text-xl font-bold text-amber-400 tracking-tight">{characterInfo.combatPower.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-3 rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
          <p className="text-sm text-gray-400">
            <span className="font-semibold">등록일시:</span> {formatDate(post.createdAt)}
          </p>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="font-semibold">닉네임:</span> 
            <span className="flex items-center gap-1">
              {post.author} ({post.race})
              {post.is_verified && (
                <span className="flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-full p-0.5" title="공식 인증 완료 캐릭터">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </span>
            <button
              onClick={handleCopyNickname}
              className="ml-2 rounded border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-400 shadow-sm transition hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              title="닉네임[서버명] 복사하기"
            >
              복사
            </button>
          </div>
          <p className="text-gray-300">
            <span className="font-semibold text-gray-400">서버:</span> {post.server}
          </p>
          <p className="text-gray-300">
            <span className="font-semibold text-gray-400">직업:</span> {post.jobClass && post.jobClass !== "제한없음" ? post.jobClass : post.role}
          </p>
          <p className="text-gray-300">
            <span className="font-semibold text-gray-400">시간:</span> {post.time}
          </p>
          <p className="text-gray-300">
            <span className="font-semibold text-gray-400">상태:</span> {displayStatus}
          </p>

          <div className="border-t border-gray-800 pt-4 mt-4">
            <span className="block font-semibold text-gray-400 mb-2">상세 설명</span>
            <div className="rounded-lg bg-gray-950 p-4 text-gray-300 whitespace-pre-wrap min-h-[100px] border border-gray-800">
              {post.description || "상세 설명이 없습니다."}
            </div>
          </div>

          {/* 하단 액션 버튼 영역 */}
          {isAuthor ? (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleStatusToggle}
                className="flex-1 rounded-lg bg-gray-600 py-3 font-medium text-white transition hover:bg-gray-700 cursor-pointer"
              >
                {displayStatus === "모집중" ? "모집 마감" : "모집중으로 변경"}
              </button>
              <button
                onClick={() => router.push(`/${postType}/${post.id}/edit`)}
                className="flex-1 rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 cursor-pointer"
              >
                수정하기
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-red-500 py-3 font-medium text-white transition hover:bg-red-600 cursor-pointer"
              >
                삭제하기
              </button>
            </div>
          ) : (
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsApplyModalOpen(true)}
                disabled={displayStatus !== "모집중" || hasApplied}
                className={`flex-1 rounded-lg py-3 font-bold text-white shadow-md transition disabled:cursor-not-allowed ${
                  displayStatus !== "모집중" || hasApplied
                    ? "bg-gray-400 opacity-50"
                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                }`}
              >
                {displayStatus !== "모집중" ? "모집완료" : "신청하기"}
              </button>

              <button
                onClick={handleCancelApplication}
                disabled={!hasApplied}
                className={`flex-1 rounded-lg py-3 font-bold text-white shadow-md transition disabled:cursor-not-allowed ${
                  !hasApplied
                    ? "bg-gray-400 opacity-50"
                    : "bg-red-500 hover:bg-red-600 cursor-pointer"
                }`}
              >
                신청 취소하기
              </button>
            </div>
          )}
        </div>

        {/* 작성자용 신청 내역 표시 영역 */}
        {isAuthor && (
          <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-white">신청 내역 ({applications.length})</h2>
            {isAppsLoading ? (
              <div className="text-center text-gray-400 py-4">불러오는 중...</div>
            ) : applications.length === 0 ? (
              <div className="text-center text-gray-500 py-4 border border-dashed border-gray-700 rounded-lg">아직 신청자가 없습니다.</div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="border border-gray-800 rounded-lg p-4 bg-gray-950 flex flex-col sm:flex-row gap-4 justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {app.is_verified && (
                          <span className="flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-full p-0.5" title="공식 인증 완료 캐릭터">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                        {app.applicant_race && (
                          <span className={`px-2 py-0.5 text-xs font-bold rounded ${app.applicant_race === "천족" ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}`}>
                            {app.applicant_race}
                          </span>
                        )}
                        <span className="font-bold text-white">{app.applicant_nickname}</span>
                        {app.applicant_server && (
                          <span className="text-sm font-medium text-gray-500">[{app.applicant_server}]</span>
                        )}
                        <button
                          onClick={() => {
                            const text = `${app.applicant_nickname}[${app.applicant_server || ''}]`;
                            navigator.clipboard.writeText(text).then(() => {
                              toast("닉네임이 복사되었습니다");
                            });
                          }}
                          className="rounded border border-gray-700 bg-gray-800 px-2 py-0.5 text-[10px] font-medium text-gray-400 shadow-sm transition hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          title="닉네임[서버명] 복사하기"
                        >
                          복사
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">{app.applicant_role}</span>
                        <span className="text-xs font-medium text-gray-300">{app.applicant_job}</span>
                      </div>
                      <div className="text-sm text-gray-300 bg-gray-900 p-3 rounded-lg border border-gray-800 mt-2">
                        {app.message}
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      {formatDate(app.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <ApplyModal 
        isOpen={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)} 
        postId={id} 
        postType={modalPostType} 
        onSuccess={() => {
          supabaseClient.from("applications").select("*").eq("post_id", id).order("created_at", { ascending: false }).then(({ data }) => {
            if (data) setApplications(data);
          });
          toast("신청이 완료 되었습니다.");
        }} 
      />
    </>
  );
}

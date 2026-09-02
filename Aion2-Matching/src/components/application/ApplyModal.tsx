"use client";

import React, { useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { useDialog } from "@/contexts/DialogContext";

type ApplyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postType: "recruit" | "bus";
  onSuccess: () => void;
};
import { ROLE_CLASS_LIST } from "@/constants/options";

export default function ApplyModal({ isOpen, onClose, postId, postType, onSuccess }: ApplyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("안녕하세요!");
  const [role, setRole] = useState("");
  const [jobClass, setJobClass] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const { showAlert } = useDialog();

  React.useEffect(() => {
    if (isOpen) {
      const fetchProfile = async () => {
        setIsLoadingProfile(true);
        const { data: sessionData } = await supabaseClient.auth.getSession();
        const user = sessionData?.session?.user;
        const meta = user?.user_metadata;
        
        if (meta?.isVerified && meta.charNickname && meta.charRace && meta.charServer && meta.charJobClass) {
          setIsVerified(true);
          setJobClass(meta.charJobClass);
          // 직업에 맞는 역할(role) 찾기
          let foundRole = "";
          for (const [r, classes] of Object.entries(ROLE_CLASS_LIST)) {
            if (classes.includes(meta.charJobClass)) {
              foundRole = r;
              break;
            }
          }
          if (foundRole) setRole(foundRole);
        }
        setIsLoadingProfile(false);
      };
      fetchProfile();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        await showAlert("로그인이 필요합니다.");
        setIsSubmitting(false);
        return;
      }

      const meta = user.user_metadata;
      
      if (!meta?.charNickname || !meta?.charRace || !meta?.charServer) {
        await showAlert("프로필에서 캐릭터 인증 후 신청할 수 있습니다.");
        setIsSubmitting(false);
        return;
      }

      if (!role || !jobClass) {
        await showAlert("본인의 직업을 선택해주세요.");
        setIsSubmitting(false);
        return;
      }

      const newApplication = {
        post_id: postId,
        post_type: postType,
        applicant_id: user.id,
        applicant_nickname: meta.charNickname,
        applicant_race: meta.charRace,
        applicant_server: meta.charServer,
        is_verified: meta.isVerified === true,
        applicant_job: jobClass,
        applicant_role: role,
        message: message,
        status: "대기중",
      };

      const { error } = await supabaseClient.from('applications').insert([newApplication]);

      if (error) {
        console.error("신청 오류:", error);
        await showAlert("신청 처리 중 오류가 발생했습니다.");
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
      await showAlert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-gray-900 border border-gray-800 p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <h2 className="mb-4 text-xl font-bold text-white">모집글 신청하기</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">본인 역할</label>
              <select value={role} onChange={(e) => { setRole(e.target.value); setJobClass(""); }} disabled={isVerified || isLoadingProfile} className={`w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-3 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all ${isVerified ? 'bg-gray-800/50 text-gray-500' : ''}`}>
                <option value="">{isLoadingProfile ? "불러오는 중..." : "-"}</option>
                <option value="탱커">탱커</option>
                <option value="딜러">딜러</option>
                <option value="힐러">힐러</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">본인 상세 직업</label>
              <select value={jobClass} onChange={(e) => setJobClass(e.target.value)} disabled={!role || isVerified || isLoadingProfile} className={`w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-3 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all ${(!role || isVerified) ? 'bg-gray-800/50 text-gray-500' : ''}`}>
                <option value="">{isLoadingProfile ? "불러오는 중..." : "-"}</option>
                {role && ROLE_CLASS_LIST[role] && ROLE_CLASS_LIST[role].map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
          </div>
          {isVerified && (
            <p className="text-xs text-cyan-500 font-medium">공식 인증된 캐릭터 정보가 자동으로 불러와집니다.</p>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">인사말 (메시지)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800/50 text-gray-400 px-4 py-3 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-not-allowed"
              rows={3}
              readOnly
            />
            <p className="mt-1 text-xs text-gray-500">현재 테스트 버전이므로 고정된 메시지만 전송됩니다.</p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-800 mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-cyan-600 py-3 text-sm font-bold text-white transition-all shadow-[0_0_10px_rgba(6,182,212,0.4)] hover:bg-cyan-500 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)] disabled:opacity-50"
            >
              {isSubmitting ? "신청 중..." : "신청하기"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-gray-800 border border-gray-700 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

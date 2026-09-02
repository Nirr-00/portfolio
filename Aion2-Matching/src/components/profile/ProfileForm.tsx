"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import Image from "next/image";
import { SERVER_LIST } from "@/constants/servers";
import { useToast } from "@/contexts/ToastContext";
import { CharacterSearchResult } from "@/types/character";
import { syncCharacterInfo, updateUserProfile, ProfileUpdates } from "@/app/actions/profileActions";

interface ProfileFormProps {
  initialSession: {
    email: string;
    id: string;
    user_metadata: {
      nickname?: string;
      charRace?: string;
      charServer?: string;
      charNickname?: string;
      isVerified?: boolean;
    };
  };
}

export default function ProfileForm({ initialSession }: ProfileFormProps) {
  const { toast } = useToast();

  const [email] = useState(initialSession.email || "");
  const [nickname, setNickname] = useState(initialSession.user_metadata?.nickname || "");
  
  // 캐릭터 정보
  const [charRace, setCharRace] = useState(initialSession.user_metadata?.charRace || "");
  const [charServer, setCharServer] = useState(initialSession.user_metadata?.charServer || "");
  const [charNickname, setCharNickname] = useState(initialSession.user_metadata?.charNickname || "");
  const [originalCharInfo, setOriginalCharInfo] = useState({ 
    race: initialSession.user_metadata?.charRace || "", 
    server: initialSession.user_metadata?.charServer || "", 
    nickname: initialSession.user_metadata?.charNickname || "" 
  });
  const [isVerified, setIsVerified] = useState(initialSession.user_metadata?.isVerified || false);
  const [confirmMarkRemoval, setConfirmMarkRemoval] = useState(false);
  const [confirmTitleChange, setConfirmTitleChange] = useState(false);
  const [verifiedCharInfo, setVerifiedCharInfo] = useState<CharacterSearchResult | null>(null);
  const [isFetchingCharInfo, setIsFetchingCharInfo] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCharFields, setShowCharFields] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (initialSession.user_metadata?.isVerified && initialSession.user_metadata?.charNickname) {
      fetchVerifiedCharInfo(
        initialSession.user_metadata.charNickname || "",
        initialSession.user_metadata.charRace || "",
        initialSession.user_metadata.charServer || ""
      );
    }
  }, [initialSession]);

  async function fetchVerifiedCharInfo(nick: string, race: string, server: string) {
    setIsFetchingCharInfo(true);
    try {
      const queryParams = new URLSearchParams({ nickname: nick, race, server });
      const res = await fetch(`/api/character?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const newCharInfo = {
          nickname: data.nickname,
          race: data.race,
          server: data.server,
          jobClass: data.jobClass,
          itemLevel: data.itemLevel,
          combatPower: data.combatPower,
          rank: data.rank,
          profileImage: data.profileImage,
          level: data.level
        };
        setVerifiedCharInfo(newCharInfo);
        return newCharInfo;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch verified character info:", error);
      return null;
    } finally {
      setIsFetchingCharInfo(false);
    }
  };

  const handleRefreshCharInfo = async () => {
    const now = Date.now();
    const cooldown = 60 * 1000; // 1분
    if (now - lastRefreshTime < cooldown) {
      const remaining = Math.ceil((cooldown - (now - lastRefreshTime)) / 1000);
      toast(`${remaining}초 후에 다시 새로고침 할 수 있습니다.`);
      return;
    }

    if (originalCharInfo.nickname) {
      setLastRefreshTime(now);
      const newCharInfo = await fetchVerifiedCharInfo(
        originalCharInfo.nickname,
        originalCharInfo.race,
        originalCharInfo.server
      );
      
      if (newCharInfo) {
        const syncRes = await syncCharacterInfo(newCharInfo);
        if (syncRes.success) {
          toast("새로고침 완료");
        } else {
          toast("정보 갱신에 실패했습니다.");
        }
      } else {
        toast("정보 갱신에 실패했습니다.");
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!nickname) {
      setErrorMsg("닉네임을 입력해주세요.");
      return;
    }

    if ((charRace || charServer || charNickname) && (!charRace || !charServer || !charNickname)) {
      setErrorMsg("캐릭터 정보를 입력하시려면 종족, 서버, 캐릭터 닉네임을 모두 입력해주세요.");
      return;
    }

    if (password || passwordConfirm) {
      if (password !== passwordConfirm) {
        setErrorMsg("비밀번호가 일치하지 않습니다.");
        return;
      }
      if (password.length < 6) {
        setErrorMsg("비밀번호는 6자 이상이어야 합니다.");
        return;
      }
    }

    let isCharChanged = false;
    if (charRace !== originalCharInfo.race || charServer !== originalCharInfo.server || charNickname !== originalCharInfo.nickname) {
      isCharChanged = true;
    }
    const showRemovalWarning = isCharChanged && isVerified;

    if (showRemovalWarning && !confirmMarkRemoval) {
      setErrorMsg("인증 마크 삭제에 동의하는 체크박스를 선택해주세요.");
      return;
    }

    let finalIsVerified = isVerified;
    if (showRemovalWarning) {
      finalIsVerified = false;
    }

    setIsLoading(true);

    try {
      const updates: ProfileUpdates = {
        data: { 
          nickname,
          charRace,
          charServer,
          charNickname,
          isVerified: finalIsVerified
        }
      };

      if (password) {
        updates.password = password;
      }

      const res = await updateUserProfile(updates);

      if (!res.success) {
        setErrorMsg(res.error || "수정에 실패했습니다.");
      } else {
        setSuccessMsg("정보가 성공적으로 수정되었습니다.");
        setIsVerified(finalIsVerified);
        setOriginalCharInfo({ race: charRace, server: charServer, nickname: charNickname });
        if (password) {
          setPassword("");
          setPasswordConfirm("");
        }
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setErrorMsg("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!charRace || !charServer || !charNickname) {
      setErrorMsg("인증을 진행하려면 먼저 캐릭터 정보를 입력하고 저장해주세요.");
      return;
    }

    if (!confirmTitleChange) {
      setErrorMsg("칭호를 변경하셨는지 확인하는 체크박스에 체크해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        setErrorMsg("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        setIsLoading(false);
        return;
      }

      const res = await fetch("/api/verify-character", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          nickname: charNickname,
          race: charRace,
          server: charServer
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsVerified(true);
        setSuccessMsg("캐릭터 인증이 완료 되었습니다");
        setOriginalCharInfo({ race: charRace, server: charServer, nickname: charNickname });
        
        fetchVerifiedCharInfo(charNickname, charRace, charServer);
        await supabaseClient.auth.refreshSession();
      } else {
        setErrorMsg(data.error || "인증에 실패했습니다. 칭호를 다시 한 번 확인해 주세요.");
      }
    } catch (err) {
      console.error("Verify error:", err);
      setErrorMsg("인증 서버 통신 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const isCharChanged = charRace !== originalCharInfo.race || charServer !== originalCharInfo.server || charNickname !== originalCharInfo.nickname;
  const showRemovalWarning = isCharChanged && isVerified;

  return (
    <div className="bg-gray-900 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-800">
      <form className="space-y-6" onSubmit={handleUpdate}>
        <div>
          <label className="block text-sm font-medium text-gray-300">이메일 계정 (수정 불가)</label>
          <div className="mt-1">
            <input
              type="email"
              disabled
              value={email}
              className="appearance-none block w-full px-3 py-2 border border-gray-800 rounded-lg shadow-sm bg-gray-800/50 text-gray-500 sm:text-sm cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">닉네임</label>
          <div className="mt-1">
            <input
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium text-gray-300">대표 캐릭터 정보</h3>
              <div className="flex items-center gap-2">
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    인증 완료
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                    미인증 상태
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowCharFields(!showCharFields);
                if (showCharFields) {
                  setCharRace(originalCharInfo.race);
                  setCharServer(originalCharInfo.server);
                  setCharNickname(originalCharInfo.nickname);
                }
              }}
              className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded border border-gray-700 transition-colors whitespace-nowrap"
            >
              {showCharFields ? "취소" : "캐릭터 정보 수정"}
            </button>
          </div>

          {isVerified && isFetchingCharInfo && (
            <div className="mb-6 bg-gray-900 rounded-xl p-8 flex justify-center items-center shadow-lg border border-gray-800">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent"></div>
            </div>
          )}

          {isVerified && verifiedCharInfo && !isFetchingCharInfo && (
            <div className="relative mb-6 bg-gray-900 rounded-xl p-5 shadow-lg border border-gray-800 text-left">
              <button
                type="button"
                onClick={handleRefreshCharInfo}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
                title="캐릭터 정보 새로고침"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
              <div className="flex items-center gap-4 pr-8">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 flex-shrink-0">
                  <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center border border-gray-800 overflow-hidden">
                    {verifiedCharInfo.profileImage ? (
                      <Image src={verifiedCharInfo.profileImage} alt={verifiedCharInfo.nickname} width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${verifiedCharInfo.race === "천족" ? "bg-blue-500 text-white" : "bg-red-500 text-white"}`}>
                      {verifiedCharInfo.race}
                    </span>
                    <span className="text-gray-300 text-xs">{verifiedCharInfo.server}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white flex items-end gap-2">
                    {verifiedCharInfo.nickname}
                    <span className="text-xs font-normal text-gray-400 pb-0.5">
                      (Lv.{verifiedCharInfo.level} {verifiedCharInfo.jobClass})
                    </span>
                  </h3>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-black/40 rounded-lg p-3 text-center border border-white/5">
                  <p className="text-[10px] text-gray-400 mb-0.5">아이템 레벨</p>
                  <p className="text-sm font-bold text-white">Lv. {verifiedCharInfo.itemLevel}</p>
                </div>
                <div className="bg-black/40 rounded-lg p-3 text-center border border-white/5">
                  <p className="text-[10px] text-gray-400 mb-0.5">종합 전투력</p>
                  <p className="text-sm font-bold text-amber-400">{verifiedCharInfo.combatPower.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          
          {showCharFields && (
            <>
              <p className="text-xs text-gray-400 mb-4">파티/버스 모집글 작성시 대표 캐릭터로 등록 됩니다</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400">종족</label>
                    <select 
                      value={charRace} 
                      onChange={(e) => {
                        setCharRace(e.target.value);
                        setCharServer("");
                      }}
                      className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
                    >
                      <option value="">- 선택 -</option>
                      <option value="천족">천족</option>
                      <option value="마족">마족</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400">서버</label>
                    <select 
                      value={charServer} 
                      onChange={(e) => setCharServer(e.target.value)}
                      disabled={!charRace}
                      className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm disabled:bg-gray-800/50 disabled:text-gray-500 transition-all"
                    >
                      <option value="">- 선택 -</option>
                      {charRace && SERVER_LIST[charRace].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400">캐릭터 닉네임</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      value={charNickname}
                      onChange={(e) => setCharNickname(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
                      placeholder="아이온2 캐릭터 닉네임"
                    />
                  </div>
                </div>
              </div>

              {!isVerified && charNickname && (
                <div className="mt-4 p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-1">🛡️ 캐릭터 인증</h4>
                  <p className="text-xs text-cyan-300 mb-3 leading-relaxed">
                    게임에 접속하여 해당 캐릭터의 칭호를 <strong className="text-white">[{charRace === "천족" ? "카이시넬의 근원을 마주하다" : "지켈의 근원을 마주하다"}]</strong> 로 변경하신 후 아래 버튼을 클릭해주세요. 인증이 완료되면 모집글에 신뢰할 수 있는 인증 마크가 표시됩니다.
                  </p>
                  <div className="flex flex-col gap-3 items-start">
                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        checked={confirmTitleChange}
                        onChange={(e) => setConfirmTitleChange(e.target.checked)}
                        className="rounded border-gray-700 bg-gray-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900 w-4 h-4"
                      />
                      <span className="text-sm text-cyan-400 font-bold">
                        게임 내에서 칭호를 변경하셨습니까?
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={isLoading}
                      className="w-full sm:w-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-colors disabled:opacity-50"
                    >
                      {isLoading ? "인증 확인 중..." : "칭호 변경 확인 및 인증하기"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-300">비밀번호 변경</h3>
            <button
              type="button"
              onClick={() => {
                setShowPasswordFields(!showPasswordFields);
                if (showPasswordFields) {
                  setPassword("");
                  setPasswordConfirm("");
                }
              }}
              className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded border border-gray-700 transition-colors"
            >
              {showPasswordFields ? "취소" : "비밀번호 변경하기"}
            </button>
          </div>
          
          {showPasswordFields && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400">새 비밀번호</label>
                <div className="mt-1">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
                    placeholder="새로운 비밀번호를 입력하세요"
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400">새 비밀번호 확인</label>
                <div className="mt-1">
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
                    placeholder="새 비밀번호 다시 입력"
                    minLength={6}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {showRemovalWarning && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-400 font-bold mb-3">
              🚨 대표 캐릭터 정보를 변경하시면 기존의 공식 인증 마크가 즉시 삭제됩니다.
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmMarkRemoval}
                onChange={(e) => setConfirmMarkRemoval(e.target.checked)}
                className="rounded border-gray-700 bg-gray-800 text-red-500 focus:ring-red-500 focus:ring-offset-gray-900 w-4 h-4"
              />
              <span className="text-sm text-red-300 font-medium hover:text-red-200">
                위 내용을 확인했으며, 인증 마크 삭제에 동의합니다.
              </span>
            </label>
          </div>
        )}

        {errorMsg && (
          <div className="text-red-400 text-sm text-center font-medium bg-red-900/30 p-2 rounded-lg border border-red-900/50">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="text-cyan-400 text-sm text-center font-medium bg-cyan-900/30 p-2 rounded-lg border border-cyan-900/50">
            {successMsg}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] text-sm font-bold text-gray-900 bg-cyan-400 hover:bg-cyan-300 hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? "저장 중..." : "변경 내용 저장하기"}
          </button>
        </div>
      </form>
    </div>
  );
}

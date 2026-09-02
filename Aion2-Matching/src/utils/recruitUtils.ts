/**
 * 글 등록 후 30분이 지났는지 확인하는 함수
 * @param createdAt 글 등록 시간
 * @returns 30분 이상 지났으면 true, 아니면 false
 */
export const isExpired30Minutes = (createdAt: Date): boolean => {
  const now = new Date();
  const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
  return diffMinutes >= 30;
};

/**
 * 모집글의 표시 상태를 반환하는 함수
 * 30분이 지났고 모집중이면 자동으로 모집완료 처리
 * @param currentStatus 현재 상태
 * @param createdAt 글 등록 시간
 * @returns 표시할 상태
 */
export const getDisplayStatus = (currentStatus: string, createdAt: Date): string => {
  if (currentStatus === "모집중" && isExpired30Minutes(createdAt)) {
    return "모집완료";
  }
  return currentStatus;
};

export interface Application {
  id: number;
  post_id: number;
  post_type: string;
  applicant_id: string;
  applicant_nickname: string;
  applicant_race: string;
  applicant_server: string;
  applicant_job: string;
  applicant_role: string;
  is_verified?: boolean;
  message?: string;
  status: string;
  created_at: string;
}

export interface Recruit {
  id: number;
  type: "구인" | "구직" | "버스승객모집" | "버스기사구함";
  title: string;
  author: string;
  race: "천족" | "마족";
  server: string;
  role: "탱커" | "딜러" | "힐러" | "기사" | "승객" | string;
  jobClass: string;
  dungeon: string;
  time: string;
  status: "모집중" | "모집완료" | "예약완료" | string;
  is_verified?: boolean;
  createdAt: Date;
  created_at?: string;
  user_id?: string;
  description?: string;
}

export interface RecruitRow {
  id: number;
  type: string;
  title: string;
  author: string;
  race: string;
  server: string;
  role: string;
  jobclass: string;
  dungeon: string;
  time: string;
  status: string;
  description: string | null;
  is_verified: boolean | null;
  user_id: string | null;
  created_at: string;
  char_level: number | null;
  char_jobclass: string | null;
  char_itemlevel: number | null;
  char_combatpower: number | null;
  char_profileimage: string | null;
}

export function isValidRecruitType(type: string): type is Recruit["type"] {
  return ["구인", "구직", "버스승객모집", "버스기사구함"].includes(type);
}

export function isValidRace(race: string): race is "천족" | "마족" {
  return ["천족", "마족"].includes(race);
}

export function isValidRole(role: string): role is Recruit["role"] {
  return ["탱커", "딜러", "힐러", "기사", "승객"].includes(role);
}

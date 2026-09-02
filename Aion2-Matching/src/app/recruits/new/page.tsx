import { redirect } from "next/navigation";
import Header from "@/components/common/Header";
import { createClient } from "@/lib/supabase-server";
import RecruitForm from "@/components/recruit/RecruitForm";

export default async function RecruitNewPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // 보안: 컴포넌트에 넘길 때 전체 session 객체 대신 화면 표시에 필요한 메타데이터만 추출
  const initialUserMeta = session.user.user_metadata ? {
    charNickname: session.user.user_metadata.charNickname,
    charRace: session.user.user_metadata.charRace,
    charServer: session.user.user_metadata.charServer,
    isVerified: session.user.user_metadata.isVerified
  } : null;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-6 text-3xl font-bold text-white">모집글 작성</h1>
        <RecruitForm initialUserMeta={initialUserMeta} />
      </main>
    </>
  );
}
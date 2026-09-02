import { redirect } from "next/navigation";
import Header from "@/components/common/Header";
import { createClient } from "@/lib/supabase-server";
import ProfileForm from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const initialSession = {
    id: session.user.id,
    email: session.user.email || "",
    user_metadata: session.user.user_metadata || {},
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            내 정보 수정
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            사이트에서 사용하는 닉네임과 비밀번호를 변경할 수 있습니다.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <ProfileForm initialSession={initialSession} />
        </div>
      </main>
    </div>
  );
}

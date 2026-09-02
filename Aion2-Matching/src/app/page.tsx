import Header from "@/components/common/Header";
import { createClient } from "@/lib/supabase-server";
import HomeClient from "./HomeClient";

// 항상 최신 모집글을 보여주기 위해 SSR(서버 사이드 렌더링) 방식으로 동작하도록 설정
export const revalidate = 0;

/**
 * 메인 페이지 컴포넌트 (서버 컴포넌트)
 * 성능 최적화를 위해 DB에서 초기 데이터를 서버 측에서 미리 가져온 후(Pre-fetching)
 * 클라이언트 컴포넌트(HomeClient)로 전달합니다.
 */
export default async function Home() {
  const supabase = await createClient();

  const { data: recruitsData, error: recruitsError } = await supabase
    .from('recruits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const { data: busesData, error: busesError } = await supabase
    .from('buses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (recruitsError || busesError) {
    console.error("[SSR] Supabase 데이터를 가져오지 못했습니다.", recruitsError || busesError);
  }

  // 두 데이터를 합친 후 최신순으로 정렬
  const combinedData = [...(recruitsData || []), ...(busesData || [])].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // 서버에서 클라이언트로 Props 전달 시 직렬화(Serialization)를 위해 Date 변환 등을 처리
  const initialData = combinedData.map((item) => ({
    ...item,
    jobClass: item.jobclass, // DB 컬럼명 매핑
    createdAt: new Date(item.created_at), // 클라이언트에서 Date 객체로 사용할 수 있도록 변환(Next.js 14+부터 Date 직렬화 지원)
  }));

  return (
    <>
      <Header />
      <main>
        {/* 클라이언트 사이드 인터랙션(필터, 검색, 캐러셀)은 HomeClient가 전담합니다. */}
        <HomeClient initialData={initialData} />
      </main>
    </>
  );
}
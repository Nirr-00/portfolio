import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables! Please check your .env.local or Vercel settings.");
}

// "use client" 가 명시된 클라이언트 컴포넌트 전용 Supabase 클라이언트
export const supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);

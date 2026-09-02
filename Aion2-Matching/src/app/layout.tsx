import type { Metadata } from "next";
import "./globals.css";
import GlobalSearchSidebar from "@/components/common/GlobalSearchSidebar";
import { ToastProvider } from "@/contexts/ToastContext";
import { DialogProvider } from "@/contexts/DialogContext";

export const metadata: Metadata = {
  title: "아이온2 매칭 - 파티원 & 버스 모집",
  description: "아이온2의 파티원 구인구직과 버스 기사/승객 모집을 가장 빠르고 편하게 할 수 있는 커뮤니티입니다.",
  openGraph: {
    title: "아이온2 매칭 - 파티원 & 버스 모집",
    description: "아이온2의 파티원 구인구직과 버스 기사/승객 모집을 가장 빠르고 편하게 할 수 있는 커뮤니티입니다.",
    siteName: "아이온2 매칭",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <DialogProvider>
          <ToastProvider>
            <GlobalSearchSidebar />
            {children}
          </ToastProvider>
        </DialogProvider>
      </body>
    </html>
  );
}

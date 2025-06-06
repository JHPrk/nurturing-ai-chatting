import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "육아 전문가 멘토 - Gemini 챗봇",
  description: "따뜻하고 믿음직한 육아 전문가 멘토와 함께하는 AI 육아 상담",
  keywords: ["육아", "상담", "AI", "챗봇", "멘토", "육아전문가"],
  authors: [{ name: "Park 챗봇 팀" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "멘토 전문가 멘토 - Gemini 챗봇",
    description: "따뜻하고 믿음직한 멘토 전문가 멘토와 함께하는 AI 육아 상담",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

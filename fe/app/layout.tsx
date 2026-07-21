import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '토스 로그인',
  description: '토스 스타일 로그인 데모',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

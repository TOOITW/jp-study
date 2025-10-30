import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '日本語 N5 日常ドリル',
  description: 'N5 レベルの日本語学習用ドリルアプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

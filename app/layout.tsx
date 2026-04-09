import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "口述歷史訪問",
  description: "聲音優先的口述歷史保育工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK" className="h-full">
      <body className="min-h-full flex flex-col bg-amber-50 text-stone-800 antialiased">
        {children}
      </body>
    </html>
  );
}

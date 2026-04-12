import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "香港社區口述歷史",
  description: "社區的記憶，才是真正的歷史。以聲音保育香港長者的生命故事。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK" className="h-full">
      <body className="min-h-full flex flex-col bg-stone-950 text-stone-800 antialiased scroll-smooth">
        {children}
      </body>
    </html>
  );
}

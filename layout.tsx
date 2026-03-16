import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Clone Chat",
  description: "Chat with AI clones of your friends",
  themeColor: "#080810",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-void text-light antialiased overflow-hidden h-screen">
        {children}
      </body>
    </html>
  );
}

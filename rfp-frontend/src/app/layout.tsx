import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], display: 'swap', variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Akashic Space | Premium RFP Cloud",
  description: "Enterprise SaaS RFP Automation Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="bg-[#FAFAFA] text-zinc-900 antialiased selection:bg-blue-200">
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}

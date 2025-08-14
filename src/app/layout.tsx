import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const amita = localFont({
  variable: "--font-amita",
  src: [
    {
      path: "../../public/Amita/Amita-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/Amita/Amita-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Ibasho",
  description: "A soft place for your feelings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${amita.variable} antialiased bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50`}>
        <Providers>
          <div className="w-full min-h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

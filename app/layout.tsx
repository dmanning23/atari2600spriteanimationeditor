import type { Metadata } from "next";
import { Press_Start_2P, Share_Tech_Mono } from 'next/font/google';
import "./globals.css";

const pressStart = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start',
});

const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-share-tech',
});

export const metadata: Metadata = {
  title: "Atari 2600 Sprite Animation Editor",
  description: "Browser-based pixel art sprite editor for Atari 2600 game development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pressStart.variable} ${shareTechMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

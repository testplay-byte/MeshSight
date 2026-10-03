import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Frame from "@/components/Frame";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "MeshSight — Train your own object recognition",
    template: "%s | MeshSight",
  },
  description:
    "A complete, self-hosted pipeline for custom object detectors: annotate photos, split and cluster datasets in Colab, train YOLO, run it on your phone.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex h-dvh items-center justify-center overflow-hidden">
        <Frame>{children}</Frame>
      </body>
    </html>
  );
}

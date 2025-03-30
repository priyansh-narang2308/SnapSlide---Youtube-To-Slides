
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavbarLarge from "@/components/navbarLarge";
import { Toaster } from "@/components/ui/sonner"


const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SnapSlide",
  description: "Youtube to PowerPoint Presentation Generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <NavbarLarge/>
        {children}
                <Toaster />

      </body>
    </html>
  );
}

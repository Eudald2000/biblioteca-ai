import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CursorGlow } from "@/components/ui/CursorGlow";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Biblioteca Virtual',
    template: '%s | Biblioteca Virtual',
  },
  description: 'Plataforma de préstamo y compra de libros con panel de administración completo.',
  metadataBase: new URL('https://biblioteca-ai.vercel.app'),
  openGraph: {
    title: 'Biblioteca Virtual',
    description: 'Plataforma de préstamo y compra de libros con panel de administración completo.',
    url: 'https://biblioteca-ai.vercel.app',
    siteName: 'Biblioteca Virtual',
    locale: 'es_ES',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CursorGlow />
        {children}
      </body>
    </html>
  );
}

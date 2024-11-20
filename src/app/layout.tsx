'use client'

import "./globals.css";
import { usePathname } from 'next/navigation';
import NavigationBar from '@/components/NavigationBar';
import {LanguageProvider} from "@/context/LanguageContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const noNavRoutes = ['/register', '/', '/faithful-line', '/check-spot'];

  const shouldShowNav = !noNavRoutes.includes(pathname);

  return (
    <html lang="pt">
      <head ><title>Faithful Line</title></head>
      <body className="flex flex-col h-screen">
      <LanguageProvider>
        <div className="flex-1 overflow-auto">{children}</div>
        {shouldShowNav && <NavigationBar />}
      </LanguageProvider>
      </body>
    </html>
  );
}

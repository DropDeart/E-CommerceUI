"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider, useSession } from "next-auth/react";
import "./globals.css";
import { Provider } from 'react-redux';
import { store } from "@/store/store";
import AdminLayout from "../app/layouts/AdminLayout";
import UserLayout from "../app/layouts/UserLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>; 
  }

  if (session?.user?.role === 2) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <UserLayout>{children}</UserLayout>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Provider store={store}>
          <SessionProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </SessionProvider>
        </Provider>
      </body>
    </html>
  );
}

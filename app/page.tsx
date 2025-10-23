"use client";

import { useSession } from "next-auth/react";
import MasterPage from "./components/home/MasterPage";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === 2) {
      router.push("/admin/anasayfa");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "authenticated" && session?.user?.role === 2) {

    return null;
  }

  return (
    <div>
      <Navbar />
      <MasterPage />
      <Footer />
    </div>
  );
}

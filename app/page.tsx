"use client";

import { useSession } from "next-auth/react";
import MasterPage from "./components/home/MasterPage";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session?.user?.role === 2) {
    router.push("/admin/dashboard");
    return null;
  } else {
    return (
      <div>
        <Navbar />
        <MasterPage />
        <Footer />
      </div>
    );
  }
}
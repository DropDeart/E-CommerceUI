"use client"
import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

import Navbar from '../components/navbar/Navbar'
import Footer from '../components/footer/Footer'
import LeftMenu from './components/left-menu/LeftMenu'
import RightMenu from './components/right-menu/RightMenu'

const KullaniciBilgilerim = () => { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession();
  const router = useRouter();  

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Oturumunuz sonlanmıştır, lütfen giriş yapınız.");
      router.push("/giris-yap");
    }
  }, [status, router]);

  // Yüklenme durumunda hiçbir şey göstermeyelim
  if (status === "loading" || status === "unauthenticated") {
    return null;
  }

  return (
    <div>
        <Navbar/>
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="p-4 col-span-1 lg:col-span-3">
              <LeftMenu/>
            </div>     
            <div className="bg-white p-4 col-span-1 md:col-span-3 lg:col-span-8">      
              <RightMenu/>  
            </div>
          </div>
        </div>        
        <Footer/>
    </div>
  )
}

export default KullaniciBilgilerim;

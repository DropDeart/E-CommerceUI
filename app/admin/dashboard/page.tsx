'use client';

import React from 'react'
import {useSession, signOut } from "next-auth/react";

const Page = () => {
  const { data: session } = useSession();

  return (
    <div>
      <div className="mt-4">
                      {session ? (
                        <button onClick={() => signOut()} className="general-btn w-full">
                          Çıkış Yap
                        </button>
                      ) : (
                        <a href="/giris-yap" className="general-btn w-full">Giriş Yap</a>
                      )}
                    </div>
    </div>
  )
}

export default Page
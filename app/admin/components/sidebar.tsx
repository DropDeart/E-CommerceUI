'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Users, Settings, LogOut, Package, TableProperties, ChartBarStacked, ShoppingCart, ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { signOut, useSession } from "next-auth/react"
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

const links = [
  { href: '/admin/anasayfa', label: 'Anasayfa', icon: <Home size={18} /> },
  { href: '/admin/kategori', label: 'Kategori', icon: <ChartBarStacked size={18} /> },
  { 
    label: 'Ürünler', 
    icon: <Package size={18} />,
    children: [
      { href: '/admin/urunler', label: 'Ürün Listesi' }
    ]
  },
  { 
    label: 'Özellikler',
    icon: <TableProperties size={18} />,
    children: [
      { href: '/admin/ozellikler', label: 'Özellik Listesi' },
      { href: '/admin/ozellik-degerleri', label: 'Özellik Değerleri' },
    ]
  },
  { href: '/admin/users', label: 'Kullanıcılar', icon: <Users size={18} /> },
  { href: '/admin/ayarlar', label: 'Ayarlar', icon: <Settings size={18} /> },
  { href: '/admin/siparisler', label: 'Siparişler', icon: <ShoppingCart size={18} /> },
]

export function Sidebar() {
  const pathname = usePathname()
  const { status } = useSession()
  const router = useRouter()
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({})

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const linkClass = (href: string) => cn(
    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
    pathname === href
      ? 'bg-muted text-primary'
      : 'text-muted-foreground hover:bg-muted'
  )

  const collapsibleTriggerClass = (isOpen: boolean) => cn(
    'flex items-center justify-between w-full gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-muted',
    isOpen && 'bg-muted text-primary'
  )

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Oturumunuz sonlanmıştır, lütfen giriş yapınız.");
      router.push("/giris-yap");
    }
  }, [status, router])

  if (status === "loading" || status === "unauthenticated") return null

  return (
    <aside className="h-screen w-64 bg-white border-r shadow-sm flex flex-col">
      <div className="p-4 font-bold text-lg border-b">Admin Panel</div>
      <nav className="p-4 flex flex-col gap-2 flex-1">
        {links.map(link => {
          if (link.children) {
            const isOpen = !!openGroups[link.label]
            return (
              <Collapsible key={link.label} open={isOpen} onOpenChange={() => toggleGroup(link.label)}>
                <CollapsibleTrigger asChild>
                  <button className={collapsibleTriggerClass(isOpen)}>
                    <span className="flex items-center gap-3">
                      {link.icon}
                      {link.label}
                    </span>
                    <ChevronDown size={16} className={cn('transition-transform', isOpen && 'rotate-180')} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-8 flex flex-col gap-1 mt-1">
                  {link.children.map(child => (
                    <Link key={child.href} href={child.href} className={linkClass(child.href)}>
                      {child.label}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )
          } else {
            return (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {link.icon}
                {link.label}
              </Link>
            )
          }
        })}
      </nav>
      <div className="p-4 border-t">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full text-left hover:bg-muted"
        >
          <LogOut size={20} />
          Çıkış
        </button>
      </div>
    </aside>
  )
}

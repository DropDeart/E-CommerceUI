"use client"; // Bu, istemci tarafında çalıştırılmasını sağlar.

import { useState,useRef,useEffect  } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CardCount from "./CardCount";
import HamburgerMenu from "./HamburgerMenu";
import Logo from "./Logo";
import Search from "./Search";
import User from "./User";
import { AiOutlineUser, AiOutlineFileText, AiOutlineCreditCard, AiOutlineLogout  } from "react-icons/ai"
import Image from "next/image";
import { X } from "lucide-react";

const Navbar = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    const cleanName = name.replace(/\s+/g, ' ').trim(); 
    const nameParts = cleanName.split(" "); 
    return nameParts.map((part) => part[0].toUpperCase()).join(""); 
  };

  return (
    <div className="w-full bg-white">
      {/* Üstteki İndirim Alanı */}
      <div className="flex items-center justify-center bg-gray-100 py-2 relative">
        <i className="bi bi-ticket-perforated text-lg font-semibold pr-2"></i>
        <span className="text-sm font-medium">
          Mağaza genelinde %30 indirim! - Stoklarda sınırlıdır{" "}
          <Link href="/Magaza" className="text-blue-500 border-b border-blue-500 hover:text-blue-600">
            Mağaza <i className="bi bi-arrow-right pl-1"></i>
          </Link>
        </span>
        <div className="absolute right-4 cursor-pointer text-gray-500">
          <i className="bi bi-x-lg text-lg"></i>
        </div>
      </div>

      {/* Navbar */}
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <HamburgerMenu className="md:hidden block" onClick={toggleMenu} />
          <Logo />
        </div>
        <ul className="hidden md:flex gap-6 text-gray-600 font-medium">
          <li><Link href="/">Anasayfa</Link></li>
          <li><Link href="/Kategoriler">Kategoriler</Link></li>
          <li><Link href="/Urunler">Ürünler</Link></li>
          <li><Link href="/Iletisim">İletişim</Link></li>
        </ul>

        <div className="flex items-center gap-4 relative">
          <Search />
          {session ? (
        <>
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 p-2  cursor-pointer"
          >
            {/* Kullanıcı resmi veya baş harfleri */}
            {session.user?.profilePictureUrl ? (
              <img
                src={session.user?.profilePictureUrl}
                alt="User Avatar"
                className="w-9 h-9 rounded-full"
              />
            ) : (
              <div className="w-9 h-9 flex items-center justify-center bg-[#38CB89] text-white rounded-full">
                {getInitials(session.user?.name)}
              </div>
            )}
          </button>

          {dropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute left-0 top-14 w-48 bg-white border rounded-lg shadow-lg z-10"
                >
                  <ul className="py-2">
                    <li>
                      <Link href="/kullanici-bilgilerim" className="flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-200">
                        <AiOutlineUser size={20} />
                        Kullanıcı Bilgilerim
                      </Link>
                    </li>
                    <li>
                      <Link href="/siparislerim" className="flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-200">
                        <AiOutlineFileText size={20} />
                        Siparişlerim
                      </Link>
                    </li>
                    <li>
                      <Link href="/odeme-bilgilerim" className="flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-200">
                        <AiOutlineCreditCard size={20} />
                        Ödeme Bilgilerim
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={() => signOut()}
                        className="block px-4 py-2 w-full text-left hover:bg-gray-200 text-sm flex"
                      >
                        <AiOutlineLogout size={20} className="mr-2" />
                        Çıkış
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => router.push("/giris-yap")}
              className="p-2 text-white rounded-lg"
            >
              <User />
            </button>
          )}
          <CardCount />
        </div>
      </nav>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 h-screen z-50" onClick={toggleMenu}>
          <div
            className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="mb-5">
                <Image
                    src="/images/logo.png"
                    alt="Auraa"
                    width={60}
                    height={60}
                  />
                  <span className="pl-2 text-xl font-bold">Auraa</span>
              </div>
              <button onClick={toggleMenu} className="text-lg text-gray-500">
                <X />
              </button>
            </div>
            <ul className="flex flex-col gap-6 text-primary-text-color font-medium">
              <li><Link href="/" onClick={toggleMenu}>Anasayfa</Link></li>
              <li><Link href="/Kategoriler" onClick={toggleMenu}>Kategoriler</Link></li>
              <li><Link href="/Urunler" onClick={toggleMenu}>Ürünler</Link></li>
              <li><Link href="/Iletisim" onClick={toggleMenu}>İletişim</Link></li>
            </ul>

            <div className="mt-20">
              <div className="flex justify-between items-center border-b py-4">
                <span className="font-medium text-primary-text-color">Sepet</span>
                <div className="text-lg text-primary-text-color">
                  <i className="bi bi-bag"></i>
                </div>
              </div>
              <div className="flex justify-between items-center border-b py-4">
                <span className="font-medium text-primary-text-color">Favoriler</span>
                <div className="text-lg text-primary-text-color">
                  <i className="bi bi-heart"></i>
                </div>
              </div>
              <div className="mt-20">
                {session ? (
                  <button onClick={() => signOut()} className="general-btn w-full">
                    Çıkış Yap
                  </button>
                ) : (
                  <a href="/giris-yap" className="general-btn w-full">Giriş Yap</a>
                )}
              </div>              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;

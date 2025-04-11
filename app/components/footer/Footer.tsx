import Link from "next/link";
import Image from "next/image";
import { FaInstagram, FaFacebook, FaYoutube, FaTwitter} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-50 color-[#141718] py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-6 md:grid-cols-12 gap-8">
          {/* Marka Bilgisi */}
          <div className="col-span-6">
            <Link href="/" className="text-2xl font-semibold color-[#141718]">Ljuss</Link>
            <p className="primary-text-color py-6">
              Kaliteli ve uygun fiyatlı ürünleri keşfedin.
            </p>
            <div className="flex space-x-5">
              <Link href="https://twitter.com" target="_blank">
                <FaTwitter className="text-2xl primary-text-color" />
              </Link>
              <Link href="https://instagram.com" target="_blank">
                <FaInstagram className="text-2xl primary-text-color" />
              </Link>
              <Link href="https://facebook.com" target="_blank">
                <FaFacebook className="text-2xl primary-text-color" />
              </Link>
              <Link href="https://youtube.com" target="_blank">
                <FaYoutube className="text-2xl primary-text-color" />
              </Link>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-600">Anasayfa</Link></li>
              <li><Link href="/Magaza" className="text-gray-600">Mağaza</Link></li>
              <li><Link href="/Hakkimizda" className="text-gray-600">Hakkımızda</Link></li>
              <li><Link href="/Iletisim" className="text-gray-600">İletişim</Link></li>
            </ul>
          </div>

          {/* Gizlilik ve Kullanım */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-4">Gizlilik ve Kullanım</h3>
            <ul className="space-y-3">
              <li><Link href="/KisiselVeriler" className="text-gray-600">Kişisel Verilerin Korunması</Link></li>
              <li><Link href="/BilgiGuvenligi" className="text-gray-600">Bilgi Güvenliği</Link></li>
              <li><Link href="/CerezYonetimi" className="text-gray-600">Çerez Yönetimi</Link></li>
            </ul>
          </div>

          {/* İletişim Bilgileri */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-4">İletişim</h3>
            <p className="text-gray-600">
              Basınevleri Mah. 15. 36/7<br />
              Keçiören, ANKARA
            </p>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="border-t border-gray-300 mt-6">
        <div className="container mx-auto flex justify-between items-center pt-8">
            <p className="text-sm text-gray-600">© 2025 Ljuss - Tüm Hakları Saklıdır.</p>
            <div className="flex space-x-4">
              <Image src="/images/credit-cards/cards.png" alt="Kredi Kartları" width={300} height={30} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

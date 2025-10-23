// app/giris-yap/page.tsx
"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux"; 
import { setUser } from "@/store/slices/userSlice"; // Doğru path'i kontrol edin
import { FaSpinner } from "react-icons/fa";

export default function GirisYap() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch(); 

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false, // NextAuth'ın client tarafında otomatik yönlendirmesini engelleriz
      email,
      password,
      json: true, // Hatanın JSON olarak dönmesini sağlar
    });

    setLoading(false);

    if (res?.error) {
      console.error("Giriş sırasında NextAuth hatası:", res.error);
      try {
        const errorData = JSON.parse(res.error);

        // Hata kodlarına göre spesifik işlemler yapalım
        switch (errorData.errorCode) {
          case 401: // Kimlik bilgileri hatalı (E-posta veya şifre yanlış)
            toast.error(errorData.errorMessage || "E-posta veya şifre hatalı.");
            break;
          case 1004:
            const parts = errorData.errorMessage.split(':');           
            const userId = parts[1];
            const userEmail = parts[2];
            const userName = parts.length > 3 ? decodeURIComponent(parts[3]) : 'Bilinmeyen Kullanıcı';

            // Kullanıcı bilgilerini Redux store'a dispatch ediyoruz
            if (userId && userEmail && dispatch) {
              dispatch(setUser({
                userId: userId,
                userMail: userEmail,
                userName: userName
              }));
            }
            
            toast.info("Hesabınız doğrulanmamış. Doğrulama sayfasına yönlendiriliyorsunuz...");
            // Artık URL'ye query parametresi eklemeden yönlendiriyoruz.
            // Bilgiler Redux'tan alınacak.
            router.push("/kullanici-dogrulama");
            break;
          case 500: // Genel sunucu hatası
            toast.error(errorData.errorMessage || "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.");
            break;
          case 501: // Beklenmedik kimlik doğrulama durumu
            toast.error(errorData.errorMessage || "Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.");
            break;
          default: // Bilinmeyen diğer hatalar
            toast.error(errorData.errorMessage || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
            break;
        }

      } catch (e) {
        // Eğer res.error bir JSON string'i değilse (beklenmedik bir hata)
        console.error("Hata yanıtı parse edilirken sorun oluştu:", e, "Orijinal hata:", res.error);
        toast.error("Giriş işlemi sırasında beklenmedik bir hata oluştu.");
      }
    } else {
      // Başarılı giriş: res.ok true ve res.error null/undefined olacaktır.
      toast.success("Giriş başarılı! Yönlendiriliyorsunuz...");
      setTimeout(() => {
        router.push("/"); // Ana sayfaya veya başarılı giriş sonrası istenen sayfaya yönlendir
      }, 500); // Küçük bir gecikme toast'ın görünmesi için
    }
  };

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2">
      <div className="relative">
        <img
          src="/images/login/sign-up-lamp.jpg"
          alt="Ljuss"
          className="w-full h-[50vh] md:h-[100vh] lg:h-[100vh] object-cover"
        />
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-2xl font-semibold">
          Ljuss
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12 lg:p-24">
        <div className="w-full space-y-6">
          <h3 className="text-3xl">Giriş Yap</h3>
          <p className="text-gray-600">
            Hesabın yok mu?{" "}
            <Link href="/kayit-ol" className="active-text-color font-semibold">
              Kayıt Ol
            </Link>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="relative space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="general-input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="focus-border"></span>
            </div>

            <div className="relative space-y-4 mt-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Şifre"
                className="general-input w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="focus-border"></span>

              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm space-x-4 mt-8">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="checkbox-input" defaultChecked />
                <span className="text-gray-600">Beni Hatırla</span>
              </label>
              <a href="#" className="font-semibold">
                Şifremi Unuttum
              </a>
            </div>

            <button type="submit" className="general-btn w-full mt-8" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center">
                  <p className="mr-2">Giriş Yapılıyor </p>
                  <FaSpinner className="animate-spin text-white" />
                </span>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
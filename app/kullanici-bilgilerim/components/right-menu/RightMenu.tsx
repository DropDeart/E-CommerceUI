"use client"; // Client Component olduğundan emin olun

import { useSession, signOut } from 'next-auth/react';
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from "react-toastify"; // ToastContainer'ı da kullanacağız
import "react-toastify/dist/ReactToastify.css";
import { useFormik } from 'formik';
import * as Yup from 'yup';

const RightMenu = () => {
const { data: session, status, update } = useSession(); // status'u buraya ekle  // NEXT_PUBLIC_BACKEND_BASE_URL olarak değiştirdim, çünkü baseURL'e genellikle backend adresi verilir.
  // frontend URL'si için NEXT_PUBLIC_BASE_URL yerine başka bir isim kullanmak daha mantıklı olabilir
  // veya doğrudan backend URL'sini kullanırız.
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  const [showPassword, setShowPassword] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true); // Profil yükleniyor mu?

  // Kullanıcı bilgileri için formik
  const formikUserInfo = useFormik({
    initialValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      phoneNumber: "", // Bu alan API'den doldurulacak
    },
    // enableReinitialize: true sayesinde, userProfile state'i güncellendiğinde formik de güncellenir.
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("Ad ve Soyad alanı zorunludur."),
      email: Yup.string().email("Geçerli bir email giriniz.").required("Email alanı zorunludur."),
      phoneNumber: Yup.string()
        .matches(/^\+?\d{10,15}$/, 'Geçerli bir telefon numarası giriniz (örn: +905xxxxxxxxx).')
        .nullable(), // Telefon numarası boş olabilirse nullable yapın
    }),
    onSubmit: async (values) => {
      try {
        const response = await fetch(`${baseURL}/api/User/updateUser`, { // 'user' yerine 'User' (Controller adına göre)
          method: 'POST', // Kullanıcı bilgilerini güncellerken genellikle PUT veya PATCH kullanılır
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken || ''}` // session?.accessToken kullanıldı
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const errorData = await response.json();
          // Hata mesajını backend'den al veya genel bir hata mesajı göster
          throw new Error(errorData.errorMessage || errorData.message || "Bilgiler güncellenirken bir hata oluştu.");
        }

        // Backend başarılı bir yanıt döndürdüyse (status 2xx)
        // Eğer backend boş bir JSON objesi dönüyorsa (örneğin {}), bu satır hata vermez.
        // Ama eğer hiç JSON dönmüyorsa, 'response.json()' hala hata verebilir.
        const result = response.status === 204 ? null : await response.json(); // 204 No Content ise json'ı okuma

        console.log("Kullanıcı bilgileri güncelleme başarılı:", result);
        toast.success("Bilgileriniz başarıyla güncellendi!"); // Toast başarılı mesajı

        // Session'ı güncelle (name ve email gibi session'da tutulan alanlar için)
        await update({
          user: {
            ...session?.user, // Mevcut session.user bilgilerini koru
            name: values.name, // Güncel isim
            email: values.email, // Güncel email
            // Telefon numarası session'da tutulmuyorsa buraya eklemeyin.
            // Eğer backend güncel profil resmini de döndürüyorsa, onu da burada güncelleyebilirsiniz.
            // profilePictureUrl: result.profilePictureUrl gibi
          },
        });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Kullanıcı bilgileri güncellenirken hata oluştu:", error);
        toast.error(`Bilgiler güncellenirken hata oluştu: ${error.message || 'Bilinmeyen hata'}`); // Toast hata mesajı
      }
    },
  });

  // Şifre güncelleme için formik
  const formikPasswordUpdate = useFormik({
    initialValues: {
      CurrentPassword: "",
      NewPassword: "",
      ConfirmPassword: "",
    },
    validationSchema: Yup.object({
      CurrentPassword: Yup.string().required("Mevcut şifre gereklidir."),
      NewPassword: Yup.string()
        .min(6, "Şifre en az 6 karakter olmalıdır.")
        .required("Yeni şifre gereklidir."),
      ConfirmPassword: Yup.string()
        .oneOf([Yup.ref("NewPassword")], "Şifreler eşleşmiyor.")
        .required("Yeni şifreyi tekrar giriniz."),
    }),
    onSubmit: async (values) => {
      try {
        const response = await fetch(`${baseURL}/api/User/updateUserPassword`, { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken || ''}` // session?.accessToken kullanıldı
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.log(errorData)

          // Hata mesajını backend'den al veya genel bir hata mesajı göster
          throw new Error(errorData.errorMessage || errorData.message || "Şifre güncelleme başarısız oldu.");
        }

        const result = response.status === 204 ? null : await response.json(); // 204 No Content ise json'ı okuma
        console.log("Şifre güncelleme başarılı:", result);
        toast.success("Şifreniz başarıyla güncellendi!"); // Toast başarılı mesajı
        setTimeout(() => {
          signOut(); // NextAuth'un signOut fonksiyonu
        }, 2000);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast.error(`Şifre güncellenirken hata oluştu: ${error.message || 'Bilinmeyen hata'}`); // Toast hata mesajı
      }
    },
  });

  // Session geldiğinde ve bileşen yüklendiğinde kullanıcı bilgilerini çek
  useEffect(() => {
    const fetchUserData = async () => {
      // Session ve accessToken mevcutsa API çağrısı yap
      if (session?.accessToken) { // session?.user?.token yerine session?.accessToken kullanıyoruz
        setLoadingProfile(true);
        try {
          // session.user.id NextAuth'ın token callback'inde set edilmiş olmalı.
          // Eğer ID başka bir yerden geliyorsa, o kaynağı kullanmalısın.
          const userId = session.user.id;
          if (!userId) {
            throw new Error("Kullanıcı ID'si bulunamadı.");
          }

          const response = await fetch(`${baseURL}/api/User/getUserById/${userId}`, { // GetUserById için ID parametresi
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.accessToken}` // session.accessToken kullanıldı
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errorMessage || errorData.message || "Kullanıcı bilgileri çekilemedi.");
          }

          const userData = await response.json();
          // Formik değerlerini çekilen verilerle güncelle
          formikUserInfo.setValues({
            name: userData.name || session.user.name, // API'den geleni tercih et, yoksa session
            email: userData.email || session.user.email, // API'den geleni tercih et, yoksa session
            phoneNumber: userData.phoneNumber || "", // API'den gelen telefon numarası
          });
          
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.error("Kullanıcı bilgileri çekilirken hata oluştu:", error);
          toast.error(`Kullanıcı bilgileri yüklenemedi: ${error.message || 'Bilinmeyen hata'}`);
          // Hata durumunda session'dan gelen bilgileri kullanmaya devam et
          formikUserInfo.setValues({
            name: session?.user?.name || "",
            email: session?.user?.email || "",
            phoneNumber: "", // Telefon numarası API'den gelmiyorsa boş kalır
          });
        } finally {
          setLoadingProfile(false);
        }
      } else {
        // Session veya token yoksa (kullanıcı giriş yapmamışsa veya oturum süresi dolmuşsa)
        // Sadece session'dan gelen bilgileri kullan (bu durumda zaten çok az bilgi olur)
        formikUserInfo.setValues({
          name: session?.user?.name || "",
          email: session?.user?.email || "",
          phoneNumber: "",
        });
        setLoadingProfile(false);
      }
    };

    // Yalnızca session.status 'authenticated' olduğunda veya accessToken değiştiğinde fetchUserData'yı çalıştır
    if (status === "authenticated") {
      fetchUserData();
    } else if (status === "unauthenticated") {
      setLoadingProfile(false); // Oturum yoksa yüklemeyi bitir
    }
  }, [session, baseURL, formikUserInfo.setValues]); // formikUserInfo.setValues'ı bağımlılıklara ekle

  // Eğer profil bilgileri henüz yüklenmediyse (loadingProfile true ise)
  if (loadingProfile) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Kullanıcı bilgileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
        {/* Kullanıcı Bilgileri */}
        <div className="col-span-6 space-y-6 border p-4 rounded-md">
          <form onSubmit={formikUserInfo.handleSubmit}>
            <h3 className="text-xl font-bold mb-10">Üyelik Bilgilerim</h3>

            <div className='form-group mb-4'>
              <label className="secondary-text-color">Ad ve Soyad</label>
              <input
                type="text"
                className="general-input w-full"
                placeholder="Lütfen adınızı ve soyadınızı giriniz"
                {...formikUserInfo.getFieldProps("name")}
              />
              {formikUserInfo.touched.name && formikUserInfo.errors.name && (
                <div className="text-red-500">{formikUserInfo.errors.name}</div>
              )}
            </div>

            <div className='form-group mb-4'>
              <label className="secondary-text-color">Email</label>
              <input
                type="email"
                readOnly
                disabled
                className="general-input w-full opacity-80"
                placeholder="Lütfen email adresinizi giriniz"
                {...formikUserInfo.getFieldProps("email")}
              />
              {formikUserInfo.touched.email && formikUserInfo.errors.email && (
                <div className="text-red-500">{formikUserInfo.errors.email}</div>
              )}
            </div>

            <div className='form-group mb-4'>
              <label className="secondary-text-color">Telefon</label>
              <input
                type="text"
                className="general-input w-full"
                placeholder="Lütfen telefon numaranızı giriniz"
                {...formikUserInfo.getFieldProps("phoneNumber")}
              />
              {formikUserInfo.touched.phoneNumber && formikUserInfo.errors.phoneNumber && (
                <div className="text-red-500">{formikUserInfo.errors.phoneNumber}</div>
              )}
            </div>

            <button type="submit" className="general-btn w-full mt-10">Güncelle</button>
          </form>
        </div>

        {/* Şifre Güncelleme */}
        <div className="col-span-6 space-y-6 border p-4 rounded-md">
          <form onSubmit={formikPasswordUpdate.handleSubmit}>
            <h3 className="text-lg font-semibold mb-10">Şifre Güncelle</h3>

            <div className="relative mb-4">
              <label className="secondary-text-color">Mevcut Şifre</label>
              <input
                type={showPassword ? "text" : "password"}
                className="general-input w-full"
                placeholder="Mevcut şifrenizi giriniz"
                {...formikPasswordUpdate.getFieldProps("CurrentPassword")}
              />
              {formikPasswordUpdate.touched.CurrentPassword && formikPasswordUpdate.errors.CurrentPassword && (
                <div className="text-red-500">{formikPasswordUpdate.errors.CurrentPassword}</div>
              )}
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
              </button>
            </div>

            <div className="relative mb-4">
              <label className="secondary-text-color">Yeni Şifre</label>
              <input
                type={showPassword ? "text" : "password"}
                className="general-input w-full"
                placeholder="Yeni şifrenizi giriniz"
                {...formikPasswordUpdate.getFieldProps("NewPassword")}
              />
              {formikPasswordUpdate.touched.NewPassword && formikPasswordUpdate.errors.NewPassword && (
                <div className="text-red-500">{formikPasswordUpdate.errors.NewPassword}</div>
              )}
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
              </button>
            </div>

            <div className="relative">
              <label className="secondary-text-color">Yeni Şifre Tekrarı</label>
              <input
                type={showPassword ? "text" : "password"}
                className="general-input w-full"
                placeholder="Yeni şifre tekrar"
                {...formikPasswordUpdate.getFieldProps("ConfirmPassword")}
              />
              {formikPasswordUpdate.touched.ConfirmPassword && formikPasswordUpdate.errors.ConfirmPassword && (
                <div className="text-red-500">{formikPasswordUpdate.errors.ConfirmPassword}</div>
              )}
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
              </button>
            </div>

            <button type="submit" className="general-btn w-full mt-10">Güncelle</button>
          </form>
        </div>
      </div>
      <ToastContainer /> {/* Toast bildirimlerini göstermek için eklemeyi unutma */}
    </div>
  );
}

export default RightMenu;
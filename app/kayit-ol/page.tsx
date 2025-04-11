"use client"
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/slices/userSlice";

export default function KayitOl() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();
  //Redux UserInformation
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("Ad zorunludur"),
      lastName: Yup.string().required("Soyad zorunludur"),
      email: Yup.string().email("Geçerli bir email girin").required("Email zorunludur"),
      password: Yup.string()
        .min(6, "Şifre en az 6 karakter olmalı")
        .required("Şifre zorunludur"),
    }),
    onSubmit: async (values) => {
      setLoading(true);

      try {
        const response = await fetch(`${baseURL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${values.firstName} ${values.lastName}`,
            email: values.email,
            password: values.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.errorMessage || "Kayıt başarısız");
        }

        dispatch(setUser({userId:data.token.user.id, userMail: data.token.user.email, userName: data.token.user.name}));


        toast.success("Kayıt başarılı! E-posta doğrulaması için mailinizi kontrol edin. Yönlendiriliyorsunuz..");
        
        setTimeout(() => {
          router.push("/kullanici-dogrulama");
        }, 2000);

      } catch (error) {        
        if (error instanceof Error) {
          toast.error(error.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
        } else {
          toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Sol Taraf - Resim */}
      <div className="relative">
        <img
          src="/images/login/sign-up-lamp.jpg"
          alt="Ljuss"
          className="w-full h-[50vh] md:h-[100vh] lg:h-[100vh] object-cover"
        />
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-2xl font-semibold">Ljuss</div>
      </div>

      {/* Sağ Taraf - Form */}
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-24">
        <div className="w-full space-y-6">
          <h3 className="text-3xl">Kayıt Ol</h3>
          <p className="text-gray-600">
            Zaten hesabın var mı? {" "}
            <Link href="/giris-yap" className="active-text-color font-semibold">
              Giriş Yap
            </Link>
          </p>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <input
              type="text"
              placeholder="Adınız"
              className="general-input w-full"
              {...formik.getFieldProps("firstName")}
            />
            {formik.touched.firstName && formik.errors.firstName && <p className="text-red-500">{formik.errors.firstName}</p>}

            <input
              type="text"
              placeholder="Soyadınız"
              className="general-input w-full"
              {...formik.getFieldProps("lastName")}
            />
            {formik.touched.lastName && formik.errors.lastName && <p className="text-red-500">{formik.errors.lastName}</p>}

            <input
              type="email"
              placeholder="Email"
              className="general-input w-full"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email && <p className="text-red-500">{formik.errors.email}</p>}

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Şifre"
                className="general-input w-full"
                {...formik.getFieldProps("password")}
              />
              <button
                type="button"
                className="absolute right-4 bottom-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && <p className="text-red-500">{formik.errors.password}</p>}

            <div className="flex items-center space-x-2 text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="checkbox-input" required />
                <span className="text-gray-600">
                  <span className="font-semibold">Site Kullanım Koşullarını</span> ve {" "}
                  <span className="font-semibold">Aydınlatma Metnini</span> kabul ediyorum.
                </span>
              </label>
            </div>

            <button type="submit" className="general-btn w-full" disabled={loading}>
              {loading ? "Kayıt Olunuyor..." : "Kayıt Ol"}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

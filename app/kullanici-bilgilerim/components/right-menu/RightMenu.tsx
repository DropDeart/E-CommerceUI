"use client"
import { useSession } from 'next-auth/react'
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import React, { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const RightMenu = () => {
  const { data: session } = useSession();
  const fullName = session?.user.name || "";
  const userEmail = session?.user.email || "";

  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("Ad ve Soyad alanı zorunludur"),
    email: Yup.string().email("Geçerli bir email giriniz").required("Email alanı zorunludur"),
    phoneNumber: Yup.string().required("Telefon numarası zorunludur"),
    currentPassword: Yup.string(),
    password: Yup.string().min(6, "Şifre en az 6 karakter olmalıdır"),
    passwordAgain: Yup.string().oneOf([Yup.ref('password')], 'Şifreler eşleşmiyor'),
  }).test(
    'password-fields',
    function (value) {
      const { currentPassword, password, passwordAgain } = value;
      const anyPasswordFieldFilled = currentPassword || password || passwordAgain;

      if (anyPasswordFieldFilled) {
        if (!currentPassword) {
          return this.createError({
            path: 'currentPassword',
            message: 'Mevcut şifre gereklidir'
          });
        }
        if (!password) {
          return this.createError({
            path: 'password',
            message: 'Yeni şifre gereklidir'
          });
        }
        if (!passwordAgain) {
          return this.createError({
            path: 'passwordAgain',
            message: 'Yeni şifreyi tekrar giriniz'
          });
        }
      }
      return true;
    }
  );

  const formik = useFormik({
    initialValues: {
      name : fullName,
      email: userEmail,
      phoneNumber: "", // Yeni eklendi
      currentPassword: "",
      password: "",
      passwordAgain: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Form gönderildi", values);
      // API isteği buraya gelebilir
    },
  });

  useEffect(() => {
    formik.setFieldValue("name", fullName);
    formik.setFieldValue("email", userEmail);
  }, [session]);

  return (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
          {/* Kullanıcı Bilgileri */}
          <div className="col-span-6 space-y-6 border p-4 rounded-md">
            <form onSubmit={formik.handleSubmit}>
              <h3 className="text-xl font-bold mb-10">Üyelik Bilgilerim</h3>
              <div className='form-group mb-4'>
                <label className="secondary-text-color">Ad ve Soyad</label>
                <input
                  type="text"
                  className="general-input w-full"
                  placeholder="Lütfen adınızı ve soyadınızı giriniz"
                  {...formik.getFieldProps("name")}
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="text-red-500">{formik.errors.name}</div>
                )}
              </div>           
              <div className='form-group mb-4'>
                <label className="secondary-text-color">Email</label>
                <input
                  type="email"
                  readOnly
                  disabled
                  className="general-input w-full"
                  placeholder="Lütfen email adresinizi giriniz"
                  {...formik.getFieldProps("email")}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-red-500">{formik.errors.email}</div>
                )}
              </div>

              <div>
                <label className="secondary-text-color">Telefon</label>
                <input
                  type="text"
                  className="general-input w-full"
                  placeholder="Lütfen telefon numaranızı giriniz"
                  {...formik.getFieldProps("phoneNumber")}
                />
                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                  <div className="text-red-500">{formik.errors.phoneNumber}</div>
                )}
              </div>
              <button type="submit" className="general-btn w-full mt-10">Güncelle</button>
            </form>
          </div>
          {/* Şifre Güncelleme */}
          <div className="col-span-6 space-y-6 border p-4 rounded-md">
          <form onSubmit={formik.handleSubmit}>
            <h3 className="text-lg font-semibold mb-10">Şifre Güncelle</h3>
              <div className="relative mb-4">
                <label className="secondary-text-color">Mevcut Şifre</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="general-input w-full"
                  placeholder="Mevcut şifrenizi giriniz"
                  {...formik.getFieldProps("currentPassword")}
                />
                {formik.touched.currentPassword && formik.errors.currentPassword && (
                  <div className="text-red-500">{formik.errors.currentPassword}</div>
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
                  {...formik.getFieldProps("password")}
                />
                {formik.touched.password && formik.errors.password && (
                  <div className="text-red-500">{formik.errors.password}</div>
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
                  {...formik.getFieldProps("passwordAgain")}
                />
                {formik.touched.passwordAgain && formik.errors.passwordAgain && (
                  <div className="text-red-500">{formik.errors.passwordAgain}</div>
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
    </div>
  );
}

export default RightMenu;

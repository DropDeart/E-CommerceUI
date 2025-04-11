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

  // Ad ve soyadı ayır
  const nameParts = fullName.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Şifre alanlarını tüm alanlarda aynı show/hide durumu ile yönetiyoruz
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object({
    firstName: Yup.string().required("Ad alanı zorunludur"),
    lastName: Yup.string().required("Soyad alanı zorunludur"),
    email: Yup.string().email("Geçerli bir email giriniz").required("Email alanı zorunludur"),
    currentPassword: Yup.string(),
    password: Yup.string().min(6, "Şifre en az 6 karakter olmalıdır"),
    passwordAgain: Yup.string().oneOf([Yup.ref('password')], 'Şifreler eşleşmiyor'),
  }).test(
    'password-fields',
    function (value) {
      const { currentPassword, password, passwordAgain } = value;
      const anyPasswordFieldFilled = currentPassword || password || passwordAgain;
  
      if (anyPasswordFieldFilled) {
        // Eğer herhangi bir password alanı doluysa tüm alanlar required olmalı
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
      firstName: firstName,
      lastName: lastName,
      email: userEmail,
      currentPassword: "",
      password: "",
      passwordAgain: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Form gönderildi", values);
      // API isteği yapılabilir
    },
  });

  useEffect(() => {
    formik.setFieldValue("firstName", firstName);
    formik.setFieldValue("lastName", lastName);
    formik.setFieldValue("email", userEmail);
  }, [session]);

  return (
    <div>
      <h3 className="text-xl font-bold">Üyelik Bilgilerim</h3>
      <form onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-0 md:gap-5 lg:gap-10">
          <div className="col-span-1 md:col-span-1 lg:col-span-6">
            <div className="form-group mt-8">
              <label className="secondary-text-color">Ad</label>
              <input
                type="text"
                className="general-input"
                placeholder="Lütfen adınızı giriniz"
                {...formik.getFieldProps("firstName")}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <div className="text-red-500">{formik.errors.firstName}</div>
              )}
            </div>
          </div>
          <div className="col-span-1 md:col-span-1 lg:col-span-6">
            <div className="form-group mt-8">
              <label className="secondary-text-color">Soyad</label>
              <input
                type="text"
                className="general-input"
                placeholder="Lütfen soyadınızı giriniz"
                {...formik.getFieldProps("lastName")}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <div className="text-red-500">{formik.errors.lastName}</div>
              )}
            </div>
          </div>
        </div>
        <div className="form-group mt-8">
          <label className="secondary-text-color">Email</label>
          <input
            type="email"
            className="general-input"
            placeholder="Lütfen email adresinizi giriniz"
            {...formik.getFieldProps("email")}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-red-500">{formik.errors.email}</div>
          )}
        </div>

        <h3 className="text-xl font-bold mt-12">Şifre Güncelleme</h3>

        <div className="relative space-y-4 mt-8">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Lütfen mevcut şifrenizi giriniz"
            className="general-input w-full"
            {...formik.getFieldProps("currentPassword")}
          />
          {formik.touched.currentPassword && formik.errors.currentPassword && (
            <div className="text-red-500">{formik.errors.currentPassword}</div>
          )}
          <button
            type="button"
            className="absolute right-4 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
          </button>
        </div>

        <div className="relative space-y-4 mt-8">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Lütfen yeni şifrenizi giriniz"
            className="general-input w-full"
            {...formik.getFieldProps("password")}
          />
          {formik.touched.password && formik.errors.password && (
            <div className="text-red-500">{formik.errors.password}</div>
          )}
          <button
            type="button"
            className="absolute right-4 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
          </button>
        </div>

        <div className="relative space-y-4 mt-8">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Lütfen yeni şifrenizi tekrar giriniz"
            className="general-input w-full"
            {...formik.getFieldProps("passwordAgain")}
          />
          {formik.touched.passwordAgain && formik.errors.passwordAgain && (
            <div className="text-red-500">{formik.errors.passwordAgain}</div>
          )}
          <button
            type="button"
            className="absolute right-4 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
          </button>
        </div>

        <button type="submit" className="general-btn w-full mt-12">Güncelle</button>
      </form>
    </div>
  );
}

export default RightMenu;

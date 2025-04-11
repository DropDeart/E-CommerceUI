"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]); // 6 haneli kod
  const [timer, setTimer] = useState(300); // 5 dakika (300 saniye)
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const { userId, userName, userMail } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsResendDisabled(false);
    }
  }, [timer]);

  const handleCodeChange = (index: number, value: string) => {
    const newCode = [...code];
    if (value === "") {
      if (index > 0) {
        document.getElementById(`code-${index - 1}`)?.focus();
      }
      newCode[index] = "";
    } else {
      if (index < 5) {
        document.getElementById(`code-${index + 1}`)?.focus();
      }
      newCode[index] = value;
    }
    setCode(newCode);
  };

  const handleResendCode = () => {
    console.log("Yeniden kod gönderiliyor...");
    setTimer(300); // Süreyi sıfırla
    setIsResendDisabled(true); // Butonu tekrar devre dışı bırak
  };

  const formik = useFormik({
    initialValues: {
      code: "", // code alanını ekleyin
      userId: userId || "",
    },
    validationSchema: Yup.object({
      code: Yup.string().length(6, "Kod 6 haneli olmalıdır").required("Doğrulama kodu gereklidir"),
    }),
    onSubmit: async (values) => {
      console.log('click');
      const verificationCode = values.code; // code state'i yerine formik.values.code kullanın
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: values.userId,
            code: verificationCode,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.errorMessage || "Doğrulama başarısız");
        }

        toast.success("Hesap doğrulandı! Yönlendiriliyorsunuz..");

        setTimeout(() => {
          router.push("/giris-yap");
        }, 2000);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
        } else {
          toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
        }
      }
    },
  });

  // code state'ini formik.values.code ile senkronize et
  useEffect(() => {
    formik.setFieldValue("code", code.join(""));
  }, [code]);

  const isCodeComplete = code.every((digit) => digit !== "");

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F3F3F3]">
      <div className="bg-white p-8 rounded-lg shadow-md text-center w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-[var(--primary-text-color)]">
          Hesap Doğrulama
        </h1>
        <p>Hoşgeldiniz, {userName}!</p>
        <p className="text-[var(--soft-text-color)] mb-6">
          Lütfen {userMail} mail adresinize gelen 6 haneli doğrulama kodunu giriniz.
        </p>

        <form onSubmit={formik.handleSubmit}>
          <input type="hidden" name="userId" value={formik.values.userId} />

          <div className="flex justify-center space-x-2 mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                className="w-12 h-12 text-center border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            type="submit"
            className={`general-btn w-1/2 bg-blue-500 text-white py-2 px-4 rounded-lg transition duration-300 ${
              !isCodeComplete ? "opacity-50 cursor-not-allowed" : "bg-[var(--active-text-color)]"
            }`}
            disabled={!isCodeComplete}
          >
            Onayla
          </button>

          <div className="mt-6 text-[var(--soft-text-color)]">
            <p>
              Kalan Süre: {Math.floor(timer / 60)}:
              {timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
            </p>
            <button
              onClick={handleResendCode}
              disabled={isResendDisabled}
              className={`mt-2 ${isResendDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              Yeniden Kod Gönder
            </button>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default VerificationPage;
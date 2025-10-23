/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import https from "https";

// Ortam değişkenlerinden baseURL'i alıyoruz
const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

// HTTPS agent'ı tanımlıyoruz.
// Geliştirme ortamında self-signed sertifikaları görmezden gelmek için rejectUnauthorized: false ayarını kullanıyoruz.
const agent = new https.Agent({
  rejectUnauthorized: false,
});

/**
 * Access Token'ın süresi dolduğunda yeni bir Access Token almak için kullanılan fonksiyon.
 * Backend'in /api/Auth/refreshToken endpoint'ini çağırır.
 * Refresh Token, tarayıcı tarafından HttpOnly cookie olarak otomatik gönderilir.
 */
async function refreshAccessToken(token: any) {
  try {
    const response = await axios.post(
      `${baseURL}/api/Auth/refreshToken`, // Backend'deki refresh token endpoint'i
      {}, // Request body boş olabilir, çünkü refresh token cookie'den gidecek
      {
        httpsAgent: agent, // HTTPS agent'ı kullanmaya devam
        withCredentials: true, // Çok önemli! Cookie'lerin gönderilmesini sağlar
        headers: {
            'Content-Type': 'application/json',
        }
      }      
    );

    // Backend'den dönen AuthResponseDto yapısını bekliyoruz
    const data = response.data; // Bu 'data' objesi Access Token, expiresIn vs. içermeli

    // Backend'den token gelmediyse veya geçersizse hata fırlat
    if (!data || !data.token) {
      console.error("Refresh token API call failed: No new access token received from backend.", data);
      throw new Error("Failed to refresh token: Invalid response from backend.");
    }

    console.log("Access token successfully refreshed:", data);

    // Yeni Access Token ve Expires bilgisini mevcut token objesine ekleyip geri dönüyoruz.
    // Refresh token cookie'de otomatik yönetildiği için burada döndürmeye gerek yok.
    return {
      ...token, // Mevcut token objesindeki diğer bilgileri koru (id, name, email, isVerified, role vb.)
      accessToken: data.token, // Backend'den gelen YENİ Access Token
      accessTokenExpires: Date.now() + data.expiresIn * 1000, // Yeni Access Token'ın son kullanma zamanı (milisaniye)
      refreshToken: data.refreshToken ?? token.refreshToken
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    // Hata durumunda oturumu sonlandırmak için bir hata işareti ekliyoruz.
    // Bu, session callback'inde kontrol edilerek kullanıcının logout olmasına neden olabilir.
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userName: { label: "Kullanıcı Adı : ", type: "text", placeholder: "Kullanıcı adı giriniz" },
        password: { label: "Şifre :", type: "password", placeholder: "Şifrenizi giriniz" },
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        console.log("NextAuth authorize callback - Gönderilen Credentials:", credentials);

        try {
          const response = await axios.post(
            `${baseURL}/api/Auth/login`, // Backend'deki login endpoint'i
            {
              email: credentials?.email,
              password: credentials?.password,
            },
            {
              httpsAgent: agent,
              withCredentials: true, // Backend'den refresh token cookie'sini almak için
            }
          );

          const authResponseData = response.data; // Backend'den gelen AuthResponseDto

          console.log("NextAuth authorize callback - Backend'den gelen AuthResponseData:", authResponseData);

          // 1. Senaryo: Backend'den geçersiz/eksik bir yanıt (authResponseData null veya user objesi yok)
          // Bu durum, yanlış kimlik bilgileri gönderildiğinde veya backend'in beklenmedik bir hata ile null döndüğünde oluşur.
          if (!authResponseData || !authResponseData.user) {
            console.error("NextAuth authorize callback - Authentication failed: Invalid or missing response data from backend.");
            throw new Error(
              JSON.stringify({
                errorMessage: "E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.",
                errorCode: 401, // Unauthorized
              })
            );
          }

          const user = authResponseData.user; // Kullanıcı bilgileri direkt user objesi içinde

          // 2. Senaryo: Kullanıcı doğrulanmamış (Email doğrulama gereksinimi)
          // Backend'den token null olarak gelse bile, user objesi ve isVerified alanı mevcut olur.
          if (!user.isVerified) {
            console.log("NextAuth authorize callback - User is not verified:", user.email);
            // Bu hatayı fırlatıyoruz, NextAuth'ın `redirect` callback'i bunu yakalayıp işleyecek.
            throw new Error(
              JSON.stringify({
                errorCode: 1004, // Kendi belirlediğimiz "EMAIL_NOT_VERIFIED" kodu
                errorMessage: `EMAIL_NOT_VERIFIED:${user.id}:${user.email}:${user.name || 'Bilinmeyen Kullanıcı'}`, // Detaylı mesaj
              })
            );
          }

          // 3. Senaryo: Başarılı ve doğrulanmış giriş
          // Bu noktaya geldiysek, kullanıcı doğrulanmıştır ve backend'den token gelmiştir.
          if (!authResponseData.token) {
            // Bu durum normalde olmamalıdır: isVerified true ama token null.
            // Bir hata ayıklama veya beklenmedik bir durum için.
            console.error("NextAuth authorize callback - User is verified but token is missing. This is an unexpected state.");
            throw new Error(JSON.stringify({
              errorMessage: "Beklenmedik bir kimlik doğrulama durumu oluştu. Lütfen tekrar deneyin.",
              errorCode: 501
            }));
          }

          const accessToken = authResponseData.token; // Access Token
          const refreshToken = authResponseData.refreshToken; // Refresh Token (cookie'den de yönetiliyor)

          // NextAuth'a dönecek kullanıcı objesi
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.profilePictureUrl || null, // NextAuth'ın kendi 'image' property'si
            isVerified: user.isVerified,
            role: user.role,
            accessToken: accessToken, // Access Token'ı user objesine ekliyoruz (jwt callback'i için)
            refreshToken: refreshToken, // Refresh Token'ı da ekleyelim (jwt callback'i için)
            accessTokenExpires: Date.now() + authResponseData.expiresIn * 1000, // Milisaniye cinsinden son kullanma tarihi
          };
        }  catch (error: any) {         

          let errorMessageToThrow = {
            errorMessage: "Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
            errorCode: 500,
          };

          // Eğer hata bizim özel JSON formatımızda fırlatıldıysa (örn: EMAIL_NOT_VERIFIED)
          if (typeof error.message === 'string' && error.message.startsWith('{') && error.message.endsWith('}')) {
              try {
                  const parsedError = JSON.parse(error.message);
                  if (parsedError.errorCode) {
                      console.log("Özel JSON hatası tespit edildi, dönüştürülüyor:", parsedError);
                      errorMessageToThrow = parsedError; // Özel hatayı kullan
                  }
              } catch (e) {
                  console.log("Hata mesajı JSON formatında değil veya geçerli bir özel hata objesi içermiyor.", e);
              }
          } else if (axios.isAxiosError(error) && error.response) {
            // Eğer bir Axios hatasıysa
            errorMessageToThrow.errorMessage = error.response.data?.errorMessage || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";
            errorMessageToThrow.errorCode = error.response.status; // HTTP durum kodunu kullan
          }
          
          // NextAuth'a fırlatılacak son hata objesini oluştur.
          // NextAuth'ın hata yakalama mekanizması, fırlatılan Error objesinin 'message' özelliğini
          // alır ve bunu URL'ye 'error' query parametresi olarak ekler.
          console.log("NextAuth'a fırlatılan son hata:", errorMessageToThrow);
          throw new Error(JSON.stringify(errorMessageToThrow)); // Bu satır en önemli değişiklik
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 1. İlk Giriş (authorize'dan gelen 'user' objesi dolar)
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.isVerified = user.isVerified;
        token.role = user.role;
        token.accessToken = (user as any).accessToken; // authorize'dan gelen accessToken'ı token'a aktar
        token.refreshToken = (user as any).refreshToken; // authorize'dan gelen refreshToken'ı token'a aktar
        token.accessTokenExpires = (user as any).accessTokenExpires; // authorize'dan gelen süre

        console.log("JWT Callback - Initial User Login:", token);
      }

      // 2. Profil Resmi Güncelleme (isteğe bağlı)
      if (trigger === "update" && session?.user?.profilePictureUrl) {
        token.image = session.user.profilePictureUrl;
        console.log("JWT Callback - Profile picture updated.");
      }

      // 3. Access Token Süre Kontrolü ve Yenileme
      // Token'ın süresi dolmak üzereyse (örn. 5 dakika kala) veya dolduysa
      // `token.accessTokenExpires` bir timestamp (milisaniye) olduğu için `Date.now()` ile karşılaştırıyoruz.
      const shouldRefreshTime = 5 * 60 * 1000; // 5 dakika (milisaniye cinsinden)
      if (token.accessToken && token.accessTokenExpires && Date.now() < token.accessTokenExpires - shouldRefreshTime) {
        // Access Token hala geçerli veya süresi dolmak üzere değil, yenilemeye gerek yok
        console.log("JWT Callback - Access Token is still valid.");
        return token;
      }

      // Access Token süresi doldu veya dolmak üzere, yenileme işlemini başlat
      // Veya hiç token yoksa (ama user var ve session açılmaya çalışılıyor)
      console.log("JWT Callback - Access Token expired or about to expire, attempting refresh...");
      return refreshAccessToken(token); // Yukarıdaki refreshAccessToken fonksiyonunu çağır
    },

    async session({ session, token }) {
      if (token) {
        console.log("Session Callback - Final Token State:", token);
        session.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          profilePictureUrl: token.image as string, // NextAuth'ın 'image'ini kullan
          isVerified: token.isVerified as boolean,
          role: token.role as number,
        };
        session.accessToken = token.accessToken as string; // Access Token'ı session'a ekle
        session.error = token.error as string | undefined; // Refresh token hatasını session'a ekle
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      const parsedUrl = new URL(url, baseUrl);
      const errorParam = parsedUrl.searchParams.get("error");

      // Eğer hata parametresi varsa ve bu bizim 1004 kodlu hatamızsa,
      // doğrudan doğrulama sayfasına yönlendir, query param olmadan.
      if (errorParam) {
        try {
          const errorObj = JSON.parse(decodeURIComponent(errorParam));
          if (errorObj.errorCode === 1004) {
            return `${baseUrl}/kullanici-dogrulama`;
          }
        } catch (e) {
          console.error("NextAuth redirect callback - Yönlendirme hata parametresi parse edilirken sorun oluştu:", e);
        }
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },

  pages: {
    signIn: "/giris-yap",
    error: "/giris-yap", // Hata durumunda giriş sayfasına geri dönsün
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // Refresh Token sürenizle uyumlu hale getirin (30 gün)
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET, // Uygulamanızın güvenliği için bu gizli olmalı
};
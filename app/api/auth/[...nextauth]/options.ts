import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import https from "https";
import { User } from "../../../models/User";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
const agent = new https.Agent({
  rejectUnauthorized: false, // Self-signed sertifika hatasını önlemek için
});

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userName: {
          label: "Kullanıcı Adı : ",
          type: "text",
          placeholder: "Kullanıcı adı giriniz",
        },
        password: {
          label: "Şifre :",
          type: "password",
          placeholder: "Şifrenizi giriniz",
        },
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        console.log("Gönderilen Credentials:", credentials);
        try {
          const response = await axios.post(
            `${baseURL}/login`,
            {
              email: credentials?.email,
              password: credentials?.password,
            },
            { httpsAgent: agent }
          );

          console.log("Axios Response:", response.data);

          const tokenData = response.data.token;
          if (!tokenData) {
            throw new Error(
              JSON.stringify({
                errorMessage: "Sunucudan geçerli bir yanıt alınamadı.",
              })
            );
          }

          const user: User = tokenData.user;
          if (!user) {
            throw new Error(
              JSON.stringify({
                errorMessage: "Kullanıcı bilgileri alınamadı.",
              })
            );
          }

          // E-posta doğrulanmamışsa hata fırlat
          if (!user.isVerified) {
            throw new Error(
              JSON.stringify({
                errorCode: 1004,
                errorMessage: "E-posta doğrulaması gerekiyor.",
              })
            );
          }

          // Kullanıcı nesnesine token ekle
          user.token = tokenData.token;

          return user;
        } catch (error) {
          console.error("Authentication Error:", error);
          if (axios.isAxiosError(error)) {
            throw new Error(JSON.stringify(error.response?.data));
          }
          throw new Error(
            JSON.stringify({
              errorMessage: "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.",
            })
          );
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.profilePictureUrl || "";
        token.isVerified = user.isVerified;
        token.role = user.role;
        token.token = user.token || "";
      }

      if (trigger === "update" && session?.user?.profilePictureUrl) {
        token.image = session.user.profilePictureUrl;
      }

      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        console.log("Session Callback - Token:", token);
        session.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          profilePictureUrl : token.image as string, 
          isVerified: token.isVerified as boolean,
          role: token.role as number,
          token: token.token as string || "",
        };
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      const parsedUrl = new URL(url, baseUrl);
      const isVerified = parsedUrl.searchParams.get("isVerified");
      const role = parsedUrl.searchParams.get("role");

      if (isVerified === "false") {
        return `${baseUrl}/kullanici-dogrulama`;
      }

      if (role === "admin") {
        return `${baseUrl}/admin-dashboard`;
      }

      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },

  pages: {
    signIn: "/giris-yap",
  },
};

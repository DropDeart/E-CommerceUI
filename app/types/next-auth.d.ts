// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { User } from "../models/User"; // <-- Burası

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      profilePictureUrl?: string | null;
      isVerified?: boolean;
      role?: number;
      token?: string; // Access Token
    };
    accessToken?: string; // Session objesine de Access Token'ı ekliyoruz
    error?: string; // Refresh Token hatası için
  }

  interface User { // <-- NextAuth'ın internal User interface'ini genişletiyoruz
    id: string;
    name: string;
    email: string;
    profilePictureUrl?: string | null;
    isVerified?: boolean;
    role?: number;
    token?: string; // Access Token
    accessToken?: string; // <-- Hem authorize'dan dönen user objesinde hem de jwt token'da bulunabilir
    accessTokenExpires?: number; // Access Token'ın son kullanma tarihi (timestamp)
  }

  // JWT'nin içeriğini genişletmek için
  interface JWT {
    id: string;
    name: string;
    email: string;
    image?: string | null; // profilePictureUrl yerine image
    isVerified?: boolean;
    role?: number;
    accessToken?: string;
    accessTokenExpires?: number;
    error?: string; // Refresh Token hatası için
  }
}
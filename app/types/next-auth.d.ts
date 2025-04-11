
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { User } from "../models/User"; // Eğer özel bir User modeliniz varsa

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      profilePictureUrl?: string | null;
      isVerified?: boolean;
      role?: number;
      token?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    profilePictureUrl?: string | null;
    isVerified?: boolean;
    role?:number;
    token?:string;
  }
}

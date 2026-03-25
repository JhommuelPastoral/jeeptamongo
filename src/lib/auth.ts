import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import axiosInstance from "./axiosInstance"
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, GitHub],
  pages: {
    error: "/errorhandlers",
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks:{
    async signIn({profile}){
      try {
        if(!profile) return false;
        if(!profile.email || !profile.given_name || !profile.family_name) return false;
        await axiosInstance.post("/api/auth/signIn", {email: profile.email, fullName: `${profile.given_name} ${profile.family_name}`});
      } catch (error) {
        console.log("Sign in error", error);
        return false
      }
      return true
    }
  }
});
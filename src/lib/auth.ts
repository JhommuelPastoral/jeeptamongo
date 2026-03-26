import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import prisma from "./prisma";
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

        if(!profile.email) return false;

        const email = profile.email;
        const fullName = `${profile.given_name} ${profile.family_name}`;
        const imageUrl = profile.picture;
        await prisma.user.upsert({
          where: { email },
          update: { fullName, imageUrl },
          create: { email, fullName, imageUrl },
        });

      } catch (error) {
        console.log("Sign in error", error);
        return false
      }
      return true
    },


    async jwt({ token, profile }) {
      // runs on login
      if (!profile) {
        return token;
      }
      token.fullName = `${profile.given_name || ""} ${profile.family_name || ""}`;
      token.imageUrl = profile.picture;
      token.email = profile.email;

      return token;
    },

    async session({ session, token }) {
      // expose to frontend
      if(!token) return session
      return session;
    },
  }
});
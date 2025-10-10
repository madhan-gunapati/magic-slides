import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // Triggered when user signs in
    async signIn({ user }) {
      if (!user?.email) return false;

      // Check if user already exists
      let existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      // If not, create a new one
      if (!existingUser) {
        existingUser = await prisma.user.create({
          data: {
            name: user.name,
            email: user.email,
            image: user.image,
           
          },
        });
      }

      
      user.id = existingUser.id;

      return true;
    },

    
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    
    async session({ session, token }) {
      if (token) session.user.id = token.id;
      return session;
    },
  },
});

export { handler as GET, handler as POST };

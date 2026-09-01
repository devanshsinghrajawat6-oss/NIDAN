import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB, User } from "@/lib/db";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        await connectDB();

        // Check if user exists
        const user = await User.findOne({ email: credentials.email });

        // For demo purposes: If user doesn't exist, auto-create them so they can log in easily
        if (!user) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          
          // Smart role assignment based on email prefix for demo purposes
          let assignedRole = "Investigator";
          const lowerEmail = credentials.email.toLowerCase();
          if (lowerEmail.startsWith("admin")) assignedRole = "Admin";
          else if (lowerEmail.startsWith("pv") || lowerEmail.startsWith("safety")) assignedRole = "Pharmacovigilance";
          else if (lowerEmail.startsWith("regulator")) assignedRole = "Regulator";
          else if (lowerEmail.startsWith("ec") || lowerEmail.startsWith("ethics")) assignedRole = "Ethics Committee";

          const newUser = await User.create({
            email: credentials.email,
            password: hashedPassword,
            name: credentials.email.split('@')[0],
            role: assignedRole
          });
          return { id: newUser._id.toString(), email: newUser.email, name: newUser.name, role: newUser.role };
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_for_development_only",
});

export { handler as GET, handler as POST };

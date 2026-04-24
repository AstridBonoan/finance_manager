import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    accessToken?: string;
  }

  interface Session {
    user: User;
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          if (!response.ok) {
            throw new Error('Invalid credentials');
          }

          const data = await response.json();
          return {
            id: data.user.id,
            email: data.user.email,
            accessToken: data.access_token,
          };
        } catch (error) {
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
};

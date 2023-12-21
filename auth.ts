import NextAuth from "next-auth";
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcrypt';

import { authConfig } from './auth.config';

import { getUser } from "./app/lib/data";


export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;

                    const passwordMatch = await bcrypt.compare(password, user.password);
                    if (passwordMatch) return user;
                }

                return null;
            },
        }),
    ],
});
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    basePath: "/api/auth",
})

export interface CustomUser {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    firstName?: string | null;
    lastName?: string | null;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export const { useSession, signIn, signUp, signOut } = authClient

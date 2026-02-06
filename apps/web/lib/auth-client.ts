import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    basePath: "/api/auth",
})

export interface CustomUser {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    firstName: string;
    lastName: string;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export const { useSession, signIn, signUp, signOut } = authClient

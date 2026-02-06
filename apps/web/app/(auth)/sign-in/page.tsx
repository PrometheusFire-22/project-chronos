"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Label, cn } from "@chronos/ui"

export default function SignInPage() {
    return (
        <Suspense>
            <SignInForm />
        </Suspense>
    )
}

function SignInForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl") || "/settings/overview"
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await authClient.signIn.email({
                email,
                password,
                fetchOptions: {
                    onSuccess: () => {
                        router.push(callbackUrl)
                    },
                    onError: (ctx) => {
                        setError(ctx.error.message)
                        setLoading(false)
                    },
                },
            })
        } catch (err) {
            setError("Something went wrong. Please try again.")
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md relative">
            {/* Background Ambience */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-20" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none opacity-20" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md group"
            >
                {/* Glow Orbit Wrapper */}
                <div className="glow-orbit-container relative rounded-xl">
                    <div
                        className="glow-orbit-border"
                        style={{ "--orbit-color": "hsl(var(--primary))" } as React.CSSProperties}
                    />

                    <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl relative z-10">
                        <CardHeader className="space-y-1 text-center">
                            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                                Welcome Back
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Enter your credentials to access your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSignIn} className="space-y-4">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-background/50 border-input/50 focus:border-primary/50 transition-all duration-300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <Link
                                            href="/forgot-password"
                                            className="text-xs text-primary hover:text-primary/80 transition-colors"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="bg-background/50 border-input/50 focus:border-primary/50 transition-all duration-300"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-[0_0_20px_-5px_hsl(var(--primary))]"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
                            <div className="relative w-full">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border/50" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground rounded-full">
                                        Or continue with
                                    </span>
                                </div>
                            </div>
                           {/* Social Buttons Placeholder - will be added when configured */}

                            <div>
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/sign-up"
                                    className="font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                                >
                                    Sign up
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </motion.div>
        </div>
    )
}

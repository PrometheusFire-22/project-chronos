"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Label } from "@chronos/ui"
import { cn } from "@/lib/utils"

export default function SignUpPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await authClient.signUp.email({
                name,
                email,
                password,
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/")
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
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
             {/* Background Ambience */}
             <div className="absolute top-0 right-1/2 translate-x-1/2 w-[1000px] h-[500px] bg-accent/20 blur-[120px] rounded-full pointer-events-none opacity-20" />
             <div className="absolute bottom-0 left-0 w-[800px] h-[600px] bg-primary/10 blur-[100px] rounded-full pointer-events-none opacity-20" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md group"
            >
               {/* Glow Orbit Wrapper */}
               <div className="glow-orbit-container relative rounded-xl">
                    <div
                        className="glow-orbit-border"
                        style={{ "--orbit-color": "hsl(var(--accent))" } as React.CSSProperties}
                    />

                    <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl relative z-10">
                        <CardHeader className="space-y-1 text-center">
                            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                                Create an Account
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Enter your email below to create your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSignUp} className="space-y-4">
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
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="bg-background/50 border-input/50 focus:border-accent/50 transition-all duration-300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-background/50 border-input/50 focus:border-accent/50 transition-all duration-300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="bg-background/50 border-input/50 focus:border-accent/50 transition-all duration-300"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-300 shadow-[0_0_20px_-5px_hsl(var(--accent))]"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        "Sign Up"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
                            <div>
                                Already have an account?{" "}
                                <Link
                                    href="/sign-in"
                                    className="font-medium text-accent hover:text-accent/80 transition-colors underline-offset-4 hover:underline"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
               </div>
            </motion.div>
        </div>
    )
}

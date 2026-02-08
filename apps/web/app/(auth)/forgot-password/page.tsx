"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2, ArrowLeft, Mail } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@chronos/ui"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
            const { data, error: resetError } = await authClient.requestPasswordReset({
                email,
                redirectTo: `${baseUrl}/reset-password`,
            })
            if (resetError) {
                setError(resetError.message || "Failed to send reset email.")
            } else {
                setSuccess(true)
            }
        } catch (err) {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md relative">
            {/* Background Ambience */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-20" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="glow-orbit-container relative rounded-xl">
                    <div
                        className="glow-orbit-border"
                        style={{ "--orbit-color": "hsl(var(--primary))" } as React.CSSProperties}
                    />

                    <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl relative z-10">
                        <CardHeader className="space-y-1 text-center">
                            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                                Reset Password
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Enter your email and we&apos;ll send you a reset link
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center space-y-4"
                                >
                                    <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Mail className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">Check your inbox</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            We&apos;ve sent a password reset link to <span className="text-foreground font-medium">{email}</span>
                                        </p>
                                    </div>
                                    <Link href="/sign-in">
                                        <Button variant="ghost" className="mt-4">
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back to Sign In
                                        </Button>
                                    </Link>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
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
                                    <Button
                                        type="submit"
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-[0_0_20px_-5px_hsl(var(--primary))]"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            "Send Reset Link"
                                        )}
                                    </Button>
                                    <div className="text-center">
                                        <Link
                                            href="/sign-in"
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <ArrowLeft className="inline mr-1 h-3 w-3" />
                                            Back to Sign In
                                        </Link>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    )
}

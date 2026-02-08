"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2, ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@chronos/ui"

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    )
}

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token. Please request a new password reset link.")
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { data, error: resetError } = await authClient.resetPassword({
                newPassword: password,
                token: token!,
            })
            if (resetError) {
                setError(resetError.message || "Failed to reset password. The link may have expired.")
            } else {
                setSuccess(true)
                // Redirect to sign-in after 3 seconds
                setTimeout(() => {
                    window.location.href = "/sign-in"
                }, 3000)
            }
        } catch (err: any) {
            setError(err?.message || "Something went wrong. Please try again.")
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
                                {success ? "Password Reset!" : "Set New Password"}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                {success
                                    ? "Your password has been successfully reset"
                                    : "Enter your new password below"}
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
                                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Redirecting to sign in...
                                    </p>
                                </motion.div>
                            ) : !token ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center space-y-4"
                                >
                                    <div className="mx-auto w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                                        <XCircle className="w-8 h-8 text-destructive" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">Invalid Link</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            This password reset link is invalid or has expired.
                                        </p>
                                    </div>
                                    <Link href="/forgot-password">
                                        <Button className="mt-4">
                                            Request New Link
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
                                        <Label htmlFor="password">New Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={8}
                                            className="bg-background/50 border-input/50 focus:border-primary/50 transition-all duration-300"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength={8}
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
                                            "Reset Password"
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

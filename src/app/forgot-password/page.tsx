"use client";

import axios from "axios";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { z } from "zod";

const forgotPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Email is required.")
        .email("Please enter a valid email address."),
});

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [responseMessage, setResponseMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setEmailError("");
        setResponseMessage("");
        setIsSuccess(false);

        const validationResult =
            forgotPasswordSchema.safeParse({
                email,
            });

        if (!validationResult.success) {
            setEmailError(
                validationResult.error.flatten()
                    .fieldErrors.email?.[0] ||
                    "Please enter a valid email address."
            );

            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setResponseMessage(
                "The password reset service is currently unavailable."
            );
            return;
        }

        try {
            setIsLoading(true);

            const response = await axios.post(
                `${apiUrl}/auth/forgot-password`,
                {
                    email: validationResult.data.email,
                }
            );

            setIsSuccess(true);

            setResponseMessage(
                response.data?.message ||
                    "If an account exists with this email, a password reset link has been sent."
            );

            setEmail("");
        } catch (error) {
            setIsSuccess(false);

            if (
                axios.isAxiosError(error) &&
                error.response?.status === 404
            ) {
                setResponseMessage(
                    "Password reset is currently unavailable. Please try again later."
                );
            } else if (
                axios.isAxiosError(error) &&
                !error.response
            ) {
                setResponseMessage(
                    "Unable to connect to the server. Please try again."
                );
            } else {
                setResponseMessage(
                    "We couldn’t send the reset link. Please try again later."
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#020203] text-white">
            {/* Subtle purple glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(circle at 72% 48%, rgba(109, 40, 217, 0.08), transparent 28%)",
                }}
            />

            {/* Navigation */}
            <header className="relative z-10">
                <nav className="mx-auto flex max-w-6xl items-center justify-center gap-8 px-6 py-6 sm:gap-10">
                    <Link
                        href="/landing"
                        className="text-xs font-medium uppercase text-zinc-400 transition hover:text-white"
                    >
                        Home
                    </Link>

                    <Link
                        href="/tickets"
                        className="text-xs font-medium uppercase text-zinc-400 transition hover:text-white"
                    >
                        Tickets
                    </Link>

                    <Link
                        href="/profile"
                        className="text-xs font-medium uppercase text-zinc-400 transition hover:text-white"
                    >
                        Profile
                    </Link>

                    <Link
                        href="/login"
                        className="rounded-full bg-white px-8 py-3 text-xs font-semibold uppercase text-black transition hover:bg-zinc-200"
                    >
                        Login
                    </Link>
                </nav>
            </header>

            {/* Left-side forgot-password content */}
            <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-28 lg:px-2">
                <div className="w-full max-w-[335px]">
                    <div className="flex h-[34px] w-[164px] items-center justify-center rounded-full border border-purple-500 shadow-[0_0_25px_rgba(147,51,234,0.15)]">
                        <span className="text-[11px] font-semibold text-zinc-200">
                            Forgot Password
                        </span>
                    </div>

                    <h1 className="mt-5 text-[42px] font-bold leading-none tracking-tight text-white">
                        Forgot Password?
                    </h1>

                    <p className="mt-4 max-w-[335px] text-[16px] leading-6 text-zinc-400">
                        Enter your email address and we&apos;ll send
                        you a link to reset your password.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        className="mt-5"
                    >
                        <label
                            htmlFor="email"
                            className="sr-only"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setEmailError("");
                                setResponseMessage("");
                            }}
                            placeholder="Email Address"
                            autoComplete="email"
                            aria-invalid={Boolean(emailError)}
                            className={`forgot-input h-10 w-full rounded-full border bg-[#0b0a13] px-6 text-xs text-white outline-none transition placeholder:text-zinc-400 ${
                                emailError
                                    ? "border-red-500"
                                    : "border-zinc-300 focus:border-purple-500"
                            }`}
                        />

                        {emailError && (
                            <p className="mt-2 px-3 text-xs text-red-400">
                                {emailError}
                            </p>
                        )}

                        <div className="mt-3 flex items-center justify-end gap-3 text-[13px]">
                            <span className="text-zinc-300">
                                Remember your password?
                            </span>

                            <Link
                                href="/login"
                                className="font-semibold text-purple-500 transition hover:text-purple-400"
                            >
                                Login
                            </Link>
                        </div>

                        {responseMessage && (
                            <p
                                className={`mt-3 text-xs leading-5 ${
                                    isSuccess
                                        ? "text-green-400"
                                        : "text-red-400"
                                }`}
                            >
                                {responseMessage}
                            </p>
                        )}

                      <button
    type="submit"
    disabled={isLoading}
    style={{ borderRadius: "9999px" }}
    className="mt-5 flex h-10 w-full appearance-none items-center justify-center overflow-hidden border-0 bg-gradient-to-r from-violet-600 to-purple-500 text-xs font-medium text-white transition hover:from-violet-500 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
>
    {isLoading ? "Sending..." : "Send Reset Link"}
</button>
                    </form>
                </div>
            </section>

            {/* Keep browser autofill dark */}
            <style >{`
                .forgot-input:-webkit-autofill,
                .forgot-input:-webkit-autofill:hover,
                .forgot-input:-webkit-autofill:focus,
                .forgot-input:-webkit-autofill:active {
                    -webkit-text-fill-color: #ffffff !important;
                    -webkit-box-shadow: 0 0 0 1000px #0b0a13
                        inset !important;
                    box-shadow: 0 0 0 1000px #0b0a13 inset !important;
                    caret-color: #ffffff;
                }
            `}</style>
        </main>
    );
}
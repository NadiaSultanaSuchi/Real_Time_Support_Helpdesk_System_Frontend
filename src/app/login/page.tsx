"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { z } from "zod";

const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Email is required.")
        .email("Please enter a valid email address."),

    password: z
        .string()
        .min(1, "Password is required.")
        .min(6, "Password must contain at least 6 characters."),
});

interface FormErrors {
    email?: string;
    password?: string;
}

function getRoleFromToken(token: string): string | undefined {
    try {
        const encodedPayload = token.split(".")[1];

        if (!encodedPayload) {
            return undefined;
        }

        const normalizedPayload = encodedPayload
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const paddingLength =
            (4 - (normalizedPayload.length % 4)) % 4;

        const paddedPayload =
            normalizedPayload + "=".repeat(paddingLength);

        const payload = JSON.parse(atob(paddedPayload));

        return typeof payload.role === "string"
            ? payload.role
            : undefined;
    } catch {
        return undefined;
    }
}

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errors, setErrors] = useState<FormErrors>({});
    const [responseMessage, setResponseMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setErrors({});
        setResponseMessage("");

        const validationResult = loginSchema.safeParse({
            email,
            password,
        });

        if (!validationResult.success) {
            const fieldErrors =
                validationResult.error.flatten().fieldErrors;

            setErrors({
                email: fieldErrors.email?.[0],
                password: fieldErrors.password?.[0],
            });

            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setResponseMessage(
                "The login service is currently unavailable."
            );
            return;
        }

        try {
            setIsLoading(true);

            const response = await axios.post(
                `${apiUrl}/auth/login`,
                validationResult.data
            );

            const { accessToken, refreshToken } = response.data;

            if (!accessToken) {
                setResponseMessage(
                    "Login could not be completed. Please try again."
                );
                return;
            }

            localStorage.setItem("accessToken", accessToken);

            if (refreshToken) {
                localStorage.setItem(
                    "refreshToken",
                    refreshToken
                );
            }

            const receivedRole =
                response.data.user?.role ??
                response.data.role ??
                getRoleFromToken(accessToken);

            const role = receivedRole?.toLowerCase();

            if (role === "admin") {
                router.push("/admin");
            } else if (role === "manager") {
                router.push("/manager");
            } else if (role === "customer") {
                router.push("/dashboard");
            } else {
                router.push("/tickets");
            }

            router.refresh();
        } catch (error) {
            if (
                axios.isAxiosError(error) &&
                (error.response?.status === 400 ||
                    error.response?.status === 401)
            ) {
                setResponseMessage(
                    "The email or password you entered is incorrect."
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
                    "We couldn’t sign you in. Please try again later."
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
                        "radial-gradient(circle at 24% 48%, rgba(109, 40, 217, 0.08), transparent 25%)",
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
                        href="/register"
                        className="rounded-full bg-white px-8 py-3 text-xs font-semibold uppercase text-black transition hover:bg-zinc-200"
                    >
                        Register
                    </Link>
                </nav>
            </header>

            {/* Left-side login content */}
            <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-28 lg:px-2">
                <div className="w-full max-w-[335px]">
                    <div className="flex h-[34px] w-[164px] items-center justify-center rounded-full border border-purple-500 shadow-[0_0_25px_rgba(147,51,234,0.15)]">
                        <span className="text-[11px] font-semibold uppercase text-zinc-200">
                            Sign In
                        </span>
                    </div>

                    <h1 className="mt-6 text-[42px] font-bold leading-none tracking-tight text-white">
                        Welcome Back!
                    </h1>

                    <p className="mt-6 text-[19px] text-zinc-400">
                        Get back to your profile
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        className="mt-7"
                    >
                        <div>
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

                                    setErrors((currentErrors) => ({
                                        ...currentErrors,
                                        email: undefined,
                                    }));

                                    setResponseMessage("");
                                }}
                                placeholder="Email Address"
                                autoComplete="email"
                                aria-invalid={Boolean(errors.email)}
                                className={`login-input h-10 w-full rounded-full border bg-[#0b0a13] px-6 text-xs text-white outline-none transition placeholder:text-zinc-400 ${
                                    errors.email
                                        ? "border-red-500"
                                        : "border-zinc-300 focus:border-purple-500"
                                }`}
                            />

                            {errors.email && (
                                <p className="mt-2 px-3 text-xs text-red-400">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="mt-4">
                            <label
                                htmlFor="password"
                                className="sr-only"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value);

                                    setErrors((currentErrors) => ({
                                        ...currentErrors,
                                        password: undefined,
                                    }));

                                    setResponseMessage("");
                                }}
                                placeholder="Password"
                                autoComplete="current-password"
                                aria-invalid={Boolean(errors.password)}
                                className={`login-input h-10 w-full rounded-full border bg-[#0b0a13] px-6 text-xs text-white outline-none transition placeholder:text-zinc-400 ${
                                    errors.password
                                        ? "border-red-500"
                                        : "border-zinc-300 focus:border-purple-500"
                                }`}
                            />

                            {errors.password && (
                                <p className="mt-2 px-3 text-xs text-red-400">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="mt-3 flex justify-end">
                            <Link
                                href="/forgot-password"
                                className="text-[13px] font-semibold text-purple-500 transition hover:text-purple-400"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        {responseMessage && (
                            <p className="mt-3 text-xs leading-5 text-red-400">
                                {responseMessage}
                            </p>
                        )}

                       <button
    type="submit"
    disabled={isLoading}
    style={{ borderRadius: "9999px" }}
    className="mt-5 h-11 w-full overflow-hidden bg-gradient-to-r from-violet-600 to-purple-500 text-xs font-medium uppercase text-white transition hover:from-violet-500 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
>
    {isLoading ? "Logging in..." : "Login"}
</button>
                    </form>
                </div>
            </section>

            {/* Keep browser autofill dark */}
            <style>{`
                .login-input:-webkit-autofill,
                .login-input:-webkit-autofill:hover,
                .login-input:-webkit-autofill:focus,
                .login-input:-webkit-autofill:active {
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
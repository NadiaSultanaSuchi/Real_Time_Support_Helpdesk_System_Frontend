"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { z } from "zod";

const registrationSchema = z
    .object({
        fullName: z
            .string()
            .trim()
            .min(1, "Full name is required.")
            .min(2, "Full name must contain at least 2 characters.")
            .max(100, "Full name is too long."),

        email: z
            .string()
            .trim()
            .min(1, "Email is required.")
            .email("Please enter a valid email address."),

        password: z
            .string()
            .min(1, "Password is required.")
            .min(6, "Password must contain at least 6 characters."),

        confirmPassword: z
            .string()
            .min(1, "Please confirm your password."),
    })
    .refine(
        (data) => data.password === data.confirmPassword,
        {
            message: "Passwords do not match.",
            path: ["confirmPassword"],
        }
    );

interface RegistrationForm {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] =
        useState<RegistrationForm>({
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        });

    const [errors, setErrors] = useState<FormErrors>({});
    const [responseMessage, setResponseMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const updateField = (
        field: keyof RegistrationForm,
        value: string
    ) => {
        setFormData((currentData) => ({
            ...currentData,
            [field]: value,
        }));

        setErrors((currentErrors) => ({
            ...currentErrors,
            [field]: undefined,
        }));

        setResponseMessage("");
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setErrors({});
        setResponseMessage("");

        const validationResult =
            registrationSchema.safeParse(formData);

        if (!validationResult.success) {
            const fieldErrors =
                validationResult.error.flatten().fieldErrors;

            setErrors({
                fullName: fieldErrors.fullName?.[0],
                email: fieldErrors.email?.[0],
                password: fieldErrors.password?.[0],
                confirmPassword:
                    fieldErrors.confirmPassword?.[0],
            });

            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setResponseMessage(
                "The registration service is currently unavailable."
            );
            return;
        }

        try {
            setIsLoading(true);

            await axios.post(`${apiUrl}/auth/register`, {
                name: validationResult.data.fullName,
                email: validationResult.data.email,
                password: validationResult.data.password,
            });

            router.push("/login");
            router.refresh();
        } catch (error) {
            if (
                axios.isAxiosError(error) &&
                error.response?.status === 409
            ) {
                setResponseMessage(
                    "An account already exists with this email."
                );
            } else if (
                axios.isAxiosError(error) &&
                error.response?.status === 400
            ) {
                setResponseMessage(
                    "Registration could not be completed. Please check your information."
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
                    "We couldn’t create your account. Please try again later."
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

            {/* Left-side registration content */}
            <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-24 lg:px-2">
                <div className="w-full max-w-[335px]">
                    <div className="flex h-[34px] w-[164px] items-center justify-center rounded-full border border-purple-500 shadow-[0_0_25px_rgba(147,51,234,0.15)]">
                        <span className="text-[11px] font-semibold uppercase text-zinc-200">
                            Register
                        </span>
                    </div>

                    <h1 className="mt-5 text-[42px] font-bold leading-none tracking-tight text-white">
                        Create an Account!
                    </h1>

                    <p className="mt-4 text-[18px] text-zinc-400">
                        Create an account to get started
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        className="mt-6"
                    >
                        {/* Full Name */}
                        <div>
                            <label
                                htmlFor="fullName"
                                className="sr-only"
                            >
                                Full Name
                            </label>

                            <input
                                id="fullName"
                                type="text"
                                value={formData.fullName}
                                onChange={(event) =>
                                    updateField(
                                        "fullName",
                                        event.target.value
                                    )
                                }
                                placeholder="Full Name"
                                autoComplete="name"
                                aria-invalid={Boolean(
                                    errors.fullName
                                )}
                                className={`register-input h-10 w-full rounded-full border bg-[#0b0a13] px-6 text-xs text-white outline-none transition placeholder:text-zinc-400 ${
                                    errors.fullName
                                        ? "border-red-500"
                                        : "border-zinc-300 focus:border-purple-500"
                                }`}
                            />

                            {errors.fullName && (
                                <p className="mt-2 px-3 text-xs text-red-400">
                                    {errors.fullName}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="mt-3">
                            <label
                                htmlFor="email"
                                className="sr-only"
                            >
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(event) =>
                                    updateField(
                                        "email",
                                        event.target.value
                                    )
                                }
                                placeholder="Email Address"
                                autoComplete="email"
                                aria-invalid={Boolean(errors.email)}
                                className={`register-input h-10 w-full rounded-full border bg-[#0b0a13] px-6 text-xs text-white outline-none transition placeholder:text-zinc-400 ${
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

                        {/* Password */}
                        <div className="mt-3">
                            <label
                                htmlFor="password"
                                className="sr-only"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(event) =>
                                    updateField(
                                        "password",
                                        event.target.value
                                    )
                                }
                                placeholder="Password"
                                autoComplete="new-password"
                                aria-invalid={Boolean(
                                    errors.password
                                )}
                                className={`register-input h-10 w-full rounded-full border bg-[#0b0a13] px-6 text-xs text-white outline-none transition placeholder:text-zinc-400 ${
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

                        {/* Confirm Password */}
                        <div className="mt-3">
                            <label
                                htmlFor="confirmPassword"
                                className="sr-only"
                            >
                                Confirm Password
                            </label>

                            <input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(event) =>
                                    updateField(
                                        "confirmPassword",
                                        event.target.value
                                    )
                                }
                                placeholder="Confirm Password"
                                autoComplete="new-password"
                                aria-invalid={Boolean(
                                    errors.confirmPassword
                                )}
                                className={`register-input h-10 w-full rounded-full border bg-[#0b0a13] px-6 text-xs text-white outline-none transition placeholder:text-zinc-400 ${
                                    errors.confirmPassword
                                        ? "border-red-500"
                                        : "border-zinc-300 focus:border-purple-500"
                                }`}
                            />

                            {errors.confirmPassword && (
                                <p className="mt-2 px-3 text-xs text-red-400">
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        <div className="mt-3 flex justify-end">
                            <Link
                                href="/login"
                                className="text-[13px] font-semibold text-purple-500 transition hover:text-purple-400"
                            >
                                Already have an account?
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
    className="mt-5 flex h-10 w-full appearance-none items-center justify-center overflow-hidden border-0 bg-gradient-to-r from-violet-600 to-purple-500 text-xs font-medium uppercase text-white transition hover:from-violet-500 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
>
    {isLoading ? "Creating Account..." : "Register"}
</button>
                    </form>
                </div>
            </section>

            {/* Keep browser autofill dark */}
            <style>{`
                .register-input:-webkit-autofill,
                .register-input:-webkit-autofill:hover,
                .register-input:-webkit-autofill:focus,
                .register-input:-webkit-autofill:active {
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
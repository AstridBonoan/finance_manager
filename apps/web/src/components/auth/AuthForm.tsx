"use client";

import AuthInput from "./AuthInput";
import SocialButton from "./SocialButton";
import AuthDivider from "./AuthDivider";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const [form, setForm] = useState({
    identifier: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validateForm() {
    const errors: Record<string, string> = {};
    const emailRegex = /\S+@\S+\.\S+/;

    if (mode === "signin") {
      if (!form.identifier.trim()) {
        errors.identifier = "Email or username is required.";
      }
    } else {
      if (!form.email.trim()) {
        errors.email = "Email is required.";
      } else if (!emailRegex.test(form.email)) {
        errors.email = "Please enter a valid email address.";
      }
      if (!form.username.trim()) {
        errors.username = "Username is required.";
      }
    }

    if (!form.password.trim()) {
      errors.password = "Password is required.";
    } else if (form.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (mode === "signup") {
      if (!form.confirmPassword.trim()) {
        errors.confirmPassword = "Please confirm your password.";
      } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === "signin") {
        const isEmail = form.identifier.includes("@");
        const res = await signIn("credentials", {
          redirect: false,
          email: isEmail ? form.identifier.trim() : "",
          username: !isEmail ? form.identifier.trim() : "",
          password: form.password,
        });

        if (res?.error) {
          setError("Invalid credentials. Please try again.");
          return;
        }

        router.push("/home");
        router.refresh();
      } else {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email.trim(),
            username: form.username.trim(),
            password: form.password,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setError(data.message || "Unable to create account.");
          return;
        }

        router.push("/auth/sign-in");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col gap-4"
      >
        <div className="mb-1 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "signin"
              ? "Welcome back. Enter your details to continue."
              : "Set up your account to start managing your money."}
          </p>
        </div>

        {mode === "signin" ? (
          <AuthInput
            label="Email or Username"
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            required
            autoComplete="username"
            error={fieldErrors.identifier}
            placeholder="you@example.com or username"
          />
        ) : (
          <>
            <AuthInput
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              error={fieldErrors.email}
              placeholder="you@example.com"
            />
            <AuthInput
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
              error={fieldErrors.username}
              placeholder="Choose a username"
            />
          </>
        )}

        <AuthInput
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          error={fieldErrors.password}
          placeholder="Enter your password"
        />

        {mode === "signup" ? (
          <AuthInput
            label="Confirm Password"
            name="confirmPassword"
          type="password"
            value={form.confirmPassword}
          onChange={handleChange}
          required
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
            placeholder="Re-enter your password"
        />
        ) : null}

        {error ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-600 text-white font-semibold py-3.5 transition hover:bg-emerald-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
        </button>

        {mode === "signin" ? (
          <>
            <AuthDivider />
            <SocialButton provider="google" loading={loading} />
          </>
        ) : null}

        <div className="text-center mt-1 text-sm text-slate-600">
          {mode === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <Link href="/auth/sign-up" className="font-semibold text-emerald-700 hover:underline">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/auth/sign-in" className="font-semibold text-emerald-700 hover:underline">
                Sign in
              </Link>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

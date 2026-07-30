"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  User,
  LogIn,
  Mail,
  Loader2,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Inbox,
  Sparkles,
} from "lucide-react";
import { loginAction, type LoginState } from "@/app/login/actions";
import { sendRecoveryEmailFromBrowser } from "@/lib/contact-email-client";
import type { RecoveryType } from "@/lib/auth-recovery";

const initialState: LoginState = {};

const recoveryOptions: {
  value: RecoveryType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "username",
    label: "Username",
    description: "Remind me what to type in",
    icon: <User size={18} />,
  },
  {
    value: "password",
    label: "Password",
    description: "Send my password again",
    icon: <KeyRound size={18} />,
  },
  {
    value: "both",
    label: "Both",
    description: "Send everything I need",
    icon: <Sparkles size={18} />,
  },
];

export default function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryType, setRecoveryType] = useState<RecoveryType>("both");
  const [recoveryStatus, setRecoveryStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [recoveryMessage, setRecoveryMessage] = useState("");

  const openRecovery = (type: RecoveryType = "both") => {
    setRecoveryType(type);
    setShowRecovery(true);
    setRecoveryStatus("idle");
    setRecoveryMessage("");
  };

  const closeRecovery = () => {
    setShowRecovery(false);
    setRecoveryStatus("idle");
    setRecoveryMessage("");
    setRecoveryEmail("");
  };

  const handleRecoverySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setRecoveryStatus("loading");
    setRecoveryMessage("");

    try {
      const response = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: recoveryEmail.trim(),
          type: recoveryType,
          website: "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "We couldn't send the email. Please try again.");
      }

      if (data.clientEmailDelivery) {
        await sendRecoveryEmailFromBrowser(
          data.clientEmailDelivery.receiverEmail,
          data.clientEmailDelivery.subject,
          data.clientEmailDelivery.body
        );
      }

      setRecoveryStatus("success");
      setRecoveryMessage(
        data.message ||
          "If your email is registered, your login details are on the way."
      );
      setRecoveryEmail("");
    } catch (err) {
      setRecoveryStatus("error");
      setRecoveryMessage(
        err instanceof Error ? err.message : "We couldn't send the email. Please try again."
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="bg-surface border border-surface-border rounded-2xl p-8 md:p-10 shadow-2xl">
        <AnimatePresence mode="wait">
          {!showRecovery ? (
            <motion.div
              key="sign-in"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Lock size={28} className="text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-gray-400">Sign in to access your portfolio</p>
              </div>

              <form action={formAction} className="space-y-6">
                <input type="hidden" name="from" value={from} />
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      placeholder="Enter your username"
                      className="w-full bg-black border border-surface-border rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      placeholder="Enter your password"
                      className="w-full bg-black border border-surface-border rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {state.error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3"
                  >
                    {state.error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    "Signing in..."
                  ) : (
                    <>
                      Sign In
                      <LogIn size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-surface-border text-center">
                <p className="text-sm text-gray-500 mb-3">Having trouble signing in?</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => openRecovery("username")}
                    className="text-sm text-primary hover:text-primary-hover transition-colors underline-offset-4 hover:underline"
                  >
                    Forgot username
                  </button>
                  <span className="hidden sm:inline text-gray-600">·</span>
                  <button
                    type="button"
                    onClick={() => openRecovery("password")}
                    className="text-sm text-primary hover:text-primary-hover transition-colors underline-offset-4 hover:underline"
                  >
                    Forgot password
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="recovery"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
            >
              {recoveryStatus === "success" ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-400/10 border border-green-400/20 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={32} className="text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                  <p className="text-gray-400 mb-6 leading-relaxed">{recoveryMessage}</p>

                  <div className="text-left bg-black border border-surface-border rounded-xl p-4 mb-6 space-y-3">
                    <div className="flex items-start gap-3">
                      <Inbox size={18} className="text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-400">
                        Look for an email with your login details. It usually arrives within a
                        minute.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail size={18} className="text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-400">
                        Can&apos;t find it? Check your spam or junk folder too.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeRecovery}
                    className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={closeRecovery}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
                  >
                    <ArrowLeft size={16} />
                    Back to sign in
                  </button>

                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Get back into your account</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Enter the email linked to your portfolio account and tell us what you need.
                      We&apos;ll send it straight to your inbox.
                    </p>
                  </div>

                  <form onSubmit={handleRecoverySubmit} className="space-y-5">
                    <div>
                      <p className="block text-sm font-medium text-gray-400 mb-3">
                        What do you need?
                      </p>
                      <div className="space-y-2">
                        {recoveryOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setRecoveryType(option.value)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                              recoveryType === option.value
                                ? "bg-primary/10 border-primary text-white"
                                : "bg-black border-surface-border text-gray-400 hover:border-gray-600 hover:text-white"
                            }`}
                          >
                            <span
                              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                recoveryType === option.value
                                  ? "bg-primary text-white"
                                  : "bg-surface text-gray-400"
                              }`}
                            >
                              {option.icon}
                            </span>
                            <span>
                              <span className="block text-sm font-semibold">{option.label}</span>
                              <span className="block text-xs opacity-80">{option.description}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="recovery-email"
                        className="block text-sm font-medium text-gray-400 mb-2"
                      >
                        Your email address
                      </label>
                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                        <input
                          id="recovery-email"
                          type="email"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          required
                          autoComplete="email"
                          placeholder="you@example.com"
                          className="w-full bg-black border border-surface-border rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Use the email address registered for this portfolio account.
                      </p>
                    </div>

                    {recoveryStatus === "error" && (
                      <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                        {recoveryMessage}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={recoveryStatus === "loading"}
                      className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {recoveryStatus === "loading" ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Sending email...
                        </>
                      ) : (
                        "Email my login details"
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

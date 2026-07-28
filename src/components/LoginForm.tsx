"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, LogIn, Mail, Loader2, CheckCircle2, HelpCircle } from "lucide-react";
import { loginAction, type LoginState } from "@/app/login/actions";
import { sendRecoveryEmailFromBrowser } from "@/lib/contact-email-client";
import type { RecoveryType } from "@/lib/auth-recovery";

const initialState: LoginState = {};

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
        throw new Error(data.error || "Could not send recovery email.");
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
          "If that email is registered for recovery, you will receive your login details shortly."
      );
      setRecoveryEmail("");
    } catch (err) {
      setRecoveryStatus("error");
      setRecoveryMessage(err instanceof Error ? err.message : "Could not send recovery email.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="bg-surface border border-surface-border rounded-2xl p-8 md:p-10 shadow-2xl">
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
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-400">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowRecovery(!showRecovery);
                  setRecoveryStatus("idle");
                  setRecoveryMessage("");
                }}
                className="text-xs text-primary hover:text-primary-hover transition-colors"
              >
                Forgot username or password?
              </button>
            </div>
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

        <AnimatePresence>
          {showRecovery && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleRecoverySubmit}
                className="mt-6 pt-6 border-t border-surface-border space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <HelpCircle size={18} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">Recover login details</h2>
                    <p className="text-sm text-gray-400">
                      Enter your recovery email and we&apos;ll send your username and/or password.
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="recovery-email"
                    className="block text-sm font-medium text-gray-400 mb-2"
                  >
                    Recovery email
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
                      placeholder="your-email@example.com"
                      className="w-full bg-black border border-surface-border rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <p className="block text-sm font-medium text-gray-400 mb-2">Send me</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { value: "username", label: "Username" },
                        { value: "password", label: "Password" },
                        { value: "both", label: "Both" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRecoveryType(option.value)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                          recoveryType === option.value
                            ? "bg-primary text-white border-primary"
                            : "bg-black text-gray-400 border-surface-border hover:text-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {recoveryStatus === "success" && (
                  <p className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-4 py-3 flex items-start gap-2">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                    {recoveryMessage}
                  </p>
                )}

                {recoveryStatus === "error" && (
                  <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                    {recoveryMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={recoveryStatus === "loading"}
                  className="w-full py-3 border border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {recoveryStatus === "loading" ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send recovery email"
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

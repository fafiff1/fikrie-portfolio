import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Login | Fahreza Portfolio",
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-6 py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

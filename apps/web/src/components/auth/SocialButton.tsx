import { signIn } from "next-auth/react";
import Image from "next/image";

export default function SocialButton({ provider, loading }: { provider: string; loading: boolean }) {
  return (
    <button
      type="button"
      className="w-full rounded-xl border border-slate-300 bg-white py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2"
      onClick={() => signIn(provider, { callbackUrl: "/home" })}
      disabled={loading}
    >
      <Image src="/google.svg" alt="Google" width={20} height={20} />
      {loading ? "Please wait..." : "Continue with Google"}
    </button>
  );
}

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import AuthForm from "@/components/auth/AuthForm";
import { authOptions } from "@/lib/auth";

export default async function SignUpPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/home");
  }

  return <AuthForm mode="signup" />;
}

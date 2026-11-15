import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import { AuthShell, AuthHeading, authLink } from "@/components/auth/ui";

export default function LoginPage() {
  return (
    <AuthShell
      art={{
        variant: "mint", hero: "card", accent: "shield",
        title: "Every payment, in one place.",
        sub: "See your sales, balance and payouts the moment they happen.",
        chips: [
          { icon: "check", tone: "mint", title: "Payment received", sub: "₦45,000 from Ada O." },
          { icon: "device", tone: "yellow", title: "Payout on its way", sub: "₦1,250,000 to your bank" },
        ],
      }}
      footer={<>New to PayMesh? <Link href="/register" className={authLink}>Create an account</Link></>}
    >
      <AuthHeading title="Welcome back" sub="Sign in to see how your payments are doing." />
      <AuthForm mode="login" />
    </AuthShell>
  );
}
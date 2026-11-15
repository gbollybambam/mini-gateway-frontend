import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import { AuthShell, AuthHeading, Steps, authLink } from "@/components/auth/ui";

export default function RegisterPage() {
  return (
    <AuthShell
      wide
      art={{
        variant: "orange", hero: "check", accent: "card",
        title: "Start taking payments today.",
        sub: "Set up in minutes. Test everything in sandbox before you go live.",
        chips: [
          { icon: "check", tone: "mint", title: "Test mode is on", sub: "No real money moves" },
          { icon: "user", tone: "yellow", title: "Account ready", sub: "Takes about 2 minutes" },
        ],
      }}
      footer={<>Already have an account? <Link href="/login" className={authLink}>Sign in</Link></>}
    >
      <Steps steps={["Your details", "Verify email", "Start selling"]} current={0} />
      <AuthHeading title="Create your account" sub="Tell us about your business and you are ready to go." />
      <AuthForm mode="register" />
    </AuthShell>
  );
}
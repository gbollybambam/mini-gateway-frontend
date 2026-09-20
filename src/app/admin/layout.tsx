import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal | Payment Gateway",
  description: "Restricted administrative access",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#05080c] text-[#e8edf2] font-sans selection:bg-[#35d5a4]/30">
      {/* If you want an Admin top-bar navigation later, it goes here */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
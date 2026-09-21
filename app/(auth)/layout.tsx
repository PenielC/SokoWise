import Image from "next/image";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="hero-surface flex flex-1 flex-col items-center justify-center px-4 py-12">
        <Image src="/sokowise-logo-on-light.png" alt="SokoWise" width={72} height={72} className="mb-6" />
        <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm shadow-ink-900/5">
          {children}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

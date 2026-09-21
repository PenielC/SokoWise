import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth/session";
import { signOutAction } from "@/lib/actions/sign-out";
import { Button } from "@/components/ui/Button";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-border bg-white">
      <div className="container-page flex h-14 items-center justify-between">
        <Link href="/" aria-label="SokoWise home" className="flex items-center">
          <Image src="/sokowise-icon.png" alt="SokoWise" width={32} height={32} priority />
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            {user.sellerId ? (
              <Link href="/dashboard/seller" className="text-sm font-medium text-ink-900 hover:text-green-600">
                My listings
              </Link>
            ) : (
              <Link href="/sellers/register" className="text-sm font-medium text-ink-900 hover:text-green-600">
                Register as seller
              </Link>
            )}
            {user.systemRole === "ADMIN" ? (
              <Link href="/admin" className="text-sm font-medium text-ink-900 hover:text-green-600">
                Admin
              </Link>
            ) : null}
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" className="!px-4 !py-1.5 text-xs">
                Sign out
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button href="/sign-in" variant="ghost" className="!px-4 !py-1.5 text-xs">
              Sign in
            </Button>
            <Button href="/sign-up" className="!px-4 !py-1.5 text-xs">
              Create account
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

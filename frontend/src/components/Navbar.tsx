import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/server";
import { NavClient } from "./NavClient";

export async function Navbar() {
  const user = await getCurrentUser();

  // We pass the user context to the interactive client component
  // We only pass safe properties to avoid leaking admin claims unnecessarily (though it's just their own session).
  const safeUser = user ? {
    displayName: user.displayName,
    role: user.role,
  } : null;

  return (
    <header className="bg-[#0a0a0a] sticky top-0 z-40 border-b border-[#222]">
      <div className="mx-auto px-5 sm:px-8 lg:px-12 h-16 max-w-[1600px] flex items-center justify-between">
        <div className="flex items-center gap-10 flex-1">
          <Link href="/" className="z-10 flex items-center shrink-0">
            <img src="/jojo-store.svg" alt="JOJO Store" className="h-[22px] w-auto brightness-0 invert" />
          </Link>
          <NavClient user={safeUser} />
        </div>
      </div>
    </header>
  );
}

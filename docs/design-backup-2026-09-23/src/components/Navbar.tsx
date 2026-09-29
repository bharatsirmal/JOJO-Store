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
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="z-10 flex items-center">
          <img src="/jojo-store.svg" alt="JOJO Store" className="h-8 w-auto" />
        </Link>
        <NavClient user={safeUser} />
      </div>
    </header>
  );
}

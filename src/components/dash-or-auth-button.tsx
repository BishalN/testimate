import Link from "next/link";
import { createClient } from "@/supabase/clients/server";
import { SignoutButton } from "@/components/signout-button";

export async function DashOrAuthButton() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();

  return (
    <div className="space-x-1">
      {data.session ? (
        <>
          <Link
            href="/dashboard"
            className="sm:w-auto inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Dashboard
          </Link>
          <SignoutButton />
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="sm:w-auto inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="sm:w-auto inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Sign up
          </Link>
        </>
      )}
    </div>
  );
}

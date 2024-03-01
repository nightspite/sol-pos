"use client";

import { FRONTEND_ROUTES } from "@/lib/routes";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "./ui/button";

export const AuthButton = () => {
  const session = useSession();

  if (session.data?.user) {
    return (
      <Button
        onClick={async () => {
          await signOut();
        }}
      >
        Sign out
      </Button>
    );
  }

  return (
    <Link href={FRONTEND_ROUTES?.SIGN_IN}>
      <Button>Sign in</Button>
    </Link>
  );
};

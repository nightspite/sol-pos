"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { type Session } from "next-auth";

export const AuthProvider = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) => {
  return (
    <>
      <SessionProvider session={session} refetchInterval={0}>
        {children}
      </SessionProvider>
    </>
  );
};

import "@/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import Header from "@/app/_components/header";
import { AuthProvider } from "@/app/providers/auth-provider";
import { getServerAuthSession } from "@/server/auth";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Solana PoS",
  description: "Solana Point of Sale System",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          inter.variable,
        )}
      >
        <TRPCReactProvider>
          <AuthProvider session={session}>
            <Header />
            {children}
          </AuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { type z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { signIn, useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import Link from "next/link";
import { FRONTEND_ROUTES } from "@/lib/routes";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { ShieldAlertIcon } from "lucide-react";
import { useEffect } from "react";
import { signinSchema } from "@/schemas/user";

type FormType = z.infer<typeof signinSchema>;

export default function Page() {
  const router = useRouter();
  const { data } = useSession();

  useEffect(() => {
    if (data?.user) {
      router.push(FRONTEND_ROUTES.HOME);
    }
  }, [data?.user, router]);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl");
  const error = searchParams?.get("error");

  const form = useForm<FormType>({
    resolver: zodResolver(signinSchema),
  });

  return (
    <div className="">
      <Form {...form}>
        <form
          className="mx-auto mt-32 max-w-md"
          onSubmit={form.handleSubmit(async (data) => {
            await signIn("credentials", {
              username: data.username,
              password: data.password,
              callbackUrl: callbackUrl ?? "/",
            });
          })}
        >
          <Card>
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>
                Sign in to your account to continue or{" "}
                <Link href={FRONTEND_ROUTES.SIGN_UP}>
                  <Button className="h-auto p-0" variant="link">
                    create an account
                  </Button>
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} placeholder="Username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="flex w-full items-baseline">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        placeholder="Password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error ? (
                <Alert variant="destructive">
                  <ShieldAlertIcon className="h-4 w-4" />
                  <AlertTitle>There was an error signing in.</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
            <CardFooter>
              <Button type="submit">Sign in</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}

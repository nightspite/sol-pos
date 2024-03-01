"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { z } from "zod";
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
import { toast } from "sonner";
import { Input } from "@/app/components/ui/input";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import Link from "next/link";
import { FRONTEND_ROUTES } from "@/lib/routes";

const schema = z.object({
  name: z.string().min(1),
  username: z.string().min(4),
  password: z.string().min(8).max(50),
});
type FormType = z.infer<typeof schema>;

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

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
  });

  const { mutate } = api.user.signup.useMutation({
    onSuccess: () => {
      toast.success("Signed up successfully");
      router.push(
        callbackUrl
          ? FRONTEND_ROUTES.SIGN_IN + "?callbackUrl=" + callbackUrl
          : FRONTEND_ROUTES.SIGN_IN,
      );
    },
    onError: (error) => {
      toast.error("Sign up failed.", {
        description: error?.message,
      });
    },
  });

  return (
    <Form {...form}>
      <form
        className="mx-auto mt-32 max-w-md"
        onSubmit={form.handleSubmit((data) => mutate(data))}
      >
        <Card>
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>
              Sign up or{" "}
              <Link href={FRONTEND_ROUTES.SIGN_IN}>
                <Button className="h-auto p-0" variant="link">
                  sign in
                </Button>
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} placeholder="Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <Input type="password" {...field} placeholder="Password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit">Sign up</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

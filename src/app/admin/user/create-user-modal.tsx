"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { api } from "@/trpc/react";
import { type z } from "zod";
import { USER_ROLE_ARRAY, createUserSchema } from "@/schemas/user";
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
import { Button } from "@/app/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface DeleteUserModalProps {
  children: React.ReactNode;
}

type FormType = z.infer<typeof createUserSchema>;

export function CreateUserModal({ children }: DeleteUserModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const utils = api.useUtils();
  const { mutate } = api.user.createUser.useMutation({
    onSuccess: async (data) => {
      setIsOpen(false);
      await utils.user.getUserList.invalidate();
      await utils.user.getUser.invalidate({
        id: data.id,
      });
    },
  });

  const form = useForm<FormType>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      role: "CASHIER",
    },
  });

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>Create a new user.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((data) => {
              mutate(data);
            })}
          >
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

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(v) => {
                        field.onChange(v);
                      }}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pick role" />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_ROLE_ARRAY?.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">
                <PlusIcon className="mr-2" size={16} />
                Create User
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

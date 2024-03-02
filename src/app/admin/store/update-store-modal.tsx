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
import { createStoreSchema, type updateStoreSchema } from "@/schemas/store";
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

interface DeleteStoreModalProps {
  id?: string;
  children: React.ReactNode;
}

type FormType = z.infer<typeof updateStoreSchema>;

export function UpdateStoreModal({ id, children }: DeleteStoreModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const utils = api.useUtils();
  const { data } = api.store.getStore.useQuery(
    { id: id ?? "" },
    {
      enabled: !!id,
    },
  );

  const { mutate } = api.store.updateStore.useMutation({
    onSuccess: async (data) => {
      setIsOpen(false);
      await utils.store.getStoreList.invalidate();
      if (data?.id) {
        await utils.store.getStore.invalidate({
          id: data.id,
        });
      }
    },
  });

  const form = useForm<FormType>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      id: data?.id ?? "",
      name: data?.name ?? "",
    },
    values: {
      id: data?.id ?? "",
      name: data?.name ?? "",
    },
  });

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Store</DialogTitle>
          <DialogDescription>Update the store details.</DialogDescription>
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

            <DialogFooter>
              <Button type="submit">
                <PlusIcon className="mr-2" size={16} />
                Update Store
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

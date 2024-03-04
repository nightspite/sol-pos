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
import { assignPosToStoreSchema } from "@/schemas/store";
import { toast } from "sonner";
import { Input } from "@/app/components/ui/input";

interface AssignPosToStoreModalProps {
  storeId: string;
  children: React.ReactNode;
}

type FormType = z.infer<typeof assignPosToStoreSchema>;

export function AssignPosToStoreModal({
  storeId,
  children,
}: AssignPosToStoreModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const utils = api.useUtils();
  const { data: store } = api.store.getStore.useQuery({
    id: storeId,
  });

  const { mutate } = api.store.assignPosToStore.useMutation({
    onSuccess: async (data) => {
      setIsOpen(false);
      // await utils.pos.getAllPos.invalidate();
      await utils.pos.getPos.invalidate({
        id: data?.id,
      });

      await utils.store.getStoreList.invalidate();
      await utils.store.getStore.invalidate({
        id: storeId,
      });
      toast.success("PoS assigned to store");
    },
    onError: (error) => {
      toast.error("PoS assign failed.", {
        description: error?.message,
      });
    },
  });

  const form = useForm<FormType>({
    resolver: zodResolver(assignPosToStoreSchema),
    defaultValues: {
      storeId,
      name: "",
    },
  });

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create & Assign PoS to {store?.name}</DialogTitle>
          <DialogDescription>Store id {store?.id}</DialogDescription>
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
                Assign
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

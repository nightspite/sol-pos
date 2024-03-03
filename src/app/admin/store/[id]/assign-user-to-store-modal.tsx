"use client";

import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { assignUserToStoreSchema } from "@/schemas/store";
import { toast } from "sonner";

interface AssignUserToStoreModalProps {
  storeId: string;
  children: React.ReactNode;
}

type FormType = z.infer<typeof assignUserToStoreSchema>;

export function AssignUserToStoreModal({
  storeId,
  children,
}: AssignUserToStoreModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const utils = api.useUtils();
  const { data: store } = api.store.getStore.useQuery({
    id: storeId,
  });
  const { data: users } = api.user.getAllUsers.useQuery();

  const { mutate } = api.store.assignUserToStore.useMutation({
    onSuccess: async (data) => {
      setIsOpen(false);
      await utils.user.getAllUsers.invalidate();
      await utils.user.getUserList.invalidate();
      await utils.user.getUser.invalidate({
        id: data?.userId,
      });

      await utils.store.getStoreList.invalidate();
      await utils.store.getStore.invalidate({
        id: storeId,
      });
      toast.success("User assigned to store");
    },
    onError: (error) => {
      toast.error("User assign failed.", {
        description: error?.message,
      });
    },
  });

  const form = useForm<FormType>({
    resolver: zodResolver(assignUserToStoreSchema),
    defaultValues: {
      storeId,
      userId: "",
    },
  });

  const unnasignedUsers = useMemo(() => {
    return users?.filter(
      (u) => !store?.users?.some((su) => su?.userId === u?.id),
    );
  }, [store?.users, users]);

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign user to {store?.name}</DialogTitle>
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
              name="userId"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>User</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(v) => {
                        field.onChange(v);
                      }}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pick user" />
                      </SelectTrigger>
                      <SelectContent>
                        {(unnasignedUsers ?? [])?.map((user) => (
                          <SelectItem key={user?.id} value={user?.id}>
                            {user?.name} ({user?.username})
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
                Assign
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

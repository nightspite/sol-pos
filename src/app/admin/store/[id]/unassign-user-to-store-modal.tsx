"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import { toast } from "sonner";

interface UnassignUserToStoreModalProps {
  storeId: string;
  userId: string;
  children: React.ReactNode;
}

export function UnassignUserToStoreModal({
  storeId,
  userId,
  children,
}: UnassignUserToStoreModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const utils = api.useUtils();
  const { mutate } = api.store.unassignUserToStore.useMutation({
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
      toast.success("User unassigned");
    },
    onError: (error) => {
      toast.error("User unassign failed.", {
        description: error?.message,
      });
    },
  });

  return (
    <AlertDialog onOpenChange={setIsOpen} open={isOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
            <br />
            This will permanently unassign the user from the store.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              mutate({ storeId, userId });
            }}
          >
            Unnasign
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

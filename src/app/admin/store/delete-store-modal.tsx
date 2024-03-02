"use client";

import { useState } from "react";
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
import { api } from "@/trpc/react";

interface DeleteStoreModalProps {
  id: string;
  children: React.ReactNode;
}

export function DeleteStoreModal({ id, children }: DeleteStoreModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const utils = api.useUtils();
  const { mutate } = api.store.deleteStore.useMutation({
    onSuccess: async (data) => {
      setIsOpen(false);
      await utils.store.getStoreList.invalidate();
      await utils.store.getStore.invalidate({
        id: data.id,
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
            This will permanently delete the store.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              mutate({ id });
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

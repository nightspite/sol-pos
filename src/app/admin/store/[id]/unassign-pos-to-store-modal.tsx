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

interface UnassignPosToStoreModalProps {
  storeId: string;
  posId: string;
  children: React.ReactNode;
}

export function UnassignPosToStoreModal({
  storeId,
  posId,
  children,
}: UnassignPosToStoreModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const utils = api.useUtils();
  const { mutate } = api.store.unassignPosToStore.useMutation({
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
      toast.success("PoS unassigned");
    },
    onError: (error) => {
      toast.error("PoS unassign failed.", {
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
            This will permanently unassign the PoS from the store.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              mutate({ storeId, posId });
            }}
          >
            Unnasign
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

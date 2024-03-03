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

interface UnassignProductToStoreModalProps {
  storeId: string;
  productId: string;
  children: React.ReactNode;
}

export function UnassignProductToStoreModal({
  storeId,
  productId,
  children,
}: UnassignProductToStoreModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const utils = api.useUtils();
  const { mutate } = api.store.unassignProductToStore.useMutation({
    onSuccess: async (data) => {
      setIsOpen(false);
      await utils.product.getAllProducts.invalidate();
      await utils.product.getProductList.invalidate();
      await utils.product.getProduct.invalidate({
        id: data?.productId,
      });

      await utils.store.getStoreList.invalidate();
      await utils.store.getStore.invalidate({
        id: storeId,
      });
      toast.success("Product unassigned");
    },
    onError: (error) => {
      toast.error("Product unassign failed.", {
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
            This will permanently unassign the product from the store.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              mutate({ storeId, productId });
            }}
          >
            Unnasign
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
import { toast } from "sonner";

interface DeleteProductModalProps {
  id: string;
  children: React.ReactNode;
}

export function DeleteProductModal({ id, children }: DeleteProductModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const utils = api.useUtils();
  const { mutate } = api.product.deleteProduct.useMutation({
    onSuccess: async (data) => {
      setIsOpen(false);
      await utils.product.getProductList.invalidate();
      await utils.product.getProduct.invalidate({
        id: data.id,
      });
      toast.success("Product deleted");
    },
    onError: (error) => {
      toast.error("Product delete failed.", {
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
            This will permanently delete the product.
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

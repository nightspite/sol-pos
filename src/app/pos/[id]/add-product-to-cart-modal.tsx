"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { api } from "@/trpc/react";
import { DataTable } from "@/app/components/ui/data-table";
import { ADD_PRODUCT_TO_CART_COLUMNS } from "./add-product-to-cart-columns";

interface AddProductToCartModalProps {
  children: React.ReactNode;
  orderId: string;
}

export function AddProductToCartModal({
  children,
  orderId,
}: AddProductToCartModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data } = api.order.getOrder.useQuery({
    id: orderId,
  });

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add product to cart</DialogTitle>
          <DialogDescription>
            Add product to cart by selecting the product.
          </DialogDescription>
        </DialogHeader>

        <DataTable
          // bordered
          columns={ADD_PRODUCT_TO_CART_COLUMNS({
            orderId: orderId ?? "",
            onSuccess: () => {
              setIsOpen(false);
            },
          })}
          data={(data?.store?.products ?? [])?.sort((a, b) => {
            return a.product.name.localeCompare(b.product.name);
          })}
          // onPaginationChange={setPagination}
          // pageCount={Math.ceil((data?.total ?? 0) / pagination.pageSize)}
          // pagination={{
          //   pageIndex: pagination.pageIndex,
          //   pageSize: pagination.pageSize,
          // }}
        />
      </DialogContent>
    </Dialog>
  );
}

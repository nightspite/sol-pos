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
import { assignProductToStoreSchema } from "@/schemas/store";
import { toast } from "sonner";
import { Input } from "@/app/components/ui/input";

interface AssignProductToStoreModalProps {
  storeId: string;
  children: React.ReactNode;
}

type FormType = z.infer<typeof assignProductToStoreSchema>;

export function AssignProductToStoreModal({
  storeId,
  children,
}: AssignProductToStoreModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const utils = api.useUtils();
  const { data: store } = api.store.getStore.useQuery({
    id: storeId,
  });
  const { data: products } = api.product.getAllProducts.useQuery();

  const { mutate } = api.store.assignProductToStore.useMutation({
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
      toast.success("Product assigned to store");
    },
    onError: (error) => {
      toast.error("Product assign failed.", {
        description: error?.message,
      });
    },
  });

  const form = useForm<FormType>({
    resolver: zodResolver(assignProductToStoreSchema),
    defaultValues: {
      storeId,
      productId: "",
    },
  });

  const unnasignedProducts = useMemo(() => {
    return products?.filter(
      (u) => !store?.products?.some((su) => su?.productId === u?.id),
    );
  }, [store?.products, products]);

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign product to {store?.name}</DialogTitle>
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
              name="productId"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Product</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(v) => {
                        field.onChange(v);
                      }}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pick product" />
                      </SelectTrigger>
                      <SelectContent>
                        {(unnasignedProducts ?? [])?.length > 0 ? (
                          <>
                            {unnasignedProducts?.map((product) => (
                              <SelectItem key={product?.id} value={product?.id}>
                                {product?.name} ({product?.id})
                              </SelectItem>
                            ))}
                          </>
                        ) : (
                          <SelectItem disabled value="disabled">
                            No products to assign
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} placeholder={"1"} />
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

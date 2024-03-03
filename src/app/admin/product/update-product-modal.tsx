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
import {
  createProductSchema,
  type updateProductSchema,
} from "@/schemas/product";
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
import { toast } from "sonner";

interface UpdateProductModalProps {
  id?: string;
  children: React.ReactNode;
}

type FormType = z.infer<typeof updateProductSchema>;

export function UpdateProductModal({ id, children }: UpdateProductModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const utils = api.useUtils();
  const { data } = api.product.getProduct.useQuery(
    { id: id ?? "" },
    {
      enabled: !!id,
    },
  );

  const { mutate } = api.product.updateProduct.useMutation({
    onSuccess: async (data) => {
      setIsOpen(false);
      await utils.product.getProductList.invalidate();
      if (data?.id) {
        await utils.product.getProduct.invalidate({
          id: data.id,
        });
      }
      toast.success("Product updated");
    },
    onError: (error) => {
      toast.error("Product update failed.", {
        description: error?.message,
      });
    },
  });

  const form = useForm<FormType>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      id: data?.id ?? "",
      name: data?.name ?? "",
      price: data?.price ? data?.price / 100 : 0,
    },
    values: {
      id: data?.id ?? "",
      name: data?.name ?? "",
      price: data?.price ? data?.price / 100 : 0,
    },
  });

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Product</DialogTitle>
          <DialogDescription>
            Update an existing products account.
          </DialogDescription>
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

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Price in USD</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={0.01}
                      {...field}
                      placeholder="10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">
                <PlusIcon className="mr-2" size={16} />
                Update Product
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

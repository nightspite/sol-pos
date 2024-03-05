import { Button } from "@/app/components/ui/button";
import { Form } from "@/app/components/ui/form";
import { formatMoney } from "@/lib/money";
import { addProductToCartSchema } from "@/schemas/order";
import { api } from "@/trpc/react";
import { type RouterOutputs } from "@/trpc/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ColumnDef } from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

type FormType = z.infer<typeof addProductToCartSchema>;

type ProductOrdersTableItem = NonNullable<
  RouterOutputs["order"]["getOrder"]
>["store"]["products"][number];

export const ADD_PRODUCT_TO_CART_COLUMNS = ({
  orderId,
  onSuccess,
}: {
  orderId: string;
  onSuccess: () => void;
}): ColumnDef<ProductOrdersTableItem>[] => [
  {
    header: "Product",
    accessorKey: "product",
    cell: ({ row }) => {
      return (
        <span className="font-medium">
          {row?.original?.product?.name ?? "-"}
        </span>
      );
    },
  },
  {
    header: "Price",
    accessorKey: "price",
    cell: ({ row }) => {
      return (
        <span className="font-medium">
          {row?.original?.product?.price
            ? formatMoney(row?.original?.product?.price)
            : "-"}
        </span>
      );
    },
  },
  {
    header: "Available",
    accessorKey: "available",
    cell: ({ row }) => {
      return (
        <span className="font-medium">{row?.original?.quantity ?? "-"}</span>
      );
    },
  },
  {
    header: "",
    accessorKey: "actions",
    cell: ({ row }) => {
      return <ActionsCell row={row} orderId={orderId} onSuccess={onSuccess} />;
    },
  },
];

const ActionsCell = ({
  row,
  orderId,
  onSuccess,
}: {
  row: {
    original: ProductOrdersTableItem;
  };
  orderId: string;
  onSuccess: () => void;
}) => {
  const form = useForm<FormType>({
    resolver: zodResolver(addProductToCartSchema),
    defaultValues: {
      orderId,
      productId: row?.original?.productId ?? "",
    },
  });

  const utils = api.useUtils();
  const { mutate } = api.order.addProductToCart.useMutation({
    onSuccess: async (data) => {
      await utils.order.getCartOrder.invalidate({
        posId: data?.posId,
      });
      await utils.order.getOrder.invalidate({
        id: data?.id,
      });
      onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to add product to cart", {
        description: error.message,
      });
    },
  });

  return (
    <Form {...form}>
      <form
        className="flex justify-end"
        onSubmit={form.handleSubmit((data) => {
          mutate(data);
        })}
      >
        <Button type="submit">
          <PlusIcon className="mr-2" size={16} /> Add to cart
        </Button>
      </form>
    </Form>
  );
};

"use client";

import { FullscreenMessage } from "@/app/components/fullscreen-message";
import { Button } from "@/app/components/ui/button";
import { formatMoney } from "@/lib/money";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { AddProductToCartModal } from "./add-product-to-cart-modal";
import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

export default function Page({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const session = useSession();
  const { data: pos } = api.pos.getPos.useQuery({
    id: params.id,
  });

  const { data: order } = api.order.getCartOrder.useQuery(
    {
      posId: params.id,
    },
    {
      enabled: !!pos,
    },
  );

  const utils = api.useUtils();
  const { mutate: addToCart } = api.order.addProductToCart.useMutation({
    onSuccess: async (data) => {
      await utils.order.getCartOrder.invalidate({
        posId: data?.posId,
      });
      await utils.order.getOrder.invalidate({
        id: data?.id,
      });
    },
    onError: (error) => {
      toast.error("Failed to add product to cart", {
        description: error.message,
      });
    },
  });
  const { mutate: removeFromCart } =
    api.order.removeProductFromCart.useMutation({
      onSuccess: async (data) => {
        await utils.order.getCartOrder.invalidate({
          posId: data?.posId,
        });
        await utils.order.getOrder.invalidate({
          id: data?.id,
        });
      },
      onError: (error) => {
        toast.error("Failed to remove product from cart", {
          description: error.message,
        });
      },
    });

  const sum = useMemo(() => {
    return (order?.items ?? []).reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
  }, [order?.items]);

  if (
    !pos?.store?.users?.find((user) => user.userId === session?.data?.user?.id)
  ) {
    return (
      <FullscreenMessage>
        You are not authorized to use this Point of Sale
      </FullscreenMessage>
    );
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-3xl border border-border py-16">
      <div className="absolute top-0 flex h-16 w-full items-center justify-between border border-b border-border px-4 font-semibold">
        Point of Sale {pos.name}
        {order?.id ? (
          <AddProductToCartModal orderId={order?.id}>
            <Button>Add new product</Button>
          </AddProductToCartModal>
        ) : (
          <Button disabled>Add new product</Button>
        )}
      </div>
      <div
        className="h-full overflow-y-auto"
        style={{
          minHeight: "calc(100dvh - 130px)",
        }}
      >
        <div className="space-y-4 p-4">
          {order?.items
            ?.sort((a, b) => {
              return (
                new Date(a.createdAt).valueOf() -
                new Date(b.createdAt).valueOf()
              );
            })
            ?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border border-border p-4"
              >
                <div>
                  <div>{item.product.name}</div>
                  <div className="text-text-muted line-clamp-1 text-sm">
                    {item?.productId}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      removeFromCart({
                        orderId: order.id,
                        productId: item.productId,
                      });
                    }}
                  >
                    <MinusIcon size={16} />
                  </Button>
                  <div>x{item.quantity}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      addToCart({
                        orderId: order.id,
                        productId: item.productId,
                      });
                    }}
                  >
                    <PlusIcon size={16} />
                  </Button>
                  <div>
                    {formatMoney(item.price)} (
                    {formatMoney(item?.price * item?.quantity)})
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      removeFromCart({
                        orderId: order.id,
                        productId: item.productId,
                        removeAll: true,
                      });
                    }}
                  >
                    <TrashIcon size={16} />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className="absolute bottom-0 flex h-16 w-full items-center justify-between border border-b border-border px-4">
        <div className="text-xl font-semibold">{formatMoney(sum)}</div>
        <Button>Pay</Button>
      </div>
    </div>
  );
}

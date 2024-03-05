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
import { FRONTEND_ROUTES } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { Spinner } from "@/app/components/ui/spinner";

export default function Page({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const session = useSession();
  const router = useRouter();
  const { data: pos, isLoading: isLoadingPos } = api.pos.getPos.useQuery({
    id: params.id,
  });

  const { data: order, isLoading: isLoadingOrder } =
    api.order.getCartOrder.useQuery(
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

  const { mutateAsync: generatePaymentLink } =
    api.order.generatePaymentLink.useMutation({
      onSuccess: async (data) => {
        if (data) {
          router.push(`${FRONTEND_ROUTES.ORDER}/${data.id}`);
          await utils.pos.getPos.invalidate({
            id: data?.posId,
          });
          await utils.order.getCartOrder.invalidate({
            posId: data?.posId,
          });
          await utils.order.getOrder.invalidate({
            id: data?.id,
          });
        }
      },
      onError: (error) => {
        toast.error("Failed to generate payment link", {
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

  if (isLoadingPos || isLoadingOrder) {
    return (
      <FullscreenMessage custom>
        <Spinner size="xl" />
      </FullscreenMessage>
    );
  }

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
    <div className="relative mx-auto min-h-screen w-full max-w-3xl py-16">
      <div className="absolute top-0 flex h-16 w-full items-center justify-between rounded-md border border-b border-border px-4 font-semibold">
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
        <div className="mt-4 space-y-4">
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
                className="flex items-center justify-between rounded-md border border-border p-4"
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
                    // variant="destructive"
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
      <div className="absolute bottom-0 flex h-16 w-full items-center justify-between rounded-md border border-b border-border px-4">
        <div className="text-xl font-semibold">{formatMoney(sum)}</div>
        {order?.id ? (
          <Button
            onClick={() => generatePaymentLink({ orderId: order?.id })}
            disabled={!sum}
          >
            Pay
          </Button>
        ) : (
          <Button disabled>Pay</Button>
        )}
      </div>
    </div>
  );
}

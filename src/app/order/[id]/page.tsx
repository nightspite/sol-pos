"use client";

import { formatMoney } from "@/lib/money";
import { api } from "@/trpc/react";
import { FullscreenMessage } from "@/app/components/fullscreen-message";
import { useEffect, useMemo, useState } from "react";
import { createQR, findReference } from "@solana/pay";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { FRONTEND_ROUTES } from "@/lib/routes";
import { Spinner } from "@/app/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { connection, getSolscanUrl, uuidToBase58 } from "@/lib/solana";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";

export default function Page({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const utils = api.useUtils();
  const { data: order, isLoading: isLoadingOrder } =
    api.order.getOrder.useQuery({
      id: params.id,
    });

  const sum = useMemo(() => {
    return (order?.items ?? []).reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
  }, [order?.items]);

  const [qrData, setQrData] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (order?.paymentUrl) {
        const qr = createQR(order?.paymentUrl ?? "");
        const qrBlob = await qr.getRawData("png");
        if (!qrBlob) {
          return null;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          if (typeof event?.target?.result === "string") {
            setQrData(event.target.result);
          }
        };
        reader.readAsDataURL(qrBlob);
      }
    };

    generateQR().catch((err) => console.log(err));
  }, [order?.paymentUrl]);

  const { mutate: verifyTransaction } = api.order.verifyTransaction.useMutation(
    {
      onSuccess: async (data) => {
        await utils.pos.getPos.invalidate({
          id: data?.posId,
        });
        await utils.order.getCartOrder.invalidate({
          posId: data?.posId,
        });
        await utils.order.getOrder.invalidate({
          id: data?.id,
        });
      },
      onError: (error) => {
        toast.error("Failed to verify transaction", {
          description: error.message,
        });
      },
    },
  );

  // check if transaction is confirmed
  useQuery({
    enabled: !!order?.paymentUrl && order?.status === "CART",
    refetchInterval: (data) =>
      !!order?.paymentUrl && order?.status === "CART" && !data?.signature
        ? 250
        : false,
    queryKey: ["payment-confirmed", order?.paymentUrl],
    queryFn: async () => {
      if (order?.paymentUrl && order) {
        const sig = await findReference(
          connection,
          new PublicKey(uuidToBase58(order?.id)),
          { finality: "finalized" },
        );

        if (sig?.signature) {
          return {
            signature: sig.signature,
          };
        }
        return null;
      }
      return null;
    },
    onSuccess: (data) => {
      // if transaction is completed, validate it on backend -> then set order to completed
      if (data?.signature && order?.id) {
        verifyTransaction({
          orderId: order?.id,
          signature: data?.signature,
        });
      }
    },
  });

  if (isLoadingOrder) {
    return (
      <FullscreenMessage custom>
        <Spinner size="xl" />
      </FullscreenMessage>
    );
  }

  if (!order?.paymentUrl) {
    return (
      <FullscreenMessage custom={!!order?.posId}>
        <div>
          Something went wrong, <br />
          while creating payment.
        </div>
        {order?.posId ? (
          <Link href={FRONTEND_ROUTES.POS + "/" + order?.posId}>
            <Button>Go back</Button>
          </Link>
        ) : null}
      </FullscreenMessage>
    );
  }

  if (order?.status === "COMPLETED") {
    return (
      <FullscreenMessage custom={!!order?.posId}>
        <div>
          Thank you! <br />
          Payment was successful.
        </div>
        <div className="text-lg">
          Check transaction on{" "}
          {order?.signature ? (
            <a
              href={getSolscanUrl(order?.signature)}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Solscan
            </a>
          ) : null}
        </div>
        {order?.posId ? (
          <Link href={FRONTEND_ROUTES.POS + "/" + order?.posId}>
            <Button>Start new cart</Button>
          </Link>
        ) : null}
      </FullscreenMessage>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="text-3xl font-semibold">{formatMoney(sum)}</div>
      {qrData ? (
        <Image
          src={qrData}
          alt="QR Code"
          width={300}
          height={300}
          className="rounded-xl bg-white"
          priority
        />
      ) : (
        <Spinner size="xl" />
      )}
      <div className="font-mono">Order ID: {order?.id}</div>
    </div>
  );
}

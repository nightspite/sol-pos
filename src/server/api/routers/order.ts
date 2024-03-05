import { addProductToCartSchema } from "@/schemas/order";
import {
  adminProcedure,
  cashierProcedure,
  createTRPCRouter,
} from "@/server/api/trpc";
import { orderItemTable, orderTable, productToStoreTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq, sql, and } from "drizzle-orm";
import { z } from "zod";
import { type TransferRequestURLFields, encodeURL, validateTransfer } from '@solana/pay';
import { PublicKey } from '@solana/web3.js';
import { USDC_SPL_TOKEN, connection, uuidToBase58 } from "@/lib/solana";
import { POS_WALLET_ADDRESS } from "@/lib/solana";
import { BigNumber } from "bignumber.js";

export const orderRouter = createTRPCRouter({
  getOrderList: adminProcedure.input(z.object({
    limit: z.number().default(10),
    offset: z.number().default(0),
  })).query(async ({ ctx, input }) => {
    return await ctx.db.transaction(async (trx) => {
      const items = await trx.query.orderTable.findMany({
        limit: input.limit,
        offset: input.offset,
        with: {
          items: true,
          pos: true,
          store: true,
        }
      });
      const [total] = await trx
        .select({ total: sql<string>`count(*)` })
        .from(orderTable);
      return {
        items: items || [],
        total: total?.total ? parseInt(total.total, 10) : 0,
      };
    });
  }),

  getOrder: cashierProcedure.input(z.object({
    id: z.string(),
  })).query(async ({ ctx, input }) => {
    return await ctx.db.query.orderTable.findFirst({
      where: (u) => eq(u.id, input.id),
      with: {
        items: {
          with: {
            product: true,
          },
        },
        pos: true,
        store: {
          with: {
            products: {
              with: {
                product: true,
              }
            }
          }
        },
      },
    });
  }),

  getCartOrder: cashierProcedure.input(z.object({
    posId: z.string(),
  })).query(async ({ ctx, input }) => {
    const pos = await ctx.db.query.posTable.findFirst({
      where: (u) => eq(u.id, input.posId),
    });

    if(!pos) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Pos not found",
      });
    }

    const order = await ctx.db.query.orderTable.findFirst({
      where: (u) => and(eq(u.posId, input.posId), eq(u.status, "CART")),
      with: {
        items: {
          with: {
            product: true,
          },
        },
        pos: true,
        store: true,
      },
    });

    if (!order) {
      await ctx.db.insert(orderTable).values({
        posId: input.posId,
        storeId: pos.storeId,
        status: "CART",
      }).returning();

      const updatedOrder = await ctx.db.query.orderTable.findFirst({
        where: (u) => and(eq(u.posId, input.posId), eq(u.status, "CART")),
        with: {
          items: {
            with: {
              product: true,
            },
          },
          pos: true,
          store: true,
        },
      });

      return updatedOrder;
    }

    return order;
  }),

  addProductToCart: cashierProcedure.input(addProductToCartSchema).mutation(async ({ ctx, input }) => {
    const order = await ctx.db.query.orderTable.findFirst({
      where: (u) => and(eq(u.id, input.orderId)),
      with: {
        items: {
          with: {
            product: true,
          },
        },
        pos: true,
        store: {
          with: {
            products: {
              with: {
                product: true,
              }
            }
          }
        }
      },
    });

    if (!order) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Order not found",
      });
    }

    if (order.status !== "CART") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Order status is not CART",
      });
    }

    const product = order?.store?.products?.find((product) => product.productId === input.productId);
    if (!product) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product not found in store",
      });
    }

    if (product?.quantity < 1) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Product is out of stock",
      });
    }
    
    const orderItem = order?.items?.find((item) => item.productId === input.productId);

    if (orderItem) {
      // add to order
      await ctx.db.transaction(async (trx) => {
        // add to order
        const [txOrderItem] = await trx.update(orderItemTable).set({
          quantity: sql`quantity + 1`,
        }).where(and(
          eq(orderItemTable.orderId, order.id),
          eq(orderItemTable.productId, input.productId),
        )).returning();

        // remove from stock
        const [txProductToStore] = await trx.update(productToStoreTable).set({
          quantity: sql`quantity - 1`,
        }).where(and(
          eq(productToStoreTable.storeId, order.storeId),
          eq(productToStoreTable.productId, input.productId),
        )).returning();

        if (!txOrderItem || !txProductToStore) {
          trx.rollback();
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order item or product not found",
          });
        }
      });
    } else {
      await ctx.db.transaction(async (trx) => {
        // add to order
        const [txOrderItem] = await trx.insert(orderItemTable).values({
          orderId: order.id,
          productId: input.productId,
          quantity: 1,
          price: product?.product?.price,
        }).returning();

        // remove from stock
        const [txProductToStore] = await trx.update(productToStoreTable).set({
          quantity: sql`quantity - 1`,
        }).where(and(
          eq(productToStoreTable.storeId, order.storeId),
          eq(productToStoreTable.productId, input.productId),
        )).returning();

        if (!txOrderItem || !txProductToStore) {
          trx.rollback();
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order item or product not found",
          });
        }
      });
    }

    const updatedOrder = await ctx.db.query.orderTable.findFirst({
      where: (u) => and(eq(u.id, input.orderId)),
      with: {
        items: {
          with: {
            product: true,
          },
        },
        pos: true,
        store: true,
      },
    });

    return updatedOrder;
  }),

  removeProductFromCart: cashierProcedure.input(z.object({
    orderId: z.string(),
    productId: z.string(),
    removeAll: z.boolean().default(false),
  })).mutation(async ({ ctx, input }) => {
    const order = await ctx.db.query.orderTable.findFirst({
      where: (u) => and(eq(u.id, input.orderId)),
      with: {
        items: {
          with: {
            product: true,
          },
        },
        pos: true,
        store: {
          with: {
            products: {
              with: {
                product: true,
              }
            }
          }
        }
      },
    });

    if (!order) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Order not found",
      });
    }

    if (order.status !== "CART") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Order status is not CART",
      });
    }

    const product = order?.store?.products?.find((product) => product.productId === input.productId);
    if (!product) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product not found in store",
      });
    }

    const orderItem = order?.items?.find((item) => item.productId === input.productId);

    if (orderItem && orderItem.quantity > 1) {
      if (!input.removeAll) {
        await ctx.db.transaction(async (trx) => {
          // remove from order
          const [txOrderItem] = await trx.update(orderItemTable).set({
            quantity: sql`quantity - 1`,
          }).where(and(
            eq(orderItemTable.orderId, order.id),
            eq(orderItemTable.productId, input.productId),
          )).returning();

          // add to stock
          const [txProductToStore] = await trx.update(productToStoreTable).set({
            quantity: sql`quantity + 1`,
          }).where(and(
            eq(productToStoreTable.storeId, order.storeId),
            eq(productToStoreTable.productId, input.productId),
          )).returning();

          if (!txOrderItem || !txProductToStore) {
            trx.rollback();
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Order item or product not found",
            });
          }
        });
      } else {
        await ctx.db.transaction(async (trx) => {
          // remove from order
          const [txOrderItem] = await trx.delete(orderItemTable).where(and(
            eq(orderItemTable.orderId, order.id),
            eq(orderItemTable.productId, input.productId),
          )).returning();

          // add to stock
          const [txProductToStore] = await trx.update(productToStoreTable).set({
            quantity: sql`quantity + ${orderItem.quantity}`,
          }).where(and(
            eq(productToStoreTable.storeId, order.storeId),
            eq(productToStoreTable.productId, input.productId),
          )).returning();

          if (!txOrderItem || !txProductToStore) {
            trx.rollback();
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Order item or product not found",
            });
          }
        });
      }
    } else {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product not found in cart",
      });
    }

    const updatedOrder = await ctx.db.query.orderTable.findFirst({
      where: (u) => and(eq(u.id, input.orderId)),
      with: {
        items: {
          with: {
            product: true,
          },
        },
        pos: true,
        store: true,
      },
    });

    return updatedOrder;
  }),

  generatePaymentLink: cashierProcedure.input(z.object({
    orderId: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const order = await ctx.db.query.orderTable.findFirst({
      where: (u) => and(eq(u.id, input.orderId)),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Order not found",
      });
    }

    if (order.status !== "CART") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Order status is not CART",
      });
    }

    const sum = order?.items?.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );

    if (sum <= 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Order total is 0",
      });
    }

    const fields: TransferRequestURLFields = {
      recipient: new PublicKey(POS_WALLET_ADDRESS),
      amount: new BigNumber(sum / 100),
      splToken: new PublicKey(USDC_SPL_TOKEN),
      reference: new PublicKey(uuidToBase58(order?.id)),
      label: 'Solana PoS Store',
      message: `Solana PoS Store - Order ${order.id} - ${sum} USDC`,
      memo: order?.id,
    }

    const url = encodeURL({...fields});

    const [updatedOrder] = await ctx.db.update(orderTable).set({
      paymentUrl: url.toString(),
    }).where(eq(orderTable.id, order.id)).returning();

    return updatedOrder
  }),

  verifyTransaction: cashierProcedure.input(z.object({
    orderId: z.string(),
    signature: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const order = await ctx.db.query.orderTable.findFirst({
      where: (u) => and(eq(u.id, input.orderId)),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Order not found",
      });
    }

    if (order.status !== "CART") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Order status is not CART",
      });
    }

    const sum = order?.items?.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );

    const validation = await validateTransfer(connection, input.signature, {
      recipient: new PublicKey(POS_WALLET_ADDRESS),
      amount: new BigNumber(sum / 100),
      splToken: new PublicKey(USDC_SPL_TOKEN),
      reference: new PublicKey(uuidToBase58(order?.id)),
    }, { commitment: 'confirmed' });

    if (!validation) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Transaction is not valid",
      });
    }

    const [updatedOrder] = await ctx.db.update(orderTable).set({
      status: "COMPLETED",
      signature: input.signature,
    }).where(eq(orderTable.id, order.id)).returning();

    return updatedOrder
  }),
});

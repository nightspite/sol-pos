import { addProductToCartSchema } from "@/schemas/order";
import {
  adminProcedure,
  cashierProcedure,
  createTRPCRouter,
} from "@/server/api/trpc";
import { orderItemTable, orderTable, productToStoreTable, storeTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { type SQL, eq, sql, and } from "drizzle-orm";
import { z } from "zod";

export const orderRouter = createTRPCRouter({
  createOrder: cashierProcedure.input(z.object({
    storeId: z.string(),
    posId: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const [createdOrder] = await ctx.db.insert(orderTable).values({
      posId: input.posId,
      storeId: input.storeId,
      status: "CART",
    }).returning();

    if (!createdOrder) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Order not found",
      });
    }

    return createdOrder;
  }),

  // addProductToOrder: cashierProcedure.input(z.object({
  //   orderId: z.string(),
  //   productId: z.string(),
  //   quantity: z.number(),
  // })).mutation(async ({ ctx, input }) => {
  //   const [order] = await ctx.db.query.orderTable.findFirst({
  //     where: (u) => eq(u.id, input.orderId),
  //   });

  //   if (!order) {
  //     throw new TRPCError({
  //       code: "NOT_FOUND",
  //       message: "Order not found",
  //     });
  //   }

  //   const [product] = await ctx.db.query.productToStoreTable.findFirst({
  //     where: (u) => eq(u.productId, input.productId),
  //   });

  //   if (!product) {
  //     throw new TRPCError({
  //       code: "NOT_FOUND",
  //       message: "Product not found",
  //     });
  //   }

  //   const [orderItem] = await ctx.db.insert(orderTable.items).values({
  //     orderId: input.orderId,
  //     productId: input.productId,
  //     quantity: input.quantity,
  //   }).returning();

  //   if (!orderItem) {
  //     throw new TRPCError({
  //       code: "NOT_FOUND",
  //       message: "Order item not found",
  //     });
  //   }

  //   return orderItem;
  // }),

  getAllOrder: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.orderTable.findMany();
  }),

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
      const [createdOrder] = await ctx.db.insert(orderTable).values({
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

  // checkout -> generate solana transaction
});

import { z } from "zod";

export const createStoreSchema = z.object({
  name: z.string().min(1),
});

export const updateStoreSchema = createStoreSchema.pick({
  name: true,
}).merge(z.object({
  id: z.string(),
}));

export const assignUserToStoreSchema = z.object({
  storeId: z.string(),
  userId: z.string(),
});

export const unassignUserToStoreSchema = assignUserToStoreSchema;

export const assignPosToStoreSchema = z.object({
  storeId: z.string(),
  posId: z.string(),
});

export const unassignPosToStoreSchema = assignPosToStoreSchema.pick({
  posId: true,
});

export const assignProductToStoreSchema = z.object({
  storeId: z.string(),
  productId: z.string(),
  quantity: z.number().default(1),
});

export const unassignProductToStoreSchema = assignProductToStoreSchema.pick({
  storeId: true,
  productId: true,
});

export const changeProductToStoreQuantitySchema = z.object({
  storeId: z.string(),
  productId: z.string(),
  quantity: z.number(),
});

import { z } from "zod";

export const addProductToCartSchema = z.object({
  orderId: z.string(),
  productId: z.string(),
});
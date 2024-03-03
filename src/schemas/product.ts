import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().min(0),
});

export const updateProductSchema = createProductSchema.pick({
  name: true,
  price: true,
}).merge(z.object({
  id: z.string(),
}));

import { z } from "zod";

export const USER_ROLE_ARRAY = ["CASHIER", "ADMIN"] as const;

export const createUserSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(4),
  password: z.string().min(5).max(50),
  role: z.enum(USER_ROLE_ARRAY),
});

export const signinSchema = createUserSchema.pick({
  username: true,
  password: true,
});

export const updateMeSchema = createUserSchema.pick({
  name: true,
});

export const updateUserSchema = createUserSchema.pick({
  name: true,
  username: true,
  role: true,
}).merge(z.object({
  id: z.string(),
}));
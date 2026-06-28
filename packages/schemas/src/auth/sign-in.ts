import { z } from "zod";
import { emailSchema } from "./email.js";

export const signInSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Password is required.")
    .min(8, "Password must be at least 8 characters long."),
});

export type SignInInput = z.infer<typeof signInSchema>;

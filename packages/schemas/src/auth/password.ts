import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email is required.")
  .email("Please enter a valid email address.")
  .transform((value) => value.trim().toLowerCase());

export type Email = z.infer<typeof emailSchema>;

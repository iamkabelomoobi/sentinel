import { z } from "zod";

export const profileImageDataUrlSchema = z
  .string()
  .trim()
  .max(1_500_000, "Profile image must be under 1MB.")
  .regex(
    /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/,
    "Profile image must be a PNG, JPG, WebP, or GIF under 1MB.",
  );

export const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required.").optional(),
    phone: z.string().trim().nullable().optional(),
    image: profileImageDataUrlSchema.nullable().optional(),
    organizationId: z
      .string()
      .trim()
      .min(1, "Organization is required.")
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "No profile changes provided.",
  });

export const emailChangeSchema = z.object({
  newEmail: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .transform((value) => value.toLowerCase()),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type EmailChangeInput = z.infer<typeof emailChangeSchema>;

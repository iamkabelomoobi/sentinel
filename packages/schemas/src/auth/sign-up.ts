import { z } from "zod";
import { emailSchema } from "./email.js";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[A-Z]/, "Password must contain an uppercase letter.")
  .regex(/[0-9]/, "Password must contain a number.");

export const registerOrganizationSchema = z.object({
  organizationName: z.string().trim().min(2, "Organization name is required."),
  organizationEmail: z
    .string()
    .trim()
    .email("Please enter a valid organization email.")
    .transform((value) => value.toLowerCase()),
  organizationPhone: z.string().trim().optional().or(z.literal("")),
  organizationWebsite: z
    .string()
    .trim()
    .url("Please enter a valid website URL.")
    .optional()
    .or(z.literal("")),
});

export const registerAdminSchema = z.object({
  adminName: z.string().trim().min(2, "Admin name is required."),
  adminEmail: emailSchema,
  adminPassword: passwordSchema,
});

export const signUpSchema = registerOrganizationSchema.and(registerAdminSchema);

export type RegisterOrganizationInput = z.infer<
  typeof registerOrganizationSchema
>;
export type RegisterAdminInput = z.infer<typeof registerAdminSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

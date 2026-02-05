import { z } from "zod";

export const adminProfileSchema = z.object({
  orgName: z.string().trim().optional().default(""),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((v) => v === "" || v.includes("@"), {
      message: "Please enter a valid email",
    }),
});

import { z } from "zod";
const nameRegex = /^(?=.*[A-Za-z])[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
export const adminProfileSchema = z.object({
  orgName: z.string().trim().optional().default(""),
  first_name: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(30, "First name cannot exceed 30 characters")
    .regex(nameRegex, "Enter a valid first name"),

  last_name: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(30, "Last name cannot exceed 30 characters")
    .regex(nameRegex, "Enter a valid last name"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .default("")
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      message: "Please enter a valid email",
    }),
});

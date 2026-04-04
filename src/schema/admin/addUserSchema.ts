import { z } from "zod";

export const addUserSchema = z.object({
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(30, "First name too long")
    .regex(/^[A-Za-z]+$/, "Only alphabets allowed"),

  last_name: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(30, "Last name too long")
    .regex(/^[A-Za-z]+$/, "Only alphabets allowed"),

  email: z.string().email("Invalid email format").max(100, "Email too long"),

  supervisor_id: z.string().nullable(),
});

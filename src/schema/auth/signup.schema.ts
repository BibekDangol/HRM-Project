import { z } from "zod";

const nameRegex = /^(?=.*[A-Za-z])[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

export const signupSchema = z
  .object({
    first_name: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(30, "First name cannot exceed 30 characters")
      .regex(nameRegex, "Enter a valid first name"),

    last_name: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(30, "Last name cannot exceed 30 characters")
      .regex(nameRegex, "Enter a valid last name"),

    organizationName: z.string().trim().min(1, "Organization name is required"),

    email: z.string().trim().toLowerCase().email("Invalid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(32, "Password must be at most 32 characters")
      .regex(/^\S+$/, "Password must not contain spaces")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),

    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

import { z } from "zod";

export const userLeaveSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(500, "Max 500 characters"),
  isHalfDay: z.boolean().default(false),
  halfSession: z.enum(["first_shift", "second_shift"]),
});

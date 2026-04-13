import { supabase } from "@/src/supabase/supabaseClient";
import { z } from "zod";


export const addUserSchema = z.object({
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(30, "First name cannot exceed 30 characters")
    .regex(
      /^(?=.*[A-Za-z])[A-Za-z]+(?:[ '-][A-Za-z]+)*$/,
      "Enter a valid first name",
    ),

  last_name: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(30, "Last name cannot exceed 30 characters")
    .regex(
      /^(?=.*[A-Za-z])[A-Za-z]+(?:[ '-][A-Za-z]+)*$/,
      "Enter a valid last name",
    ),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .max(100, "Email cannot exceed 100 characters")
    .refine(async (email) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email)
        .maybeSingle(); 

      if (error) throw new Error(error.message);

      return data === null; 
    }, "Email address is taken"),

  supervisor_id: z.string().nullable(),
});
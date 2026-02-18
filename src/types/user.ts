import { z } from "zod";
import { usersProfileSchema } from "../schema/users/userprofiles.schema";

export type FormInput = z.input<typeof usersProfileSchema>;
export type FormOutput = z.output<typeof usersProfileSchema>;


export type AttendanceRow = {
  status: string | null;
  check_in_comment: string | null;
  date?: string | null;
  created_at?: string | null;
};
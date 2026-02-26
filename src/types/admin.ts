import { z } from "zod";
import { adminProfileSchema } from "../schema/admin/adminprofiles.schema";

export type FormInput = z.input<typeof adminProfileSchema>;
export type FormOutput = z.output<typeof adminProfileSchema>;

export interface UserProfile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar?: string | null;
  role: string;
  organization_id: number;
  status?: string | null;
  organization?: { name: string | null };
  supervisor_id: string | null;
}

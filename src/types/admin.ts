import { z } from "zod";
import { adminProfileSchema } from "../schema/admin/adminprofiles.schema";

export type FormInput = z.input<typeof adminProfileSchema>;
export type FormOutput = z.output<typeof adminProfileSchema>;

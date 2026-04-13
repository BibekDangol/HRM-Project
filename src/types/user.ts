import { z } from "zod";
import { usersProfileSchema } from "../schema/users/userprofiles.schema";

export type FormInput = z.input<typeof usersProfileSchema>;
export type FormOutput = z.output<typeof usersProfileSchema>;


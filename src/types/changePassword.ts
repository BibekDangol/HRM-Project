import { z } from "zod";
import { changePasswordSchema } from "../schema/auth";

export type FormData = z.infer<typeof changePasswordSchema>;

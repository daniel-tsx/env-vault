import { z } from "zod";

export const createEnvironmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
});

export const updateEnvironmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(50).optional(),
});

export type CreateEnvironmentInput = z.infer<typeof createEnvironmentSchema>;
export type UpdateEnvironmentInput = z.infer<typeof updateEnvironmentSchema>;

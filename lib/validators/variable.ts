import { z } from "zod";

export const createVariableSchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .max(200)
    .regex(
      /^[A-Z0-9_]+$/,
      "Key must contain only uppercase letters, numbers, and underscores"
    ),
  value: z.string().min(1, "Value is required"),
  description: z.string().max(500).optional(),
  environmentId: z.string().min(1),
});

export const updateVariableSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(200)
    .regex(
      /^[A-Z0-9_]+$/,
      "Key must contain only uppercase letters, numbers, and underscores"
    )
    .optional(),
  value: z.string().min(1).optional(),
  description: z.string().max(500).optional(),
});

export type CreateVariableInput = z.infer<typeof createVariableSchema>;
export type UpdateVariableInput = z.infer<typeof updateVariableSchema>;

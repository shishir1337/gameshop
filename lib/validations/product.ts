import { z } from "zod";

/**
 * User form field configuration schema
 * Used to define custom form fields for products (e.g., Riot ID, Player ID, Server selection)
 */
export const userFormFieldSchema = z.object({
  type: z.enum(["text", "select"]),
  name: z.string().min(1, "Field name is required"),
  label: z.string().min(1, "Field label is required"),
  placeholder: z.string().optional(),
  required: z.boolean().default(true),
  options: z.array(z.string()).optional(), // For select type fields
});

/**
 * Product variant schema (e.g., "475 VP - 525 BDT", "60 UC - 100 BDT")
 */
export const productVariantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  price: z.number().int().min(1, "Price must be greater than 0"), // Price in BDT (stored as integer)
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

/**
 * Product schema
 */
export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z.string().optional(),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  isActive: z.boolean().default(true),
  userFormFields: z.array(userFormFieldSchema).optional(),
  variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
});

export type UserFormField = z.infer<typeof userFormFieldSchema>;
export type ProductVariantFormData = z.infer<typeof productVariantSchema>;
export type ProductFormData = z.infer<typeof productSchema>;


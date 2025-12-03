import z from "zod";

export const organizationSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Organization = z.infer<typeof organizationSchema>;
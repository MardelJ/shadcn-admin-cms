import z from 'zod'

export const collectionSchema = z.object({
    id: z.string(),
    workspaceId: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    settings: z.record(z.any()).default({}),
    icon: z.string().nullable(),
    sortOrder: z.number().default(0),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Collection = z.infer<typeof collectionSchema>

export interface CreateCollectionRequest {
    name: string
    slug: string
    description?: string
    icon?: string
    settings?: Record<string, any>
}
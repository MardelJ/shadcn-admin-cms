import z from 'zod'

export const workspaceSchema = z.object({
    id: z.string(),
    organizationId: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    settings: z.record(z.any()).default({}),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Workspace = z.infer<typeof workspaceSchema>

export interface CreateWorkspaceRequest {
    name: string
    slug: string
    organizationId: string
    description?: string
    settings?: Record<string, any>
}

export interface CreateWorkspaceRequest {
    name: string
    slug: string
    description?: string
    settings?: Record<string, unknown>
}

export interface UpdateWorkspaceRequest {
    name?: string
    slug?: string
    description?: string | null
    settings?: Record<string, unknown>
}
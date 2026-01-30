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
    settings?: Record<string, any>
}

export interface UpdateWorkspaceRequest {
    name?: string
    slug?: string
    description?: string | null
    settings?: Record<string, unknown>
}

export interface WorkspaceStats {
    counts: {
        collections: number
        entries: number
        publishedEntries: number
        draftEntries: number
        apiKeys: number
        media: number
        webhooks: number
    }
    recentEntries: {
        id: string
        title: string
        status: string
        collection: {
            name: string
            slug: string
        }
        updatedAt: string
    }[]
    collections: {
        id: string
        name: string
        slug: string
        entriesCount: number
    }[]
}
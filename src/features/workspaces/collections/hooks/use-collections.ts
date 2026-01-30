import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { HttpClient } from '@/lib/axios-client'
import { toast } from 'sonner'

// Types
export interface Field {
    id: string
    name: string
    label: string
    type: string
    description?: string | null
    required: boolean
    unique: boolean
    config?: Record<string, unknown>
    validation?: Record<string, unknown>
    defaultValue?: unknown
    sortOrder: number
    hidden: boolean
    readOnly: boolean
    adminOnly: boolean
    conditions?: Record<string, unknown>
}

export interface Collection {
    id: string
    name: string
    slug: string
    description?: string | null
    icon?: string | null
    workspaceId: string
    settings?: Record<string, unknown>
    sortOrder: number
    fields?: Field[]
    createdAt: Date
    updatedAt: Date
}

export interface CreateCollectionRequest {
    name: string
    slug: string
    description?: string
    icon?: string
    settings?: {
        singleton?: boolean
        timestamps?: boolean
        softDelete?: boolean
        revisions?: boolean
        draftEnabled?: boolean
        apiAccess?: {
            read?: boolean
            create?: boolean
            update?: boolean
            delete?: boolean
        }
    }
    fields?: Omit<Field, 'id'>[]
}

export interface UpdateCollectionRequest {
    name?: string
    slug?: string
    description?: string | null
    icon?: string | null
    sortOrder?: number
    settings?: Record<string, unknown>
}

interface CollectionsResponse {
    data: Collection[]
}

interface CollectionResponse {
    data: Collection
}

// API functions
async function getCollections(orgSlug: string, workspaceSlug: string): Promise<CollectionsResponse> {
    return HttpClient.get<CollectionsResponse>(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections`
    )
}

async function getCollectionBySlug(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string
): Promise<CollectionResponse> {
    return HttpClient.get<CollectionResponse>(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}`
    )
}

async function createCollection(
    orgSlug: string,
    workspaceSlug: string,
    data: CreateCollectionRequest
): Promise<CollectionResponse> {
    return HttpClient.post<CollectionResponse>(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections`,
        data
    )
}

async function updateCollection(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    data: UpdateCollectionRequest
): Promise<CollectionResponse> {
    return HttpClient.patch<CollectionResponse>(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}`,
        data
    )
}

async function deleteCollection(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string
): Promise<void> {
    return HttpClient.delete(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}`
    )
}

// Hooks
export function useCollections(orgSlug: string, workspaceSlug: string) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['collections', orgSlug, workspaceSlug],
        queryFn: () => getCollections(orgSlug, workspaceSlug),
        enabled: !!orgSlug && !!workspaceSlug,
    })

    return {
        collections: data?.data || [],
        isLoading,
        error,
        refetch,
    }
}

export function useCollectionBySlug(orgSlug: string, workspaceSlug: string, collectionSlug: string) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['collection', orgSlug, workspaceSlug, collectionSlug],
        queryFn: () => getCollectionBySlug(orgSlug, workspaceSlug, collectionSlug),
        enabled: !!orgSlug && !!workspaceSlug && !!collectionSlug,
    })

    return {
        collection: data?.data || null,
        isLoading,
        error,
        refetch,
    }
}

export function useCreateCollection(orgSlug: string, workspaceSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateCollectionRequest) =>
            createCollection(orgSlug, workspaceSlug, data),
        onMutate: async (newCollection) => {
            const queryKey = ['collections', orgSlug, workspaceSlug]
            await queryClient.cancelQueries({ queryKey })
            const previousCollections = queryClient.getQueryData(queryKey)

            queryClient.setQueryData(queryKey, (old: CollectionsResponse | undefined) => {
                const optimisticCollection: Collection = {
                    id: 'temp-' + Date.now(),
                    workspaceId: '',
                    sortOrder: 0,
                    ...newCollection,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
                return {
                    data: [...(old?.data || []), optimisticCollection],
                }
            })

            return { previousCollections }
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['collections', orgSlug, workspaceSlug] })
            toast.success(`Collection "${response.data.name}" created successfully!`)
        },
        onError: (error: any, _newCollection, context) => {
            if (context?.previousCollections) {
                queryClient.setQueryData(
                    ['collections', orgSlug, workspaceSlug],
                    context.previousCollections
                )
            }
            const message = error?.response?.data?.message || 'Failed to create collection'
            toast.error(message)
        },
    })
}

export function useUpdateCollection(orgSlug: string, workspaceSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ collectionSlug, ...data }: UpdateCollectionRequest & { collectionSlug: string }) =>
            updateCollection(orgSlug, workspaceSlug, collectionSlug, data),
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: ['collections', orgSlug, workspaceSlug] })
            queryClient.invalidateQueries({
                queryKey: ['collection', orgSlug, workspaceSlug, variables.collectionSlug],
            })
            // If slug changed
            if (variables.collectionSlug !== response.data.slug) {
                queryClient.invalidateQueries({
                    queryKey: ['collection', orgSlug, workspaceSlug, response.data.slug],
                })
            }
            toast.success(`Collection "${response.data.name}" updated successfully!`)
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to update collection'
            toast.error(message)
        },
    })
}

export function useDeleteCollection(orgSlug: string, workspaceSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (collectionSlug: string) =>
            deleteCollection(orgSlug, workspaceSlug, collectionSlug),
        onSuccess: (_, collectionSlug) => {
            queryClient.invalidateQueries({ queryKey: ['collections', orgSlug, workspaceSlug] })
            queryClient.removeQueries({
                queryKey: ['collection', orgSlug, workspaceSlug, collectionSlug],
            })
            toast.success('Collection deleted successfully!')
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to delete collection'
            toast.error(message)
        },
    })
}

export interface CollectionActivity {
    id: string
    action: string
    entryId: string
    entryTitle: string
    createdAt: Date
}
interface CollectionActivityResponse {
    data: CollectionActivity[]
}

export function useCollectionActivity(orgSlug: string, workspaceSlug: string, collectionSlug: string) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['collection-activity', orgSlug, workspaceSlug, collectionSlug],
        queryFn: () =>
            HttpClient.get<CollectionActivityResponse>(
                `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}/activity`
            ),
        enabled: !!orgSlug && !!workspaceSlug && !!collectionSlug,
    })

    return {
        activities: data?.data || [],
        isLoading,
        error,
        refetch,
    }
}

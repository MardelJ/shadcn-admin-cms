/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { HttpClient } from '@/lib/axios-client'
import { toast } from 'sonner'

// Types
export type EntryStatus = 'DRAFT' | 'PUBLISHED' | 'CHANGED' | 'SCHEDULED' | 'ARCHIVED'

export interface Entry {
    id: string
    collectionId: string
    workspaceId: string
    data: Record<string, unknown>
    publishedData?: Record<string, unknown> | null
    status: EntryStatus
    authorId?: string | null
    publishedAt?: string | null
    scheduledAt?: string | null
    archivedAt?: string | null
    createdAt: string
    updatedAt: string
}

export interface CreateEntryRequest {
    data: Record<string, unknown>
    status?: 'DRAFT' | 'PUBLISHED'
}

export interface UpdateEntryRequest {
    data?: Record<string, unknown>
}

export interface EntryQueryParams {
    status?: EntryStatus
    limit?: number
    offset?: number
    sort?: string
}

interface EntriesResponse {
    data: Entry[]
    meta: {
        total: number
        limit: number
        offset: number
        hasMore: boolean
    }
}

interface EntryResponse {
    data: Entry
}

interface BulkOperationResult {
    success: string[]
    failed: { id: string; error: string }[]
}

// API functions
async function getEntries(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    params?: EntryQueryParams
): Promise<EntriesResponse> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    if (params?.sort) searchParams.set('sort', params.sort)

    const query = searchParams.toString()
    return HttpClient.get<EntriesResponse>(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}/entries${query ? `?${query}` : ''}`
    )
}

async function getEntryById(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    entryId: string
): Promise<EntryResponse> {
    return HttpClient.get<EntryResponse>(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}/entries/${entryId}`
    )
}

async function createEntry(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    data: CreateEntryRequest
): Promise<EntryResponse> {
    return HttpClient.post<EntryResponse>(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}/entries`,
        data
    )
}

async function updateEntry(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    entryId: string,
    data: UpdateEntryRequest
): Promise<EntryResponse> {
    return HttpClient.patch<EntryResponse>(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}/entries/${entryId}`,
        data
    )
}

async function deleteEntry(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    entryId: string
): Promise<void> {
    return HttpClient.delete(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}/entries/${entryId}`
    )
}

async function publishEntry(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    entryId: string
): Promise<EntryResponse> {
    return HttpClient.post<EntryResponse>(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}/entries/${entryId}/publish`,
        {}
    )
}

async function unpublishEntry(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    entryId: string
): Promise<EntryResponse> {
    return HttpClient.post<EntryResponse>(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}/entries/${entryId}/unpublish`,
        {}
    )
}

async function archiveEntry(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    entryId: string
): Promise<EntryResponse> {
    return HttpClient.post<EntryResponse>(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}/entries/${entryId}/archive`,
        {}
    )
}

async function restoreEntry(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    entryId: string
): Promise<EntryResponse> {
    return HttpClient.post<EntryResponse>(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}/entries/${entryId}/restore`,
        {}
    )
}

async function duplicateEntry(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    entryId: string
): Promise<EntryResponse> {
    return HttpClient.post<EntryResponse>(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}/entries/${entryId}/duplicate`,
        {}
    )
}

async function bulkPublish(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    ids: string[]
): Promise<{ data: BulkOperationResult }> {
    return HttpClient.post(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}/bulk/publish`,
        { ids }
    )
}

async function bulkUnpublish(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    ids: string[]
): Promise<{ data: BulkOperationResult }> {
    return HttpClient.post(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}/bulk/unpublish`,
        { ids }
    )
}

async function bulkDelete(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    ids: string[]
): Promise<{ data: BulkOperationResult }> {
    return HttpClient.post(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}/bulk/delete`,
        { ids }
    )
}

// Hooks
export function useEntries(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    params?: EntryQueryParams
) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['entries', orgSlug, workspaceSlug, collectionSlug, params],
        queryFn: () => getEntries(orgSlug, workspaceSlug, collectionSlug, params),
        enabled: !!orgSlug && !!workspaceSlug && !!collectionSlug,
    })

    return {
        entries: data?.data || [],
        meta: data?.meta || { total: 0, limit: 20, offset: 0, hasMore: false },
        isLoading,
        error,
        refetch,
    }
}

export function useEntryById(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    entryId: string
) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['entry', orgSlug, workspaceSlug, collectionSlug, entryId],
        queryFn: () => getEntryById(orgSlug, workspaceSlug, collectionSlug, entryId),
        enabled: !!orgSlug && !!workspaceSlug && !!collectionSlug && !!entryId,
    })

    return {
        entry: data?.data || null,
        isLoading,
        error,
        refetch,
    }
}

export function useCreateEntry(orgSlug: string, workspaceSlug: string, collectionSlug: string) {
    const queryClient = useQueryClient()
    const queryKey = ['entries', orgSlug, workspaceSlug, collectionSlug]

    return useMutation({
        mutationFn: (data: CreateEntryRequest) =>
            createEntry(orgSlug, workspaceSlug, collectionSlug, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey })
            toast.success('Entry created successfully!')
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to create entry'
            toast.error(message)
        },
    })
}

export function useUpdateEntry(orgSlug: string, workspaceSlug: string, collectionSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ entryId, ...data }: UpdateEntryRequest & { entryId: string }) =>
            updateEntry(orgSlug, workspaceSlug, collectionSlug, entryId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['entries', orgSlug, workspaceSlug, collectionSlug],
            })
            queryClient.invalidateQueries({
                queryKey: ['entry', orgSlug, workspaceSlug, collectionSlug, variables.entryId],
            })
            toast.success('Entry updated successfully!')
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to update entry'
            toast.error(message)
        },
    })
}

export function useDeleteEntry(orgSlug: string, workspaceSlug: string, collectionSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (entryId: string) =>
            deleteEntry(orgSlug, workspaceSlug, collectionSlug, entryId),
        onSuccess: (_, entryId) => {
            queryClient.invalidateQueries({
                queryKey: ['entries', orgSlug, workspaceSlug, collectionSlug],
            })
            queryClient.removeQueries({
                queryKey: ['entry', orgSlug, workspaceSlug, collectionSlug, entryId],
            })
            toast.success('Entry deleted successfully!')
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to delete entry'
            toast.error(message)
        },
    })
}

export function usePublishEntry(orgSlug: string, workspaceSlug: string, collectionSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (entryId: string) =>
            publishEntry(orgSlug, workspaceSlug, collectionSlug, entryId),
        onSuccess: (_, entryId) => {
            queryClient.invalidateQueries({
                queryKey: ['entries', orgSlug, workspaceSlug, collectionSlug],
            })
            queryClient.invalidateQueries({
                queryKey: ['entry', orgSlug, workspaceSlug, collectionSlug, entryId],
            })
            toast.success('Entry published successfully!')
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to publish entry'
            toast.error(message)
        },
    })
}

export function useUnpublishEntry(orgSlug: string, workspaceSlug: string, collectionSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (entryId: string) =>
            unpublishEntry(orgSlug, workspaceSlug, collectionSlug, entryId),
        onSuccess: (_, entryId) => {
            queryClient.invalidateQueries({
                queryKey: ['entries', orgSlug, workspaceSlug, collectionSlug],
            })
            queryClient.invalidateQueries({
                queryKey: ['entry', orgSlug, workspaceSlug, collectionSlug, entryId],
            })
            toast.success('Entry unpublished successfully!')
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to unpublish entry'
            toast.error(message)
        },
    })
}

export function useArchiveEntry(orgSlug: string, workspaceSlug: string, collectionSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (entryId: string) =>
            archiveEntry(orgSlug, workspaceSlug, collectionSlug, entryId),
        onSuccess: (_, entryId) => {
            queryClient.invalidateQueries({
                queryKey: ['entries', orgSlug, workspaceSlug, collectionSlug],
            })
            queryClient.invalidateQueries({
                queryKey: ['entry', orgSlug, workspaceSlug, collectionSlug, entryId],
            })
            toast.success('Entry archived successfully!')
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to archive entry'
            toast.error(message)
        },
    })
}

export function useRestoreEntry(orgSlug: string, workspaceSlug: string, collectionSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (entryId: string) =>
            restoreEntry(orgSlug, workspaceSlug, collectionSlug, entryId),
        onSuccess: (_, entryId) => {
            queryClient.invalidateQueries({
                queryKey: ['entries', orgSlug, workspaceSlug, collectionSlug],
            })
            queryClient.invalidateQueries({
                queryKey: ['entry', orgSlug, workspaceSlug, collectionSlug, entryId],
            })
            toast.success('Entry restored successfully!')
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to restore entry'
            toast.error(message)
        },
    })
}

export function useDuplicateEntry(orgSlug: string, workspaceSlug: string, collectionSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (entryId: string) =>
            duplicateEntry(orgSlug, workspaceSlug, collectionSlug, entryId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['entries', orgSlug, workspaceSlug, collectionSlug],
            })
            toast.success('Entry duplicated successfully!')
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to duplicate entry'
            toast.error(message)
        },
    })
}

// Bulk operations
export function useBulkPublish(orgSlug: string, workspaceSlug: string, collectionSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (ids: string[]) =>
            bulkPublish(orgSlug, workspaceSlug, collectionSlug, ids),
        onSuccess: (response) => {
            queryClient.invalidateQueries({
                queryKey: ['entries', orgSlug, workspaceSlug, collectionSlug],
            })
            const { success, failed } = response.data
            if (failed.length === 0) {
                toast.success(`${success.length} entries published successfully!`)
            } else {
                toast.warning(`${success.length} published, ${failed.length} failed`)
            }
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to bulk publish'
            toast.error(message)
        },
    })
}

export function useBulkUnpublish(orgSlug: string, workspaceSlug: string, collectionSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (ids: string[]) =>
            bulkUnpublish(orgSlug, workspaceSlug, collectionSlug, ids),
        onSuccess: (response) => {
            queryClient.invalidateQueries({
                queryKey: ['entries', orgSlug, workspaceSlug, collectionSlug],
            })
            const { success, failed } = response.data
            if (failed.length === 0) {
                toast.success(`${success.length} entries unpublished successfully!`)
            } else {
                toast.warning(`${success.length} unpublished, ${failed.length} failed`)
            }
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to bulk unpublish'
            toast.error(message)
        },
    })
}

export function useBulkDelete(orgSlug: string, workspaceSlug: string, collectionSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (ids: string[]) =>
            bulkDelete(orgSlug, workspaceSlug, collectionSlug, ids),
        onSuccess: (response) => {
            queryClient.invalidateQueries({
                queryKey: ['entries', orgSlug, workspaceSlug, collectionSlug],
            })
            const { success, failed } = response.data
            if (failed.length === 0) {
                toast.success(`${success.length} entries deleted successfully!`)
            } else {
                toast.warning(`${success.length} deleted, ${failed.length} failed`)
            }
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to bulk delete'
            toast.error(message)
        },
    })
}
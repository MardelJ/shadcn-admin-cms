import { HttpClient } from "@/lib/axios-client"
import { type Field } from "../../hooks/use-collections"
import { type CreateFieldRequest } from "../data/schema"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface UpdateFieldRequest {
    label?: string
    description?: string | null
    required?: boolean
    unique?: boolean
    config?: Record<string, unknown>
    validation?: Record<string, unknown>
    defaultValue?: unknown
    sortOrder?: number
    hidden?: boolean
    readOnly?: boolean
    adminOnly?: boolean
    conditions?: Record<string, unknown>
}

interface FieldResponse {
    data: Field
}

interface FieldsResponse {
    data: Field[]
}

// API functions
async function addField(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    data: CreateFieldRequest
): Promise<FieldResponse> {
    return HttpClient.post<FieldResponse>(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}/fields`,
        data
    )
}

async function updateField(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    fieldId: string,
    data: UpdateFieldRequest
): Promise<FieldResponse> {
    return HttpClient.patch<FieldResponse>(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}/fields/${fieldId}`,
        data
    )
}

async function deleteField(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    fieldId: string
): Promise<void> {
    return HttpClient.delete(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}/fields/${fieldId}`
    )
}

async function reorderFields(
    orgSlug: string,
    workspaceSlug: string,
    collectionSlug: string,
    fieldIds: string[]
): Promise<FieldsResponse> {
    return HttpClient.post<FieldsResponse>(
        `/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}/collections/${collectionSlug}/fields/reorder`,
        { fieldIds }
    )
}

// Hooks
export function useAddField(orgSlug: string, workspaceSlug: string, collectionSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateFieldRequest) =>
            addField(orgSlug, workspaceSlug, collectionSlug, data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({
                queryKey: ['collection', orgSlug, workspaceSlug, collectionSlug],
            })
            toast.success(`Field "${response.data.label}" added successfully!`)
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to add field'
            toast.error(message)
        },
    })
}

export function useUpdateField(orgSlug: string, workspaceSlug: string, collectionSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ fieldId, ...data }: UpdateFieldRequest & { fieldId: string }) =>
            updateField(orgSlug, workspaceSlug, collectionSlug, fieldId, data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({
                queryKey: ['collection', orgSlug, workspaceSlug, collectionSlug],
            })
            toast.success(`Field "${response.data.label}" updated successfully!`)
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to update field'
            toast.error(message)
        },
    })
}

export function useDeleteField(orgSlug: string, workspaceSlug: string, collectionSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (fieldId: string) =>
            deleteField(orgSlug, workspaceSlug, collectionSlug, fieldId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['collection', orgSlug, workspaceSlug, collectionSlug],
            })
            toast.success('Field deleted successfully!')
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to delete field'
            toast.error(message)
        },
    })
}

export function useReorderFields(orgSlug: string, workspaceSlug: string, collectionSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (fieldIds: string[]) =>
            reorderFields(orgSlug, workspaceSlug, collectionSlug, fieldIds),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['collection', orgSlug, workspaceSlug, collectionSlug],
            })
            toast.success('Fields reordered successfully!')
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to reorder fields'
            toast.error(message)
        },
    })
}

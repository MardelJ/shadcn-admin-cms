/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { HttpClient } from '@/lib/axios-client'
import { toast } from 'sonner'
import { type UpdateWorkspaceRequest, type CreateWorkspaceRequest, type Workspace } from './data/schema'

interface WorkspacesResponse {
    data: Workspace[]
}

interface WorkspaceResponse {
    data: Workspace
}

// API functions
async function getWorkspaces(orgSlug: string): Promise<WorkspacesResponse> {
    return HttpClient.get<WorkspacesResponse>(`/v1/organizations/${orgSlug}/workspaces`)
}

async function getWorkspaceBySlug(orgSlug: string, workspaceSlug: string): Promise<WorkspaceResponse> {
    return HttpClient.get<WorkspaceResponse>(`/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}`)
}

async function createWorkspace(orgSlug: string, data: CreateWorkspaceRequest): Promise<WorkspaceResponse> {
    return HttpClient.post<WorkspaceResponse>(`/v1/organizations/${orgSlug}/workspaces`, data)
}

async function updateWorkspace(orgSlug: string, workspaceSlug: string, data: UpdateWorkspaceRequest): Promise<WorkspaceResponse> {
    return HttpClient.patch<WorkspaceResponse>(`/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}`, data)
}

async function deleteWorkspace(orgSlug: string, workspaceSlug: string): Promise<void> {
    return HttpClient.delete(`/v1/organizations/${orgSlug}/workspaces/${workspaceSlug}`)
}

// Hooks
export function useWorkspaces(orgSlug: string) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['workspaces', orgSlug],
        queryFn: () => getWorkspaces(orgSlug),
        enabled: !!orgSlug,
    })

    return {
        workspaces: data?.data || [],
        isLoading,
        error,
        refetch,
    }
}

export function useWorkspaceBySlug(orgSlug: string, workspaceSlug: string) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['workspace', orgSlug, workspaceSlug],
        queryFn: () => getWorkspaceBySlug(orgSlug, workspaceSlug),
        enabled: !!orgSlug && !!workspaceSlug,
    })

    return {
        workspace: data?.data || null,
        isLoading,
        error,
        refetch,
    }
}

export function useCreateWorkspace(orgSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateWorkspaceRequest) => createWorkspace(orgSlug, data),
        onMutate: async (newWorkspace) => {
            await queryClient.cancelQueries({ queryKey: ['workspaces', orgSlug] })
            const previousWorkspaces = queryClient.getQueryData(['workspaces', orgSlug])

            queryClient.setQueryData(['workspaces', orgSlug], (old: WorkspacesResponse | undefined) => {
                const optimisticWorkspace: Workspace = {
                    id: 'temp-' + Date.now(),
                    ...newWorkspace,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
                return {
                    data: [...(old?.data || []), optimisticWorkspace],
                }
            })

            return { previousWorkspaces }
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['workspaces', orgSlug] })
            toast.success(`Workspace "${response.data.name}" created successfully!`)
        },
        onError: (error: any, _newWorkspace, context) => {
            if (context?.previousWorkspaces) {
                queryClient.setQueryData(['workspaces', orgSlug], context.previousWorkspaces)
            }
            const message = error?.response?.data?.message || 'Failed to create workspace'
            toast.error(message)
        },
    })
}

export function useUpdateWorkspace(orgSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ workspaceSlug, ...data }: UpdateWorkspaceRequest & { workspaceSlug: string }) =>
            updateWorkspace(orgSlug, workspaceSlug, data),
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: ['workspaces', orgSlug] })
            queryClient.invalidateQueries({ queryKey: ['workspace', orgSlug, variables.workspaceSlug] })
            // If slug changed, invalidate new slug too
            if (variables.workspaceSlug !== response.data.slug) {
                queryClient.invalidateQueries({ queryKey: ['workspace', orgSlug, response.data.slug] })
            }
            toast.success(`Workspace "${response.data.name}" updated successfully!`)
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to update workspace'
            toast.error(message)
        },
    })
}

export function useDeleteWorkspace(orgSlug: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (workspaceSlug: string) => deleteWorkspace(orgSlug, workspaceSlug),
        onSuccess: (_, workspaceSlug) => {
            queryClient.invalidateQueries({ queryKey: ['workspaces', orgSlug] })
            queryClient.removeQueries({ queryKey: ['workspace', orgSlug, workspaceSlug] })
            toast.success('Workspace deleted successfully!')
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to delete workspace'
            toast.error(message)
        },
    })
}
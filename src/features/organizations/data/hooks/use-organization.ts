/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { HttpClient } from '@/lib/axios-client'
import { toast } from 'sonner'

// Types
export interface Organization {
    id: string
    name: string
    slug: string
    createdAt: string
    updatedAt: string
}

export interface CreateOrganizationRequest {
    name: string
    slug: string
}

export interface UpdateOrganizationRequest {
    name?: string
    slug?: string
}

interface OrganizationsResponse {
    data: Organization[]
}

interface OrganizationResponse {
    data: Organization
}

// API functions
async function getOrganizations(): Promise<OrganizationsResponse> {
    return HttpClient.get<OrganizationsResponse>('/v1/organizations')
}

async function getOrganizationBySlug(slug: string): Promise<OrganizationResponse> {
    return HttpClient.get<OrganizationResponse>(`/v1/organizations/${slug}`)
}

async function createOrganization(data: CreateOrganizationRequest): Promise<OrganizationResponse> {
    return HttpClient.post<OrganizationResponse>('/v1/organizations', data)
}

async function updateOrganization(slug: string, data: UpdateOrganizationRequest): Promise<OrganizationResponse> {
    return HttpClient.patch<OrganizationResponse>(`/v1/organizations/${slug}`, data)
}

async function deleteOrganization(slug: string): Promise<void> {
    return HttpClient.delete(`/v1/organizations/${slug}`)
}

// Hooks
export function useOrganizations() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['organizations'],
        queryFn: getOrganizations,
    })

    return {
        organizations: data?.data || [],
        isLoading,
        error,
        refetch,
    }
}

export function useOrganizationBySlug(slug: string) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['organization', slug],
        queryFn: () => getOrganizationBySlug(slug),
        enabled: !!slug,
    })

    return {
        organization: data?.data || null,
        isLoading,
        error,
        refetch,
    }
}

export function useCreateOrganization() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createOrganization,
        onMutate: async (newOrg) => {
            await queryClient.cancelQueries({ queryKey: ['organizations'] })
            const previousOrgs = queryClient.getQueryData(['organizations'])

            queryClient.setQueryData(['organizations'], (old: OrganizationsResponse | undefined) => {
                const optimisticOrg: Organization = {
                    id: 'temp-' + Date.now(),
                    ...newOrg,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }
                return {
                    data: [...(old?.data || []), optimisticOrg],
                }
            })

            return { previousOrgs }
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] })
            toast.success(`Organization "${response.data.name}" created successfully!`)
        },
        onError: (error: any, _newOrg, context) => {
            if (context?.previousOrgs) {
                queryClient.setQueryData(['organizations'], context.previousOrgs)
            }
            const message = error?.response?.data?.message || 'Failed to create organization'
            toast.error(message)
        },
    })
}

export function useUpdateOrganization() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ slug, ...data }: UpdateOrganizationRequest & { slug: string }) =>
            updateOrganization(slug, data),
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] })
            queryClient.invalidateQueries({ queryKey: ['organization', variables.slug] })
            // If slug changed, also invalidate new slug
            if (variables.slug !== response.data.slug) {
                queryClient.invalidateQueries({ queryKey: ['organization', response.data.slug] })
            }
            toast.success(`Organization "${response.data.name}" updated successfully!`)
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to update organization'
            toast.error(message)
        },
    })
}

export function useDeleteOrganization() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (slug: string) => deleteOrganization(slug),
        onSuccess: (_, slug) => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] })
            queryClient.removeQueries({ queryKey: ['organization', slug] })
            toast.success('Organization deleted successfully!')
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to delete organization'
            toast.error(message)
        },
    })
}
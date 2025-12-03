import { createFileRoute } from '@tanstack/react-router'
import { HttpClient } from '@/lib/axios-client'
import type { Organization } from '@/features/organizations/data/schema'
import { OrganizationLayout } from '@/features/organizations/organization-layout'

interface OrganizationResponse {
    data: Organization
}

export const Route = createFileRoute('/_authenticated/organizations/$slug')<{
    organization: OrganizationResponse
}>({
    loader: async ({ params, context }) => {
        const organization = await context.queryClient.ensureQueryData({
            queryKey: ['organization', params.slug],
            queryFn: () =>
                HttpClient.get<OrganizationResponse>(`/v1/organizations/ufsa`),
        })
        return { organization }
    },
    component: OrganizationLayout,
})


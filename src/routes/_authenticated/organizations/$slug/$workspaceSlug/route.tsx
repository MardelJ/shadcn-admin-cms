import { createFileRoute } from '@tanstack/react-router'
import { HttpClient } from '@/lib/axios-client'
import { type Workspace } from '@/features/workspaces/data/schema'
import { WorkspaceLayout } from '@/features/organizations/workspaces/workspace-layout'

interface WorkspaceResponse {
    data: Workspace
}

export const Route = createFileRoute(
    '/_authenticated/organizations/$slug/$workspaceSlug'
)({
    loader: async ({ params, context }) => {
        const workspace = await context.queryClient.ensureQueryData({
            queryKey: ['workspace', params.slug, params.workspaceSlug],
            queryFn: () =>
                HttpClient.get<WorkspaceResponse>(
                    `/v1/organizations/${params.slug}/workspaces/${params.workspaceSlug}`
                ),
        })
        return { workspace }
    },
    component: WorkspaceLayout,
})
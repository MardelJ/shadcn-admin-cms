import { WorkspaceOverview } from '@/features/workspaces/WorkspaceOverview'
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute(
    '/_authenticated/organizations/$slug/$workspaceSlug/'
)({
    component: WorkspaceOverview,
})
import { WorkspaceCollections } from '@/features/workspaces/collections/workspace-collections'
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute(
    '/_authenticated/organizations/$slug/$workspaceSlug/collections/'
)({
    component: WorkspaceCollections,
})
import CollectionActivity from '@/features/Collections/collection-activity'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
    '/_authenticated/organizations/$slug/$workspaceSlug/collections/$collectionSlug/activity',
)({
    component: CollectionActivity,
})
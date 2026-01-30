import CollectionFields from '@/features/fields/collection-fields'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
    '/_authenticated/organizations/$slug/$workspaceSlug/collections/$collectionSlug/fields',
)({
    component: CollectionFields,
})
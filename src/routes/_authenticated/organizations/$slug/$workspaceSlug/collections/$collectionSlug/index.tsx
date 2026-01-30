import CollectionEntries from '@/features/entries/collection-entries'
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute(
    '/_authenticated/organizations/$slug/$workspaceSlug/collections/$collectionSlug/'
)({

    component: CollectionEntries,
})

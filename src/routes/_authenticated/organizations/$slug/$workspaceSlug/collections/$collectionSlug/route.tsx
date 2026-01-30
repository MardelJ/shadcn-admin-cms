import CollectionLayout from '@/features/Collections/CollectionLayout'
import { type Collection } from '@/features/workspaces/collections/data/schema'
import { HttpClient } from '@/lib/axios-client'
import { createFileRoute } from '@tanstack/react-router'

interface CollectionResponse {
    data: Collection
}
export const Route = createFileRoute(
    '/_authenticated/organizations/$slug/$workspaceSlug/collections/$collectionSlug',
)({
    loader: async ({ params }) => {
        const collection = await HttpClient.get<CollectionResponse>(
            `/v1/organizations/${params.slug}/workspaces/${params.workspaceSlug}/collections/${params.collectionSlug}`
        )
        return { collection }
    },
    component: CollectionLayout,
})

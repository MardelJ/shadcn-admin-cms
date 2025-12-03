import { useParams } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CollectionsProvider, useCollectionsContext } from './components/collections-provider'
import { CollectionsTable } from './components/collections-table'
import { CollectionsDialogs } from './components/collections-dialogs'


function CollectionsContent() {
    const { setOpen } = useCollectionsContext()
    const { slug, workspaceSlug } = useParams({
        from: '/_authenticated/organizations/$slug/$workspaceSlug/collections/',
    })

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='text-lg font-medium'>Collections</h3>
                    <p className='text-muted-foreground text-sm'>
                        Define content types for your workspace.
                    </p>
                </div>
                <Button onClick={() => setOpen('create')}>
                    <Plus className='mr-2 h-4 w-4' />
                    Create Collection
                </Button>
            </div>
            <CollectionsTable
                organizationSlug={slug}
                workspaceSlug={workspaceSlug}
            />
            <CollectionsDialogs
                organizationSlug={slug}
                workspaceSlug={workspaceSlug}
            />
        </div>
    )
}

export function WorkspaceCollections() {
    return (
        <CollectionsProvider>
            <CollectionsContent />
        </CollectionsProvider>
    )
}
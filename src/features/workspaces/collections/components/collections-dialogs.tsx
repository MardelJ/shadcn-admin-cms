import { ConfirmDialog } from '@/components/confirm-dialog'
import { CollectionMutateDialog } from './collection-mutate-dialog'
import { useCollectionsContext } from './collections-provider'
import { useDeleteCollection } from '../hooks/use-collections'

interface CollectionsDialogsProps {
    organizationSlug: string
    workspaceSlug: string
}

export function CollectionsDialogs({
    organizationSlug,
    workspaceSlug,
}: CollectionsDialogsProps) {
    const { open, setOpen, currentRow, setCurrentRow } = useCollectionsContext()
    const deleteCollection = useDeleteCollection(organizationSlug, workspaceSlug)

    return (
        <>
            <CollectionMutateDialog
                key='collection-create'
                isOpen={open === 'create'}
                onOpenChange={() => setOpen('create')}
                organizationSlug={organizationSlug}
                workspaceSlug={workspaceSlug}
            />

            {currentRow && (
                <>
                    <CollectionMutateDialog
                        key={`collection-update-${currentRow.id}`}
                        isOpen={open === 'update'}
                        onOpenChange={() => {
                            setOpen('update')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        organizationSlug={organizationSlug}
                        workspaceSlug={workspaceSlug}
                        currentRow={currentRow}
                    />

                    <ConfirmDialog
                        key='collection-delete'
                        destructive
                        open={open === 'delete'}
                        onOpenChange={() => {
                            setOpen('delete')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        handleConfirm={() => {
                            deleteCollection.mutate(currentRow.id, {
                                onSuccess: () => {
                                    setOpen(null)
                                    setTimeout(() => {
                                        setCurrentRow(null)
                                    }, 500)
                                },
                            })
                        }}
                        className='max-w-md'
                        title={`Delete collection: ${currentRow.name}?`}
                        desc={
                            <>
                                You are about to delete the collection{' '}
                                <strong>{currentRow.name}</strong> (@{currentRow.slug}). <br />
                                This will also delete all entries in this collection. This
                                action cannot be undone.
                            </>
                        }
                        confirmText='Delete'
                    />
                </>
            )}
        </>
    )
}
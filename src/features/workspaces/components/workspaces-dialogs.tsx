import { useLoaderData } from '@tanstack/react-router'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { WorkspaceMutateDialog } from './workspace-mutate-dialog'
import { useWorkspacesContext } from '@/features/organizations/components/workspace/workspaces-provider'
import { useDeleteWorkspace } from '../hooks.use-workspace'

interface WorkspacesDialogsProps {
    organizationSlug: string
}

export function WorkspacesDialogs({ organizationSlug }: WorkspacesDialogsProps) {
    const { open, setOpen, currentRow, setCurrentRow } = useWorkspacesContext()
    const deleteWorkspace = useDeleteWorkspace()

    const { organization } = useLoaderData({
        from: '/_authenticated/organizations/$slug',
    })

    return (
        <>
            <WorkspaceMutateDialog
                key='workspace-create'
                isOpen={open === 'create'}
                onOpenChange={() => setOpen('create')}
            />

            {currentRow && (
                <>
                    <WorkspaceMutateDialog
                        key={`workspace-update-${currentRow.id}`}
                        isOpen={open === 'update'}
                        onOpenChange={() => {
                            setOpen('update')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        currentRow={currentRow}
                    />

                    <ConfirmDialog
                        key='workspace-delete'
                        destructive
                        open={open === 'delete'}
                        onOpenChange={() => {
                            setOpen('delete')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        handleConfirm={() => {
                            deleteWorkspace.mutate(
                                {
                                    organizationId: organization.data.id,
                                    id: currentRow.id,
                                },
                                {
                                    onSuccess: () => {
                                        setOpen(null)
                                        setTimeout(() => {
                                            setCurrentRow(null)
                                        }, 500)
                                    },
                                }
                            )
                        }}
                        className='max-w-md'
                        title={`Delete workspace: ${currentRow.name}?`}
                        desc={
                            <>
                                You are about to delete the workspace{' '}
                                <strong>{currentRow.name}</strong> (@{currentRow.slug}). <br />
                                This action cannot be undone.
                            </>
                        }
                        confirmText='Delete'
                    />
                </>
            )}
        </>
    )
}
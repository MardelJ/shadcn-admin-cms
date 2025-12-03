import { ConfirmDialog } from '@/components/confirm-dialog'
import { useOrganizationsContext } from './organizations-provider'
import { OrganizationMutateDialog } from './organization-mutate-dialogs'


export function OrganizationsDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = useOrganizationsContext()
    // const deleteOrganization = useDeleteOrganization()

    return (
        <>
            <OrganizationMutateDialog
                key='organization-create'
                isOpen={open === 'create'}
                onOpenChange={() => setOpen('create')}
            />

            {/* {currentRow && (
                <>
                    <OrganizationMutateDialog
                        key={`organization-update-${currentRow.id}`}
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
                        key='organization-delete'
                        destructive
                        open={open === 'delete'}
                        onOpenChange={() => {
                            setOpen('delete')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        handleConfirm={() => {
                            deleteOrganization.mutate(currentRow.id, {
                                onSuccess: () => {
                                    setOpen(null)
                                    setTimeout(() => {
                                        setCurrentRow(null)
                                    }, 500)
                                },
                            })
                        }}
                        className='max-w-md'
                        title={`Delete this organization: ${currentRow.name}?`}
                        desc={
                            <>
                                You are about to delete the organization{' '}
                                <strong>{currentRow.name}</strong> (@{currentRow.slug}). <br />
                                This action cannot be undone.
                            </>
                        }
                        confirmText='Delete'
                    />
                </>
            )} */}
        </>
    )
}
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { type Field } from '@/features/workspaces/collections/fields/data/schema'


interface DeleteFieldDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    field: Field
    onConfirm: () => void
}

export function DeleteFieldDialog({
    open,
    onOpenChange,
    field,
    onConfirm,
}: DeleteFieldDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Field</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the field "{field.label}" ({field.name})?
                        This will remove the field from all entries. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className='bg-red-600 hover:bg-red-700'
                    >
                        Delete Field
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
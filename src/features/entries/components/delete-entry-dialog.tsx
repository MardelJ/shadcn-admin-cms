// components/entries/delete-entry-dialog.tsx

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
import type { Entry } from '../hooks/use-entries'

interface DeleteEntryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    entry: Entry
    onConfirm: () => void
}

export function DeleteEntryDialog({
    open,
    onOpenChange,
    entry,
    onConfirm,
}: DeleteEntryDialogProps) {
    const title = (entry.data as any)?.title || (entry.data as any)?.name || 'this entry'

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete "{title}"? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className='bg-red-600 hover:bg-red-700'
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
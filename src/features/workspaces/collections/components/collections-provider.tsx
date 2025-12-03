import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Collection } from '../data/schema'

type CollectionsDialogType = 'create' | 'update' | 'delete'

type CollectionsContextType = {
    open: CollectionsDialogType | null
    setOpen: (str: CollectionsDialogType | null) => void
    currentRow: Collection | null
    setCurrentRow: React.Dispatch<React.SetStateAction<Collection | null>>
}

const CollectionsContext = React.createContext<CollectionsContextType | null>(
    null
)

export function CollectionsProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [open, setOpen] = useDialogState<CollectionsDialogType>(null)
    const [currentRow, setCurrentRow] = useState<Collection | null>(null)

    return (
        <CollectionsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </CollectionsContext>
    )
}

export const useCollectionsContext = () => {
    const collectionsContext = React.useContext(CollectionsContext)

    if (!collectionsContext) {
        throw new Error(
            'useCollectionsContext has to be used within <CollectionsProvider>'
        )
    }

    return collectionsContext
}
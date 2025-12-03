import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Organization } from '../data/schema'

type OrganizationsDialogType = 'create' | 'update' | 'delete'

type OrganizationsContextType = {
    open: OrganizationsDialogType | null
    setOpen: (str: OrganizationsDialogType | null) => void
    currentRow: Organization | null
    setCurrentRow: React.Dispatch<React.SetStateAction<Organization | null>>
}

const OrganizationsContext = React.createContext<OrganizationsContextType | null>(null)

export function OrganizationsProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useDialogState<OrganizationsDialogType>(null)
    const [currentRow, setCurrentRow] = useState<Organization | null>(null)

    return (
        <OrganizationsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </OrganizationsContext>
    )
}

export const useOrganizationsContext = () => {
    const organizationsContext = React.useContext(OrganizationsContext)

    if (!organizationsContext) {
        throw new Error('useOrganizationsContext has to be used within <OrganizationsProvider>')
    }

    return organizationsContext
}
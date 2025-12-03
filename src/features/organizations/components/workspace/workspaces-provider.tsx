import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Workspace } from '@/features/workspaces/data/schema'


type WorkspacesDialogType = 'create' | 'update' | 'delete'

type WorkspacesContextType = {
    open: WorkspacesDialogType | null
    setOpen: (str: WorkspacesDialogType | null) => void
    currentRow: Workspace | null
    setCurrentRow: React.Dispatch<React.SetStateAction<Workspace | null>>
}

const WorkspacesContext = React.createContext<WorkspacesContextType | null>(null)

export function WorkspacesProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useDialogState<WorkspacesDialogType>(null)
    const [currentRow, setCurrentRow] = useState<Workspace | null>(null)

    return (
        <WorkspacesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </WorkspacesContext>
    )
}

export const useWorkspacesContext = () => {
    const workspacesContext = React.useContext(WorkspacesContext)

    if (!workspacesContext) {
        throw new Error(
            'useWorkspacesContext has to be used within <WorkspacesProvider>'
        )
    }

    return workspacesContext
}
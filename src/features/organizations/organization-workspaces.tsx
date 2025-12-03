import { useLoaderData, useParams } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
// import { WorkspacesTable } from './workspaces/workspaces-table'
// import { WorkspacesDialogs } from './workspaces/workspaces-dialogs'
import { useWorkspacesContext, WorkspacesProvider } from './components/workspace/workspaces-provider'
import { WorkspacesDialogs } from '../workspaces/components/workspaces-dialogs'
import { WorkspacesTable } from '../workspaces/components/workspaces-table'

function WorkspacesContent() {
    const { setOpen } = useWorkspacesContext()
    const { slug } = useParams({ from: '/_authenticated/organizations/$slug/' })
    const { organization } = useLoaderData({
        from: '/_authenticated/organizations/$slug'
    })
    const organizationId = organization.data.id
    const organizationName = organization.data.name

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='text-lg font-medium'>Workspaces</h3>
                    <p className='text-muted-foreground text-sm'>
                        Manage workspaces for this organization.
                    </p>
                </div>
                <Button onClick={() => setOpen('create')}>
                    <Plus className='mr-2 h-4 w-4' />
                    Create Workspace

                </Button>
            </div>

            <WorkspacesTable organizationSlug={slug} />
            <WorkspacesDialogs organizationSlug={slug} />

        </div>
    )
}

export function OrganizationWorkspaces() {
    return (
        <WorkspacesProvider>
            <WorkspacesContent />
        </WorkspacesProvider>
    )
}
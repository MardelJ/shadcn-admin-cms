import { OrganizationWorkspaces } from '@/features/organizations/organization-workspaces'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organizations/$slug/')({
    component: OrganizationWorkspaces,
})

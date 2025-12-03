import { OrganizationMembers } from '@/features/organizations/organization-members'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/organizations/$slug/members'
)({
  component: OrganizationMembers,
})

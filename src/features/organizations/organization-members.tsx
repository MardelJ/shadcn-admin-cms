import { useParams } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { MembersProvider } from './members/members-provider'
import { MembersTable } from './members/members-table'
import { MembersDialogs } from './members/members-dialogs'
import { useMembersContext } from './members/members-provider'

function MembersContent() {
    const { setOpen } = useMembersContext()
    const { slug } = useParams({
        from: '/_authenticated/organizations/$slug/members'
    })

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='text-lg font-medium'>Members</h3>
                    <p className='text-muted-foreground text-sm'>
                        Manage members and invitations for this organization.
                    </p>
                </div>
                <Button onClick={() => setOpen('invite')}>
                    <UserPlus className='mr-2 h-4 w-4' />
                    Invite Member
                </Button>
            </div>
            <MembersTable organizationSlug={slug} />
            <MembersDialogs organizationSlug={slug} />
        </div>
    )
}

export function OrganizationMembers() {
    return (
        <MembersProvider>
            <MembersContent />
        </MembersProvider>
    )
}
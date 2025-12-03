import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOrganizationsContext } from './organizations-provider'

export function OrganizationsPrimaryButtons() {
    const { setOpen } = useOrganizationsContext()

    return (
        <div className='flex gap-2'>
            <Button className='space-x-1' onClick={() => setOpen('create')}>
                <span>Create Organization</span> <Plus size={18} />
            </Button>
        </div>
    )
}
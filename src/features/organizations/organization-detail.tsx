// features/organizations/organization-detail.tsx
import { Link, useLoaderData, useParams } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Search } from '@/components/search'
import { ConfigDrawer } from '@/components/config-drawer'


export function OrganizationDetail() {
    // Get the slug from URL params
    const { slug } = useParams({ from: '/_authenticated/organizations/$slug' })

    // Get the loaded data (if using loader)
    const { organization } = useLoaderData({
        from: '/_authenticated/organizations/$slug'
    })

    return (
        <>
            <Header>
                <Search />
                <div className='ms-auto flex items-center gap-4'>
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <div className='flex items-center gap-4'>
                    <Link to='/organizations'>
                        <Button variant='outline' size='icon'>
                            <ArrowLeft className='h-4 w-4' />
                        </Button>
                    </Link>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>
                            {organization.data.name}
                        </h2>
                        <p className='text-muted-foreground'>@{slug}</p>
                    </div>
                </div>

                <div className='rounded-lg border p-6'>
                    <pre>{JSON.stringify(organization.data, null, 2)}</pre>
                </div>
            </Main>
        </>
    )
}
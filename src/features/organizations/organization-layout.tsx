import { Link, Outlet, useLoaderData, useParams, useMatchRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft } from 'lucide-react'
import { TopNav } from '@/components/layout/top-nav'

const topNav = [
    {
        title: 'Overview',
        href: '/organizations/$slug',
        isActive: true,
    },
]

export function OrganizationLayout() {
    const { slug } = useParams({ from: '/_authenticated/organizations/$slug' })
    const { organization } = useLoaderData({
        from: '/_authenticated/organizations/$slug'
    })
    const matchRoute = useMatchRoute()

    // Determine active tab based on current route
    const isWorkspacesActive = matchRoute({ to: '/organizations/$slug', fuzzy: false })
    const isMembersActive = matchRoute({ to: '/organizations/$slug/members' })

    return (
        <>
            <Header>
                <TopNav links={topNav} />
                <div className='ms-auto flex items-center space-x-4'>
                    <ThemeSwitch />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main>
                <div className='mb-4 flex items-center gap-4'>
                    <Link to='/organizations'>
                        <Button variant='outline' size='icon'>
                            <ArrowLeft className='h-4 w-4' />
                        </Button>
                    </Link>
                    <div className='flex-1'>
                        <h1 className='text-2xl font-bold tracking-tight'>
                            {organization.data.name}
                        </h1>
                        <p className='text-muted-foreground'>@{slug}</p>
                    </div>
                </div>

                <Tabs value={isMembersActive ? 'members' : 'workspaces'} className='space-y-4'>
                    <div className='w-full overflow-x-auto pb-2'>
                        <TabsList>
                            <Link to='/organizations/$slug' params={{ slug }}>
                                <TabsTrigger value='workspaces'>Workspaces</TabsTrigger>
                            </Link>
                            <Link to='/organizations/$slug/members' params={{ slug }}>
                                <TabsTrigger value='members'>Members</TabsTrigger>
                            </Link>
                        </TabsList>
                    </div>

                    {/* Outlet renders the child routes */}
                    <Outlet />
                </Tabs>
            </Main>
        </>
    )
}
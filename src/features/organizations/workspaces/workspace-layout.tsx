import { Link, Outlet, useLoaderData, useParams, useMatchRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Database, Key, LayoutGrid } from 'lucide-react'

export function WorkspaceLayout() {
    const { slug, workspaceSlug } = useParams({
        from: '/_authenticated/organizations/$slug/$workspaceSlug',
    })
    const { workspace } = useLoaderData({
        from: '/_authenticated/organizations/$slug/$workspaceSlug',
    })
    const matchRoute = useMatchRoute()

    const isOverviewActive = matchRoute({
        to: '/organizations/$slug/$workspaceSlug',
        fuzzy: false,
    })
    const isCollectionsActive = matchRoute({
        to: '/organizations/$slug/$workspaceSlug/collections',
        fuzzy: true,
    })
    const isApiKeysActive = matchRoute({
        to: '/organizations/$slug/$workspaceSlug/api-keys',
    })

    const activeTab = isCollectionsActive
        ? 'collections'
        : isApiKeysActive
            ? 'api-keys'
            : 'overview'

    return (
        <>

            <Main>
                <div className='mb-4 flex items-center gap-4'>
                    <Link to='/organizations/$slug' params={{ slug }}>
                        <Button variant='outline' size='icon'>
                            <ArrowLeft className='h-4 w-4' />
                        </Button>
                    </Link>
                    <div className='flex-1'>
                        <h1 className='text-2xl font-bold tracking-tight'>
                            {workspace.data.name}
                        </h1>
                        <p className='text-muted-foreground'>
                            @{workspaceSlug}
                            {workspace.data.description && (
                                <span className='ml-2'>· {workspace.data.description}</span>
                            )}
                        </p>
                    </div>
                </div>

                <Tabs value={activeTab} className='space-y-4'>
                    <div className='w-full overflow-x-auto pb-2'>
                        <TabsList>
                            <Link
                                to='/organizations/$slug/$workspaceSlug'
                                params={{ slug, workspaceSlug }}
                            >
                                <TabsTrigger value='overview'>
                                    <LayoutGrid className='mr-2 h-4 w-4' />
                                    Overview
                                </TabsTrigger>
                            </Link>
                            <Link
                                to='/organizations/$slug/$workspaceSlug/collections'
                                params={{ slug, workspaceSlug }}
                            >
                                <TabsTrigger value='collections'>
                                    <Database className='mr-2 h-4 w-4' />
                                    Collections
                                </TabsTrigger>
                            </Link>
                            <Link
                                to='/organizations/$slug/$workspaceSlug/api-keys'
                                params={{ slug, workspaceSlug }}
                            >
                                <TabsTrigger value='api-keys'>
                                    <Key className='mr-2 h-4 w-4' />
                                    API Keys
                                </TabsTrigger>
                            </Link>
                        </TabsList>
                    </div>

                    <Outlet />
                </Tabs>
            </Main>
        </>
    )
}
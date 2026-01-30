import { Outlet, Link, useParams, useMatchRoute, useLoaderData, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, FileText, Columns3, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Main } from '@/components/layout/main'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useEffect } from 'react'


function CollectionLayout() {
    const { slug, workspaceSlug, collectionSlug } = useParams({
        from: '/_authenticated/organizations/$slug/$workspaceSlug/collections/$collectionSlug',
    })
    const { collection } = useLoaderData({
        from: '/_authenticated/organizations/$slug/$workspaceSlug/collections/$collectionSlug',
    })
    const navigate = useNavigate()
    const matchRoute = useMatchRoute()

    const isEntriesActive = matchRoute({
        to: '/organizations/$slug/$workspaceSlug/collections/$collectionSlug',
        fuzzy: false,
    })
    const isFieldsActive = matchRoute({
        to: '/organizations/$slug/$workspaceSlug/collections/$collectionSlug/fields',
        fuzzy: true,
    })
    const isActivityActive = matchRoute({
        to: '/organizations/$slug/$workspaceSlug/collections/$collectionSlug/activity',
        fuzzy: true,
    })

    const activeTab = isFieldsActive
        ? 'fields'
        : isActivityActive
            ? 'activity'
            : 'entries'

    const fieldsCount = collection.data.fields?.length ?? 0

    // Redirect to fields tab if no fields exist and user is on entries tab
    useEffect(() => {
        if (fieldsCount === 0 && isEntriesActive) {
            navigate({
                to: '/organizations/$slug/$workspaceSlug/collections/$collectionSlug/fields',
                params: { slug, workspaceSlug, collectionSlug }
            })
        }
    }, [fieldsCount, isEntriesActive, navigate, slug, workspaceSlug, collectionSlug])

    const hasFields = fieldsCount > 0

    return (
        <Main>
            {/* Header */}
            <div className='mb-6'>
                <div className='flex items-center gap-4 mb-2'>
                    <Link
                        to='/organizations/$slug/$workspaceSlug/collections'
                        params={{ slug, workspaceSlug }}
                    >
                        <Button variant='outline' size='icon'>
                            <ArrowLeft className='h-4 w-4' />
                        </Button>
                    </Link>
                    <div className='flex-1'>
                        <div className='flex items-center gap-3'>
                            {collection.data.icon && (
                                <span className='text-2xl'>{collection.data.icon}</span>
                            )}
                            <h1 className='text-2xl font-bold tracking-tight'>
                                {collection.data.name}
                            </h1>
                            {collection.data.settings?.singleton && (
                                <Badge variant='secondary'>Singleton</Badge>
                            )}
                        </div>
                        <p className='text-muted-foreground'>
                            @{collectionSlug}
                            {collection.data.description && (
                                <span className='ml-2'>· {collection.data.description}</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} className='space-y-4'>
                <div className='flex items-center justify-between'>
                    <TabsList>
                        {hasFields ? (
                            <Link
                                to='/organizations/$slug/$workspaceSlug/collections/$collectionSlug'
                                params={{ slug, workspaceSlug, collectionSlug }}
                            >
                                <TabsTrigger value='entries'>
                                    <FileText className='mr-2 h-4 w-4' />
                                    Entries
                                </TabsTrigger>
                            </Link>
                        ) : (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className='cursor-not-allowed'>
                                            <TabsTrigger
                                                value='entries'
                                                disabled
                                                className='cursor-not-allowed'
                                            >
                                                <FileText className='mr-2 h-4 w-4' />
                                                Entries
                                            </TabsTrigger>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Add fields first to create entries</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        <Link
                            to='/organizations/$slug/$workspaceSlug/collections/$collectionSlug/fields'
                            params={{ slug, workspaceSlug, collectionSlug }}
                        >
                            <TabsTrigger value='fields'>
                                <Columns3 className='mr-2 h-4 w-4' />
                                Fields
                                <Badge variant='secondary' className='ml-2'>
                                    {fieldsCount}
                                </Badge>
                            </TabsTrigger>
                        </Link>

                        <Link
                            to='/organizations/$slug/$workspaceSlug/collections/$collectionSlug/activity'
                            params={{ slug, workspaceSlug, collectionSlug }}
                        >
                            <TabsTrigger value='activity'>
                                <Activity className='mr-2 h-4 w-4' />
                                Activity
                            </TabsTrigger>
                        </Link>
                    </TabsList>
                </div>

                <Outlet />
            </Tabs>
        </Main>
    )
}


export default CollectionLayout
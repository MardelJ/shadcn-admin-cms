/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from '@tanstack/react-router'
import { Activity, Plus, Pencil, Trash, CheckCircle2, Archive } from 'lucide-react'

import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'
import { useCollectionActivity } from '../workspaces/collections/hooks/use-collections'

function CollectionActivity() {
    const { slug, workspaceSlug, collectionSlug } = useParams({
        from: '/_authenticated/organizations/$slug/$workspaceSlug/collections/$collectionSlug/activity',
    })

    const { activities, isLoading } = useCollectionActivity(slug, workspaceSlug, collectionSlug)

    const getActivityIcon = (action: string) => {
        switch (action) {
            case 'created':
                return <Plus className='h-4 w-4 text-green-600' />
            case 'updated':
                return <Pencil className='h-4 w-4 text-blue-600' />
            case 'deleted':
                return <Trash className='h-4 w-4 text-red-600' />
            case 'published':
                return <CheckCircle2 className='h-4 w-4 text-green-600' />
            case 'unpublished':
                return <Pencil className='h-4 w-4 text-yellow-600' />
            case 'archived':
                return <Archive className='h-4 w-4 text-gray-600' />
            default:
                return <Activity className='h-4 w-4 text-muted-foreground' />
        }
    }

    const getActivityMessage = (activity: any) => {
        const title = activity.entryTitle || 'Entry'
        switch (activity.action) {
            case 'created':
                return `Created "${title}"`
            case 'updated':
                return `Updated "${title}"`
            case 'deleted':
                return `Deleted "${title}"`
            case 'published':
                return `Published "${title}"`
            case 'unpublished':
                return `Unpublished "${title}"`
            case 'archived':
                return `Archived "${title}"`
            default:
                return `${activity.action} "${title}"`
        }
    }

    if (isLoading) {
        return (
            <div className='space-y-4'>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className='flex items-start gap-4'>
                        <Skeleton className='h-8 w-8 rounded-full' />
                        <div className='flex-1 space-y-1'>
                            <Skeleton className='h-4 w-3/4' />
                            <Skeleton className='h-3 w-1/4' />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (!activities || activities.length === 0) {
        return (
            <div className='text-center py-12 border rounded-lg'>
                <Activity className='h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50' />
                <h3 className='text-lg font-medium'>No activity yet</h3>
                <p className='text-muted-foreground'>
                    Activity will appear here when entries are created, updated, or deleted.
                </p>
            </div>
        )
    }

    return (
        <div className='space-y-1'>
            {activities.map((activity: any, index: number) => (
                <div
                    key={activity.id || index}
                    className='flex items-start gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors'
                >
                    <div className='rounded-full bg-muted p-2'>
                        {getActivityIcon(activity.action)}
                    </div>
                    <div className='flex-1 min-w-0'>
                        <p className='font-medium'>{getActivityMessage(activity)}</p>
                        <p className='text-sm text-muted-foreground'>
                            {formatDistanceToNow(new Date(activity.createdAt), {
                                addSuffix: true,
                                locale: pt,
                            })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default CollectionActivity
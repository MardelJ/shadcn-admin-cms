import { useLoaderData } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, FileText, Key, Calendar } from 'lucide-react'
import { formatDate } from 'date-fns'


export function WorkspaceOverview() {
    const { workspace } = useLoaderData({
        from: '/_authenticated/organizations/$slug/$workspaceSlug',
    })

    const stats = [
        {
            title: 'Collections',
            value: '0', // You'll fetch this from API
            icon: Database,
            description: 'Content types',
        },
        {
            title: 'Entries',
            value: '0', // You'll fetch this from API
            icon: FileText,
            description: 'Total entries',
        },
        {
            title: 'API Keys',
            value: '0', // You'll fetch this from API
            icon: Key,
            description: 'Active keys',
        },
    ]

    return (
        <div className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-3'>
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>
                                {stat.title}
                            </CardTitle>
                            <stat.icon className='text-muted-foreground h-4 w-4' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>{stat.value}</div>
                            <p className='text-muted-foreground text-xs'>
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Workspace Details</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm'>
                        <Calendar className='text-muted-foreground h-4 w-4' />
                        <span className='text-muted-foreground'>Created:</span>
                        <span>{formatDate(workspace.data.createdAt, 'dd-MM-yyyy')}</span>
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                        <Calendar className='text-muted-foreground h-4 w-4' />
                        <span className='text-muted-foreground'>Last Updated:</span>
                        <span>{formatDate(workspace.data.updatedAt, 'dd-MM-yyyy')}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
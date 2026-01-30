import { Link, useLoaderData, useParams } from '@tanstack/react-router'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import {
    Database,
    FileText,
    Key,
    Calendar,
    Image,
    Webhook,
    Clock,
    ArrowRight,
    CheckCircle2,
    PenLine,
} from 'lucide-react'
import { formatDate, formatDistanceToNow } from 'date-fns'
import { useWorkspaceStats } from './hooks.use-workspace'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { pt } from 'date-fns/locale'


export function WorkspaceOverview() {
    const { slug: orgSlug, workspaceSlug } = useParams({
        from: '/_authenticated/organizations/$slug/$workspaceSlug',
    })

    const { workspace } = useLoaderData({
        from: '/_authenticated/organizations/$slug/$workspaceSlug',
    })

    const { stats, isLoading: statsLoading } = useWorkspaceStats(orgSlug, workspaceSlug)

    const statCards = [
        {
            title: 'Collections',
            value: stats?.counts.collections ?? 0,
            icon: Database,
            description: 'Content types',
            href: `/${orgSlug}/${workspaceSlug}/collections`,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Entries',
            value: stats?.counts.entries ?? 0,
            icon: FileText,
            description: `${stats?.counts.publishedEntries ?? 0} published, ${stats?.counts.draftEntries ?? 0} drafts`,
            href: `/${orgSlug}/${workspaceSlug}/entries`,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'API Keys',
            value: stats?.counts.apiKeys ?? 0,
            icon: Key,
            description: 'Active keys',
            href: `/${orgSlug}/${workspaceSlug}/api-keys`,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            title: 'Media',
            value: stats?.counts.media ?? 0,
            icon: Image,
            description: 'Uploaded files',
            href: `/${orgSlug}/${workspaceSlug}/media`,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: 'Webhooks',
            value: stats?.counts.webhooks ?? 0,
            icon: Webhook,
            description: 'Configured webhooks',
            href: `/${orgSlug}/${workspaceSlug}/webhooks`,
            color: 'text-pink-600',
            bgColor: 'bg-pink-50',
        },
    ]

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Published
                    </Badge>
                )
            case 'DRAFT':
                return (
                    <Badge variant="secondary">
                        <PenLine className="mr-1 h-3 w-3" />
                        Draft
                    </Badge>
                )
            case 'CHANGED':
                return (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                        Changed
                    </Badge>
                )
            case 'SCHEDULED':
                return (
                    <Badge variant="outline" className="border-blue-500 text-blue-700">
                        <Clock className="mr-1 h-3 w-3" />
                        Scheduled
                    </Badge>
                )
            case 'ARCHIVED':
                return (
                    <Badge variant="outline" className="text-muted-foreground">
                        Archived
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {statCards.map((stat) => (
                    <Link
                        key={stat.title}
                        to={stat.href}
                        className="block transition-transform hover:scale-[1.02]"
                    >
                        <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {statsLoading ? (
                                    <Skeleton className="h-8 w-16" />
                                ) : (
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                )}
                                <p className="text-muted-foreground text-xs mt-1">{stat.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>Latest updated entries</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded" />
                                        <div className="flex-1 space-y-1">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : stats?.recentEntries.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No entries yet</p>
                                <p className="text-sm">Create your first entry to see activity here</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {stats?.recentEntries.map((entry) => (
                                    <Link
                                        key={entry.id}
                                        to={`/${orgSlug}/${workspaceSlug}/collections/${entry.collection.slug}/entries/${entry.id}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{entry.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-muted-foreground">
                                                    {entry.collection.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">•</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(entry.updatedAt), {
                                                        addSuffix: true,
                                                        locale: pt,
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(entry.status)}
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Collections Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Collections
                        </CardTitle>
                        <CardDescription>Content types in this workspace</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                ))}
                            </div>
                        ) : stats?.collections.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No collections yet</p>
                                <Link
                                    to={`/${orgSlug}/${workspaceSlug}/collections/new`}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Create your first collection
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {stats?.collections.map((collection) => (
                                    <Link
                                        key={collection.id}
                                        to={`/${orgSlug}/${workspaceSlug}/collections/${collection.slug}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <span className="font-medium">{collection.name}</span>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                {collection.entriesCount} {collection.entriesCount === 1 ? 'entry' : 'entries'}
                                            </Badge>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Workspace Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Workspace Details</CardTitle>
                    <CardDescription>{workspace.data.description || 'No description'}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-muted p-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Created</p>
                                <p className="font-medium">
                                    {formatDate(new Date(workspace.data.createdAt), 'dd MMM yyyy', { locale: pt })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-muted p-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Last Updated</p>
                                <p className="font-medium">
                                    {formatDistanceToNow(new Date(workspace.data.updatedAt), {
                                        addSuffix: true,
                                        locale: pt,
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-muted p-2">
                                <Database className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Slug</p>
                                <p className="font-medium font-mono text-sm">{workspace.data.slug}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-muted p-2">
                                <Key className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">ID</p>
                                <p className="font-medium font-mono text-xs truncate max-w-[150px]">
                                    {workspace.data.id}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
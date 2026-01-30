import { useParams } from '@tanstack/react-router'
import { Plus, MoreHorizontal, Pencil, Trash, CheckCircle2, PenLine, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useEntries, useDeleteEntry, usePublishEntry, useUnpublishEntry } from './hooks/use-entries'

import { formatDate } from 'date-fns'
import { useState } from 'react'

import { DeleteEntryDialog } from './components/delete-entry-dialog'
import { useCollectionBySlug } from '../workspaces/collections/hooks/use-collections'
import { EntryFormSheet } from './components/entry-form-sheet'


function CollectionEntries() {
    const { slug, workspaceSlug, collectionSlug } = useParams({
        from: '/_authenticated/organizations/$slug/$workspaceSlug/collections/$collectionSlug/',
    })

    const { collection } = useCollectionBySlug(slug, workspaceSlug, collectionSlug)
    const { entries, isLoading, meta } = useEntries(slug, workspaceSlug, collectionSlug)
    const deleteEntry = useDeleteEntry(slug, workspaceSlug, collectionSlug)
    const publishEntry = usePublishEntry(slug, workspaceSlug, collectionSlug)
    const unpublishEntry = useUnpublishEntry(slug, workspaceSlug, collectionSlug)

    const [createOpen, setCreateOpen] = useState(false)
    const [editEntry, setEditEntry] = useState<any>(null)
    const [deleteEntryData, setDeleteEntryData] = useState<any>(null)

    const fields = collection?.fields || []

    // Get display fields (first 4 non-hidden fields)
    const displayFields = fields
        .filter((f) => !f.hidden)
        .slice(0, 4)

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return (
                    <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
                        <CheckCircle2 className='mr-1 h-3 w-3' />
                        Published
                    </Badge>
                )
            case 'DRAFT':
                return (
                    <Badge variant='secondary'>
                        <PenLine className='mr-1 h-3 w-3' />
                        Draft
                    </Badge>
                )
            case 'CHANGED':
                return (
                    <Badge variant='outline' className='border-yellow-500 text-yellow-700'>
                        Changed
                    </Badge>
                )
            default:
                return <Badge variant='outline'>{status}</Badge>
        }
    }

    const renderCellValue = (value: any, fieldType: string) => {
        if (value === null || value === undefined) return '—'

        switch (fieldType) {
            case 'BOOLEAN':
                return value ? 'Yes' : 'No'
            case 'DATE':
            case 'DATETIME':
                return formatDate(new Date(value), 'dd/MM/yyyy')
            case 'MULTISELECT':
            case 'ARRAY':
                return Array.isArray(value) ? value.join(', ') : value
            case 'RICHTEXT':
                return String(value).replace(/<[^>]*>/g, '').slice(0, 50) + '...'
            case 'MEDIA':
                return value ? '📎 Attached' : '—'
            default:
                const strValue = String(value)
                return strValue.length > 50 ? strValue.slice(0, 50) + '...' : strValue
        }
    }

    if (isLoading) {
        return (
            <div className='space-y-4'>
                <div className='flex justify-end'>
                    <Skeleton className='h-10 w-32' />
                </div>
                <div className='rounded-md border'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {[1, 2, 3, 4].map((i) => (
                                    <TableHead key={i}>
                                        <Skeleton className='h-4 w-24' />
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3].map((row) => (
                                <TableRow key={row}>
                                    {[1, 2, 3, 4].map((col) => (
                                        <TableCell key={col}>
                                            <Skeleton className='h-4 w-full' />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )
    }

    return (
        <div className='space-y-4'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <p className='text-muted-foreground text-sm'>
                    {meta.total} {meta.total === 1 ? 'entry' : 'entries'}
                </p>
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Entry
                </Button>
            </div>

            {/* Table */}
            {entries.length === 0 ? (
                <div className='text-center py-12 border rounded-lg'>
                    <FileText className='h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50' />
                    <h3 className='text-lg font-medium'>No entries yet</h3>
                    <p className='text-muted-foreground mb-4'>
                        Create your first entry to get started.
                    </p>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Entry
                    </Button>
                </div>
            ) : (
                <div className='rounded-md border'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {displayFields.map((field) => (
                                    <TableHead key={field.id}>{field.label}</TableHead>
                                ))}
                                <TableHead>Status</TableHead>
                                <TableHead>Updated</TableHead>
                                <TableHead className='w-12'>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.map((entry) => (
                                <TableRow key={entry.id}>
                                    {displayFields.map((field) => (
                                        <TableCell key={field.id}>
                                            {renderCellValue(entry.data[field.name], field.type)}
                                        </TableCell>
                                    ))}
                                    <TableCell>{getStatusBadge(entry.status)}</TableCell>
                                    <TableCell className='text-muted-foreground'>
                                        {formatDate(new Date(entry.updatedAt), 'dd/MM/yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant='ghost' className='h-8 w-8 p-0'>
                                                    <MoreHorizontal className='h-4 w-4' />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align='end'>
                                                <DropdownMenuItem onClick={() => setEditEntry(entry)}>
                                                    <Pencil className='mr-2 h-4 w-4' />
                                                    Edit
                                                </DropdownMenuItem>
                                                {entry.status === 'DRAFT' || entry.status === 'CHANGED' ? (
                                                    <DropdownMenuItem
                                                        onClick={() => publishEntry.mutate(entry.id)}
                                                    >
                                                        <CheckCircle2 className='mr-2 h-4 w-4' />
                                                        Publish
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        onClick={() => unpublishEntry.mutate(entry.id)}
                                                    >
                                                        <PenLine className='mr-2 h-4 w-4' />
                                                        Unpublish
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className='text-red-600'
                                                    onClick={() => setDeleteEntryData(entry)}
                                                >
                                                    <Trash className='mr-2 h-4 w-4' />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Dialogs */}
            <EntryFormSheet
                key={'create-entry'}
                open={createOpen}
                onOpenChange={setCreateOpen}
                fields={fields}
                orgSlug={slug}
                workspaceSlug={workspaceSlug}
                collectionSlug={collectionSlug}
            />

            {editEntry && (
                <EntryFormSheet
                    open={!!editEntry}
                    onOpenChange={(open) => !open && setEditEntry(null)}
                    fields={fields}
                    entry={editEntry}
                    orgSlug={slug}
                    workspaceSlug={workspaceSlug}
                    collectionSlug={collectionSlug}
                    key={editEntry.id}
                />
            )}

            {deleteEntryData && (
                <DeleteEntryDialog
                    open={!!deleteEntryData}
                    onOpenChange={(open) => !open && setDeleteEntryData(null)}
                    entry={deleteEntryData}
                    onConfirm={() => {
                        deleteEntry.mutate(deleteEntryData.id)
                        setDeleteEntryData(null)
                    }}
                />
            )}
        </div>
    )
}


export default CollectionEntries

import { useParams } from '@tanstack/react-router'
import { Plus, MoreHorizontal, Pencil, Trash, GripVertical, Columns3 } from 'lucide-react'
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

import { useState } from 'react'


import { useCollectionBySlug } from '../workspaces/collections/hooks/use-collections'
import { useDeleteField } from '../workspaces/collections/fields/hooks/use-fields'
import { FieldFormSheet } from './components/field-form-sheet'
import { DeleteFieldDialog } from './components/delete-field-dialog'
import { FIELD_TYPE_COLORS, FIELD_TYPE_LABELS } from './utils/field-utils'
import { type Field } from '../workspaces/collections/fields/data/schema'


function CollectionFields() {
    const { slug, workspaceSlug, collectionSlug } = useParams({
        from: '/_authenticated/organizations/$slug/$workspaceSlug/collections/$collectionSlug/fields',
    })

    const { collection, isLoading } = useCollectionBySlug(slug, workspaceSlug, collectionSlug)
    const deleteField = useDeleteField(slug, workspaceSlug, collectionSlug)

    const [createOpen, setCreateOpen] = useState(false)
    const [editField, setEditField] = useState<Field | null>(null)
    const [deleteFieldData, setDeleteFieldData] = useState<Field | null>(null)

    const fields = collection?.fields || []

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div className='space-y-4'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <p className='text-muted-foreground text-sm'>
                    {fields.length} {fields.length === 1 ? 'field' : 'fields'}
                </p>
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Field
                </Button>
            </div>

            {/* Table */}
            {fields.length === 0 ? (
                <div className='text-center py-12 border rounded-lg'>
                    <Columns3 className='h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50' />
                    <h3 className='text-lg font-medium'>No fields yet</h3>
                    <p className='text-muted-foreground mb-4'>
                        Add fields to define the structure of your content.
                    </p>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Field
                    </Button>
                </div>
            ) : (
                <div className='rounded-md border'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-10'></TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Label</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Required</TableHead>
                                <TableHead>Unique</TableHead>
                                <TableHead className='w-12'>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields
                                .sort((a, b) => a.sortOrder - b.sortOrder)
                                .map((field) => (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            <GripVertical className='h-4 w-4 text-muted-foreground cursor-grab' />
                                        </TableCell>
                                        <TableCell>
                                            <code className='text-sm bg-muted px-1.5 py-0.5 rounded'>
                                                {field.name}
                                            </code>
                                        </TableCell>
                                        <TableCell className='font-medium'>{field.label}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant='secondary'
                                                className={FIELD_TYPE_COLORS[field.type] || 'bg-gray-100'}
                                            >
                                                {FIELD_TYPE_LABELS[field.type] || field.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {field.required ? (
                                                <Badge className='bg-red-100 text-red-800 hover:bg-red-100'>
                                                    Required
                                                </Badge>
                                            ) : (
                                                <span className='text-muted-foreground'>—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {field.unique ? (
                                                <Badge variant='outline'>Unique</Badge>
                                            ) : (
                                                <span className='text-muted-foreground'>—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant='ghost' className='h-8 w-8 p-0'>
                                                        <MoreHorizontal className='h-4 w-4' />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align='end'>
                                                    <DropdownMenuItem onClick={() => setEditField(field)}>
                                                        <Pencil className='mr-2 h-4 w-4' />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className='text-red-600'
                                                        onClick={() => setDeleteFieldData(field)}
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
            <FieldFormSheet
                open={createOpen}
                onOpenChange={setCreateOpen}
                orgSlug={slug}
                workspaceSlug={workspaceSlug}
                collectionSlug={collectionSlug}
            />

            {editField && (
                <FieldFormSheet
                    open={!!editField}
                    onOpenChange={(open) => !open && setEditField(null)}
                    field={editField}
                    orgSlug={slug}
                    workspaceSlug={workspaceSlug}
                    collectionSlug={collectionSlug}
                />
            )}

            {deleteFieldData && (
                <DeleteFieldDialog
                    open={!!deleteFieldData}
                    onOpenChange={(open) => !open && setDeleteFieldData(null)}
                    field={deleteFieldData}
                    onConfirm={() => {
                        deleteField.mutate(deleteFieldData.id)
                        setDeleteFieldData(null)
                    }}
                />
            )}
        </div>
    )
}

export default CollectionFields
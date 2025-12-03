import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import { MoreHorizontal, Pencil, Trash, Eye } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { type Collection } from '../data/schema'
import { useCollectionsContext } from './collections-provider'
import { formatDate } from 'date-fns'


export function useCollectionsColumns(
    organizationSlug: string,
    workspaceSlug: string
): ColumnDef<Collection>[] {
    const { setOpen, setCurrentRow } = useCollectionsContext()

    return [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label='Select all'
                    className='translate-y-0.5'
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label='Select row'
                    className='translate-y-0.5'
                />
            ),
            enableSorting: false,
            enableHiding: false,
            meta: {
                className: 'w-12',
            },
        },
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Name' />
            ),
            cell: ({ row }) => {
                const collection = row.original
                return (
                    <div className='flex items-center gap-2'>
                        {collection.icon && (
                            <span className='text-lg'>{collection.icon}</span>
                        )}
                        <Link
                            to='/organizations/$slug/$workspaceSlug/collections/$collectionSlug'
                            params={{
                                slug: organizationSlug,
                                workspaceSlug: workspaceSlug,
                                collectionSlug: collection.slug,
                            }}
                            className='font-medium hover:underline'
                        >
                            {row.getValue('name')}
                        </Link>
                    </div>
                )
            },
        },
        {
            accessorKey: 'slug',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Slug' />
            ),
            cell: ({ row }) => {
                return (
                    <span className='text-muted-foreground'>
                        @{row.getValue('slug')}
                    </span>
                )
            },
        },
        {
            accessorKey: 'description',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Description' />
            ),
            cell: ({ row }) => {
                const description = row.getValue('description') as string | null
                return (
                    <span className='text-muted-foreground max-w-[300px] truncate'>
                        {description || '—'}
                    </span>
                )
            },
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Created' />
            ),
            cell: ({ row }) => {
                return (
                    <span className='text-muted-foreground'>
                        {formatDate(row.getValue('createdAt'), 'dd/MM/yyyy')}
                    </span>
                )
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const collection = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='ghost'
                                className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
                            >
                                <MoreHorizontal className='h-4 w-4' />
                                <span className='sr-only'>Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-40'>
                            <DropdownMenuItem asChild>
                                <Link
                                    to='/organizations/$slug/$workspaceSlug/collections/$collectionSlug'
                                    params={{
                                        slug: organizationSlug,
                                        workspaceSlug: workspaceSlug,
                                        collectionSlug: collection.slug,
                                    }}
                                >
                                    <Eye className='mr-2 h-4 w-4' />
                                    View Entries
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    setCurrentRow(collection)
                                    setOpen('update')
                                }}
                            >
                                <Pencil className='mr-2 h-4 w-4' />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className='text-red-600'
                                onClick={() => {
                                    setCurrentRow(collection)
                                    setOpen('delete')
                                }}
                            >
                                <Trash className='mr-2 h-4 w-4' />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
            meta: {
                className: 'w-12',
            },
        },
    ]
}
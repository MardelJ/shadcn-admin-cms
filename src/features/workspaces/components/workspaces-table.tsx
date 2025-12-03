import { useEffect, useState } from 'react'
import { useLoaderData } from '@tanstack/react-router'
import {
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'

import { useWorkspacesColumns } from './workspaces-columns'
import { Loader2 } from 'lucide-react'
import { useWorkspaces } from '../hooks.use-workspace'

interface WorkspacesTableProps {
    organizationSlug: string
}

export function WorkspacesTable({ organizationSlug }: WorkspacesTableProps) {
    const { organization } = useLoaderData({
        from: '/_authenticated/organizations/$slug',
    })

    const { workspaces, isLoading } = useWorkspaces(organization.data.slug)

    const columns = useWorkspacesColumns(organizationSlug)

    // Local UI-only states
    const [rowSelection, setRowSelection] = useState({})
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [globalFilter, setGlobalFilter] = useState('')
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    const table = useReactTable({
        data: workspaces,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            globalFilter,
            pagination,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        globalFilterFn: (row, _columnId, filterValue) => {
            const name = String(row.getValue('name')).toLowerCase()
            const slug = String(row.getValue('slug')).toLowerCase()
            const description = String(row.getValue('description') || '').toLowerCase()
            const searchValue = String(filterValue).toLowerCase()

            return (
                name.includes(searchValue) ||
                slug.includes(searchValue) ||
                description.includes(searchValue)
            )
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    if (isLoading) {
        return (
            <div className='flex h-[400px] items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
            </div>
        )
    }

    return (
        <div className='flex flex-1 flex-col gap-4'>
            <DataTableToolbar
                table={table}
                searchPlaceholder='Search workspaces...'
            />
            <div className='overflow-hidden rounded-md border'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className={cn(
                                                header.column.columnDef.meta?.className,
                                                header.column.columnDef.meta?.thClassName
                                            )}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cn(
                                                cell.column.columnDef.meta?.className,
                                                cell.column.columnDef.meta?.tdClassName
                                            )}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className='h-24 text-center'
                                >
                                    No workspaces found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} className='mt-auto' />
        </div>
    )
}
"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    PaginationState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, Search, Loader2 } from "lucide-react"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data?: TData[]
    url?: string
    searchKey?: string
    searchPlaceholder?: string
    orderBy?: 'asc' | 'desc'
    filters?: Record<string, string | number | undefined>
}

export function DataTable<TData, TValue>({
    columns,
    data: initialData,
    url,
    searchKey,
    searchPlaceholder = "Search...",
    orderBy,
    filters,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    const searchFilterValue = searchKey ? (columnFilters.find((f) => f.id === searchKey)?.value as string) : undefined;
    const [searchFilter, setSearchFilter] = React.useState<string | undefined>(searchFilterValue);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setSearchFilter(searchFilterValue);
            setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchFilterValue]);

    React.useEffect(() => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, [filters]);

    const { data: fetchedData, isLoading, isFetching } = useQuery({
        queryKey: ["dataTable", url, pagination.pageIndex, pagination.pageSize, searchFilter, orderBy, filters],
        queryFn: async () => {
            if (!url) return null;
            const params: Record<string, string | number | undefined> = {
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
                ...filters,
            };
            if (searchFilter) {
                params.search = searchFilter;
            }
            if (orderBy) {
                params.orderBy = orderBy;
            }
            const res = await api.get(url, { params });
            return res.data;
        },
        enabled: !!url,
    })

    const data = React.useMemo(() => {
        if (initialData) return initialData;
        if (!fetchedData) return [];
        // Handle common response structures
        if (Array.isArray(fetchedData)) return fetchedData;
        if (fetchedData.data) {
            if (Array.isArray(fetchedData.data)) return fetchedData.data;
            if (fetchedData.data.data && Array.isArray(fetchedData.data.data)) return fetchedData.data.data;
        }
        return [];
    }, [fetchedData, initialData]) as TData[];

    const pageCount = React.useMemo(() => {
        if (!url || !fetchedData) return undefined;
        if (fetchedData.meta?.totalPages) return fetchedData.meta.totalPages;
        if (fetchedData.data?.meta?.totalPages) return fetchedData.data.meta.totalPages;
        return -1;
    }, [fetchedData, url]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        manualPagination: !!url,
        manualFiltering: !!url,
        pageCount,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
    })

    return (
        <div className="w-full space-y-4">
            {/* Table Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {searchKey && (
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn(searchKey)?.setFilterValue(event.target.value)
                            }
                            className="w-full pl-8"
                        />
                    </div>
                )}
                <div className="flex items-center ml-auto gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="outline" className="ml-auto" />}>
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table Container */}
            <div className="rounded-md border bg-white dark:bg-zinc-950 overflow-auto shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="whitespace-nowrap px-4 py-3 font-semibold text-muted-foreground">
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
                        {isLoading || isFetching ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    <div className="flex justify-center items-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="transition-colors hover:bg-muted/40"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-4 py-3">
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
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Table Pagination */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 px-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground text-center lg:text-left">
                    {table.getFilteredSelectedRowModel().rows.length > 0 && (
                        <span>
                            {table.getFilteredSelectedRowModel().rows.length} of{" "}
                            {table.getFilteredRowModel().rows.length} row(s) selected.
                        </span>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-8">
                    <div className="flex items-center gap-3">
                        <p className="text-sm font-bold text-zinc-500 whitespace-nowrap">Rows per page</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger className="h-10 w-[80px] rounded-xl border-zinc-200 bg-white font-bold">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top" className="rounded-xl border-zinc-100 shadow-xl">
                                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`} className="font-medium">
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex items-center justify-center text-sm font-black text-zinc-900 min-w-[100px] bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100 uppercase tracking-tighter">
                            Page {table.getState().pagination.pageIndex + 1} of{" "}
                            {table.getPageCount() || 1}
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                className="h-10 w-10 p-0 rounded-xl border-zinc-200 hover:bg-zinc-50 hover:text-indigo-600 transition-all flex items-center justify-center"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to first page</span>
                                <span className="font-bold text-xs tracking-tighter">{"<<"}</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-10 w-10 p-0 rounded-xl border-zinc-200 hover:bg-zinc-50 hover:text-indigo-600 transition-all flex items-center justify-center"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to previous page</span>
                                <span className="font-bold text-xs tracking-tighter">{"<"}</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-10 w-10 p-0 rounded-xl border-zinc-200 hover:bg-zinc-50 hover:text-indigo-600 transition-all flex items-center justify-center"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to next page</span>
                                <span className="font-bold text-xs tracking-tighter">{">"}</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-10 w-10 p-0 rounded-xl border-zinc-200 hover:bg-zinc-50 hover:text-indigo-600 transition-all flex items-center justify-center"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to last page</span>
                                <span className="font-bold text-xs tracking-tighter">{">>"}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

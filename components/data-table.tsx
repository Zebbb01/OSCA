// components\data-table.tsx
'use client'

import React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  VisibilityState,
  ColumnFiltersState,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from '@tanstack/react-table'

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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDownIcon, FilterIcon, SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'


interface FilterableColumn {
  id: string;
  title: string;
  type: 'text' | 'select';
  options: { value: string; label: string }[];
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterableColumns?: FilterableColumn[];
  globalFilter: string;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  isFilterDropdownOpen: boolean;
  setIsFilterDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterableColumns = [],
  globalFilter,
  setGlobalFilter,
  columnFilters,
  setColumnFilters,
  isFilterDropdownOpen,
  setIsFilterDropdownOpen,
}: DataTableProps<TData, TValue>) {

  const initialColumnVisibility: VisibilityState = React.useMemo(() => {
    const visibility: VisibilityState = {};
    const alwaysVisibleColumns = ['fullname', 'contact_no', 'barangay', 'purok', 'gender', 'releaseStatus', 'actions', 'user-actions', 'documents']; // Add all necessary default visible columns here

    columns.forEach((column) => {
      const columnId = (column as any).accessorKey || (column as any).id;
      if (columnId) {
        // By default, set all columns to false (hidden)
        visibility[columnId] = false;
        // Then, explicitly set only the desired columns to true (visible)
        if (alwaysVisibleColumns.includes(columnId)) {
          visibility[columnId] = true;
        }
      }
    });
    return visibility;
  }, [columns]);

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialColumnVisibility);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      columnVisibility,
      columnFilters,
    },
  })

  const hasFilter = (columnId: string) => {
    return columnFilters.some(filter => filter.id === columnId &&
      (Array.isArray(filter.value) ? filter.value.length > 0 : String(filter.value).length > 0));
  };


  return (
    <div className="rounded-md border">
      <div className="flex items-center py-4 px-4 gap-2">
        {/* Global search input */}
        <div className="relative flex-grow max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search Full Name..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9 pr-3 py-2 border rounded-md w-full"
          />
        </div>

        {/* Column Filters Dropdown */}
        {filterableColumns.length > 0 && (
          <DropdownMenu
            open={isFilterDropdownOpen}
            onOpenChange={setIsFilterDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <FilterIcon className="mr-2 h-4 w-4" /> Filter Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[200px]"
              onSelect={(e) => e.preventDefault()}
            >
              <DropdownMenuLabel>Filter by:</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filterableColumns.map((filterableCol) => {
                const column = table.getColumn(filterableCol.id);
                if (!column) return null;

                const currentFilterValue = (column.getFilterValue() || []) as string[];

                return (
                  <DropdownMenuSub key={column.id}>
                    <DropdownMenuSubTrigger>
                      <span>{filterableCol.title}</span>
                      {hasFilter(column.id) && (
                        <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                            {Array.isArray(currentFilterValue) ? currentFilterValue.length : 1}
                        </span>
                      )}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                        {filterableCol.options.length > 0 ? (
                          filterableCol.options.map((option) => (
                            <DropdownMenuCheckboxItem
                              key={option.value}
                              checked={currentFilterValue.includes(String(option.value))}
                              onCheckedChange={(checked) => {
                                const isSingleSelect = ['gender', 'releaseStatus'].includes(column.id);

                                if (checked) {
                                  if (isSingleSelect) {
                                    column.setFilterValue([String(option.value)]);
                                  } else {
                                    column.setFilterValue([...currentFilterValue, String(option.value)]);
                                  }
                                } else {
                                  if (isSingleSelect) {
                                    column.setFilterValue([]);
                                  } else {
                                    column.setFilterValue(currentFilterValue.filter((v) => v !== String(option.value)));
                                  }
                                }
                              }}
                              onSelect={(e) => e.preventDefault()}
                            >
                              {option.label}
                            </DropdownMenuCheckboxItem>
                          ))
                        ) : (
                          <DropdownMenuLabel className="text-gray-500 italic px-2 py-1">No values found.</DropdownMenuLabel>
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                );
              })}
              {columnFilters.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    onClick={() => setColumnFilters([])}
                    className="justify-center text-red-500 hover:text-red-600"
                    onSelect={(e) => e.preventDefault()}
                  >
                    Clear All Filters
                  </DropdownMenuCheckboxItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Column Visibility Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* View All Columns Option */}
            {table.getIsAllColumnsVisible() ? null : (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    const newVisibility: VisibilityState = {};
                    table.getAllColumns().forEach(column => {
                      const columnId = (column as any).accessorKey || (column as any).id;
                      if (columnId) {
                         newVisibility[columnId] = true; // Set all found columns to visible
                      }
                    });
                    table.setColumnVisibility(newVisibility);
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  View All
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {table
              .getAllColumns()
              .filter(
                (column) => column.getCanHide() // No need for specific ID checks here, getCanHide() is sufficient
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id.replace(/_/g, ' ')}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Table>
        <TableHeader className="bg-green-600">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead className="text-white" key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-1">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
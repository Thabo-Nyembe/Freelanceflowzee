/**
 * World-Class DataTable Component
 *
 * A fully-featured, reusable data table built with TanStack Table and shadcn/ui.
 *
 * Features:
 * - Full TypeScript support with generics
 * - Sorting (click headers to sort)
 * - Filtering (global search + column filters)
 * - Pagination (with page size selection)
 * - Row selection with checkboxes
 * - Column visibility toggles
 * - Actions column with dropdown menu
 * - Loading states with skeleton
 * - Empty state handling
 * - Export functionality (CSV)
 *
 * @example
 * ```tsx
 * import { DataTable, DataTableColumnHeader } from "@/components/world-class/data-table"
 * import { ColumnDef } from "@tanstack/react-table"
 *
 * interface User {
 *   id: string
 *   name: string
 *   email: string
 *   status: "active" | "inactive"
 * }
 *
 * const columns: ColumnDef<User>[] = [
 *   {
 *     accessorKey: "name",
 *     header: ({ column }) => (
 *       <DataTableColumnHeader column={column} title="Name" />
 *     ),
 *   },
 *   {
 *     accessorKey: "email",
 *     header: ({ column }) => (
 *       <DataTableColumnHeader column={column} title="Email" />
 *     ),
 *   },
 *   {
 *     accessorKey: "status",
 *     header: "Status",
 *     cell: ({ row }) => (
 *       <Badge variant={row.getValue("status") === "active" ? "default" : "secondary"}>
 *         {row.getValue("status")}
 *       </Badge>
 *     ),
 *   },
 * ]
 *
 * export function UsersTable({ data }: { data: User[] }) {
 *   return (
 *     <DataTable
 *       columns={columns}
 *       data={data}
 *       enableRowSelection
 *       onRowEdit={(user) => console.log("Edit", user)}
 *       onRowDelete={(user) => console.log("Delete", user)}
 *       filterConfigs={[
 *         {
 *           columnId: "status",
 *           title: "Status",
 *           options: [
 *             { label: "Active", value: "active" },
 *             { label: "Inactive", value: "inactive" },
 *           ],
 *         },
 *       ]}
 *     />
 *   )
 * }
 * ```
 */

// Main DataTable component
export { DataTable } from "./data-table"
export type { DataTableProps } from "./data-table"

// Sub-components for custom column definitions
export { DataTableColumnHeader } from "./data-table-column-header"
export { DataTableRowActions } from "./data-table-row-actions"
export { DataTablePagination } from "./data-table-pagination"
export { DataTableToolbar } from "./data-table-toolbar"

// Types
export type {
  DataTableRowAction,
  DataTableRowActionGroup,
} from "./data-table-row-actions"

export type {
  DataTableFilterConfig,
  DataTableFilterOption,
} from "./data-table-toolbar"

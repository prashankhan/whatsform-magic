import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"

interface ResponsesTableProps {
  data: any[]
  columns: ResponsesTableColumn[]
  className?: string
}

interface ResponsesTableColumn {
  key: string
  label: string
  type?: 'text' | 'date' | 'email' | 'phone' | 'number' | 'array' | 'status'
  width?: string
  render?: (value: any, row: any) => React.ReactNode
}

const ResponsesTable = React.forwardRef<
  HTMLDivElement,
  ResponsesTableProps
>(({ data, columns, className }, ref) => {
  const renderCell = (value: any, column: ResponsesTableColumn, row: any) => {
    // Handle custom render function first
    if (column.render) {
      const rendered = column.render(value, row);
      // Ensure rendered content is valid React child
      if (rendered === null || rendered === undefined) {
        return <span className="text-muted-foreground">—</span>;
      }
      return rendered;
    }

    // Handle null/undefined/empty values
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground">—</span>;
    }

    // Handle objects - convert to string representation
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        // Handle arrays in the array case below
      } else {
        // For other objects, show a string representation
        return (
          <span className="text-sm text-muted-foreground truncate block" title={JSON.stringify(value)}>
            [Object]
          </span>
        );
      }
    }

    switch (column.type) {
      case 'date':
        return (
          <span className="text-sm text-foreground font-normal truncate block">
            {format(new Date(value), 'MMM dd, yyyy HH:mm')}
          </span>
        )
      case 'email':
        return (
          <a 
            href={`mailto:${value}`} 
            className="text-primary hover:underline text-sm underline-offset-2 truncate block"
            title={String(value)}
          >
            {String(value).length > 30 ? `${String(value).substring(0, 30)}...` : value}
          </a>
        )
      case 'phone':
        return (
          <a 
            href={`tel:${value}`} 
            className="text-primary hover:underline text-sm underline-offset-2 truncate block"
            title={String(value)}
          >
            {value}
          </a>
        )
      case 'array':
        const arrayValue = Array.isArray(value) ? value.join(', ') : String(value);
        return (
          <span className="text-sm text-foreground truncate block" title={arrayValue}>
            {arrayValue.length > 40 ? `${arrayValue.substring(0, 40)}...` : arrayValue}
          </span>
        )
      case 'status':
        return (
          <Badge variant="secondary" className="text-xs px-2 py-0.5 font-normal">
            {String(value)}
          </Badge>
        )
      case 'number':
        return <span className="text-sm font-mono text-foreground truncate block">{value}</span>
      default:
        // Ensure we always return a string for default case
        const stringValue = String(value);
        return (
          <span className="text-sm text-foreground truncate block" title={stringValue}>
            {stringValue.length > 40 
              ? `${stringValue.substring(0, 40)}...` 
              : stringValue
            }
          </span>
        )
    }
  }

  return (
    <div ref={ref} className={cn("rounded-lg border bg-background overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed">
          {/* Header */}
          <thead className="bg-muted/20">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide border-r border-border/40 last:border-r-0"
                  style={{ width: column.width || 'auto' }}
                >
                  <span className="truncate block">{column.label}</span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-border/20">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length}
                  className="px-3 py-16 text-center text-muted-foreground text-sm"
                >
                  No data to display
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  className="hover:bg-muted/30 transition-colors duration-150"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-3 py-3 border-r border-border/20 last:border-r-0 h-[48px] align-middle"
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full min-w-0 truncate">
                              {renderCell(row[column.key], column, row)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs break-words">
                              {column.render 
                                ? String(column.render(row[column.key], row) || '—')
                                : String(row[column.key] || '—')
                              }
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
})

ResponsesTable.displayName = "ResponsesTable"

export { ResponsesTable, type ResponsesTableColumn }
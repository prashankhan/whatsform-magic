import * as React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface AirtableTableProps {
  data: any[]
  columns: AirtableColumn[]
  className?: string
}

interface AirtableColumn {
  key: string
  label: string
  type?: 'text' | 'date' | 'email' | 'phone' | 'number' | 'array' | 'status'
  width?: string
  render?: (value: any, row: any) => React.ReactNode
}

const AirtableTable = React.forwardRef<
  HTMLDivElement,
  AirtableTableProps
>(({ data, columns, className }, ref) => {
  const renderCell = (value: any, column: AirtableColumn, row: any) => {
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
          <span className="text-sm text-muted-foreground" title={JSON.stringify(value)}>
            [Object]
          </span>
        );
      }
    }

    switch (column.type) {
      case 'date':
        return (
          <span className="text-sm text-foreground font-normal">
            {format(new Date(value), 'MMM dd, yyyy HH:mm')}
          </span>
        )
      case 'email':
        return (
          <a 
            href={`mailto:${value}`} 
            className="text-primary hover:underline text-sm underline-offset-2"
          >
            {value}
          </a>
        )
      case 'phone':
        return (
          <a 
            href={`tel:${value}`} 
            className="text-primary hover:underline text-sm underline-offset-2"
          >
            {value}
          </a>
        )
      case 'array':
        return (
          <div className="flex flex-wrap gap-1">
            {Array.isArray(value) ? value.map((item, idx) => (
              <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5 font-normal">
                {String(item)}
              </Badge>
            )) : (
              <span className="text-sm text-foreground">{String(value)}</span>
            )}
          </div>
        )
      case 'status':
        return (
          <Badge variant="secondary" className="text-xs px-2 py-0.5 font-normal">
            {String(value)}
          </Badge>
        )
      case 'number':
        return <span className="text-sm font-mono text-foreground">{value}</span>
      default:
        // Ensure we always return a string for default case
        const stringValue = String(value);
        return (
          <span className="text-sm text-foreground" title={stringValue}>
            {stringValue.length > 60 
              ? `${stringValue.substring(0, 60)}...` 
              : stringValue
            }
          </span>
        )
    }
  }

  // Calculate grid template columns based on column widths
  const gridTemplateColumns = columns.map(column => {
    if (column.width) {
      return column.width;
    }
    return "1fr";
  }).join(" ");

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
                      className="px-3 py-3 border-r border-border/20 last:border-r-0 min-h-[48px] align-top"
                    >
                      <div className="w-full min-w-0">
                        {renderCell(row[column.key], column, row)}
                      </div>
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

AirtableTable.displayName = "AirtableTable"

export { AirtableTable, type AirtableColumn }
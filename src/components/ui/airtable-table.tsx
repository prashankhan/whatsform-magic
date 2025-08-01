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
    if (column.render) {
      return column.render(value, row)
    }

    if (!value && value !== 0) {
      return <span className="text-muted-foreground">—</span>
    }

    switch (column.type) {
      case 'date':
        return (
          <span className="text-sm font-medium">
            {format(new Date(value), 'MMM dd, yyyy HH:mm')}
          </span>
        )
      case 'email':
        return (
          <a 
            href={`mailto:${value}`} 
            className="text-primary hover:underline text-sm"
          >
            {value}
          </a>
        )
      case 'phone':
        return (
          <a 
            href={`tel:${value}`} 
            className="text-primary hover:underline text-sm"
          >
            {value}
          </a>
        )
      case 'array':
        return (
          <div className="flex flex-wrap gap-1">
            {Array.isArray(value) ? value.map((item, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {String(item)}
              </Badge>
            )) : (
              <span className="text-sm">{String(value)}</span>
            )}
          </div>
        )
      case 'status':
        return (
          <Badge variant="secondary" className="text-xs">
            {String(value)}
          </Badge>
        )
      case 'number':
        return <span className="text-sm font-mono">{value}</span>
      default:
        return (
          <span className="text-sm" title={String(value)}>
            {String(value).length > 50 
              ? `${String(value).substring(0, 50)}...` 
              : String(value)
            }
          </span>
        )
    }
  }

  return (
    <div ref={ref} className={cn("rounded-lg border bg-card overflow-hidden", className)}>
      <ScrollArea className="h-full">
        <div className="min-w-full">
          {/* Header */}
          <div className="flex bg-muted/30 border-b sticky top-0 z-10">
            {columns.map((column) => (
              <div
                key={column.key}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium text-muted-foreground border-r last:border-r-0",
                  column.width || "min-w-[150px] flex-1"
                )}
              >
                {column.label}
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="divide-y">
            {data.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                No data to display
              </div>
            ) : (
              data.map((row, rowIndex) => (
                <div 
                  key={rowIndex} 
                  className="flex hover:bg-muted/50 transition-colors group"
                >
                  {columns.map((column) => (
                    <div
                      key={column.key}
                      className={cn(
                        "flex items-center px-4 py-3 border-r last:border-r-0 min-h-[52px]",
                        column.width || "min-w-[150px] flex-1"
                      )}
                    >
                      {renderCell(row[column.key], column, row)}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
})

AirtableTable.displayName = "AirtableTable"

export { AirtableTable, type AirtableColumn }
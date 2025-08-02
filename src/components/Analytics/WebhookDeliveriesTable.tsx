import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface WebhookDeliveriesTableProps {
  formId: string;
}

export function WebhookDeliveriesTable({ formId }: WebhookDeliveriesTableProps) {
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['webhook-deliveries', formId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_deliveries')
        .select('*')
        .eq('form_id', formId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Globe className="h-8 w-8 mx-auto mb-3 opacity-50" />
        <p>No webhook deliveries yet</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recent Webhook Deliveries</h3>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Response</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Delivered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow key={delivery.id}>
                <TableCell>
                  {getStatusBadge(delivery.status)}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  <div className="max-w-[200px] truncate">
                    {new URL(delivery.webhook_url).hostname}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {delivery.webhook_url}
                  </div>
                </TableCell>
                <TableCell>
                  {delivery.response_code && (
                    <Badge variant={delivery.response_code < 400 ? "secondary" : "destructive"}>
                      {delivery.response_code}
                    </Badge>
                  )}
                  {delivery.error_message && (
                    <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                      {delivery.error_message}
                    </div>
                  )}
                </TableCell>
                <TableCell>{delivery.attempt_count}</TableCell>
                <TableCell>
                  {delivery.delivered_at ? (
                    <div>
                      <div className="text-sm">
                        {format(new Date(delivery.delivered_at), 'MMM d, HH:mm')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(delivery.delivered_at), 'yyyy')}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
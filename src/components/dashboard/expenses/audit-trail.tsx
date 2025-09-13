'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClarity } from "@/context/clarity-provider";
import type { AuditLog } from "@/lib/types";
import { CheckCircle, Circle, Edit3, XCircle } from "lucide-react";

export function AuditTrail({ auditTrail }: { auditTrail: AuditLog[] }) {
  const { getUserById } = useClarity();

  const getIcon = (action: AuditLog['action']) => {
    switch (action) {
      case 'Created':
        return <Edit3 className="h-5 w-5 text-blue-500" />;
      case 'Approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6">
          <div className="absolute left-0 top-0 h-full w-0.5 bg-border -translate-x-1/2 ml-3"></div>
          {auditTrail.map((log, index) => {
            const user = getUserById(log.userId);
            return (
              <div key={index} className="relative mb-8 flex items-start">
                <div className="absolute left-0 top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background -translate-x-1/2">
                   {getIcon(log.action)}
                </div>
                <div className="ml-6 w-full">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">
                      {log.action} by {user?.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {log.comments && (
                    <p className="mt-1 text-sm text-muted-foreground italic">
                      &quot;{log.comments}&quot;
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

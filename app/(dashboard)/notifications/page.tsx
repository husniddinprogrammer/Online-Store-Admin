"use client";

import { motion } from "framer-motion";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNotifications,
  useMarkNotificationSeen,
  useMarkAllNotificationsSeen,
  useDeleteNotification,
} from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/use-translations";
import { useCanEdit } from "@/hooks/use-can-edit";
import type { NotificationType } from "@/types";

const typeVariant: Record<NotificationType, "info" | "success" | "warning" | "destructive"> = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "destructive",
};

export default function NotificationsPage() {
  const t = useTranslations();
  const canEdit = useCanEdit();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading } = useNotifications({ page, size: pageSize });
  const markSeen = useMarkNotificationSeen();
  const markAllSeen = useMarkAllNotificationsSeen();
  const deleteNotif = useDeleteNotification();

  const unseenCount = data?.content.filter((n) => !n.isSeen).length ?? 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title={t("notifications.title")}
        description={unseenCount > 0 ? `${unseenCount} unread` : t("notifications.noNotificationsDesc")}
      >
        {canEdit && unseenCount > 0 && (
          <Button size="sm" variant="outline" onClick={() => markAllSeen.mutate()} disabled={markAllSeen.isPending}>
            <CheckCheck className="h-4 w-4" />
            {t("notifications.markAllRead")}
          </Button>
        )}
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              ))}
            </div>
          ) : !data?.content.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Bell className="h-10 w-10 mb-3 opacity-30" />
              <p>{t("notifications.noNotifications")}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.content.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    "flex items-start gap-3 p-4 transition-colors",
                    !notif.isSeen && "bg-primary/5"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 w-2 h-2 rounded-full shrink-0",
                      !notif.isSeen ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <Badge variant={typeVariant[notif.type] ?? "secondary"} className="text-[10px]">
                        {notif.type}
                      </Badge>
                    </div>
                    <p className={cn("text-sm", !notif.isSeen ? "text-foreground font-medium" : "text-muted-foreground")}>
                      {notif.text}
                    </p>
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-1 shrink-0">
                      {!notif.isSeen && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => markSeen.mutate(notif.id)}
                          disabled={markSeen.isPending}
                          aria-label="Mark as read"
                        >
                          <Check className="h-4 w-4 text-primary" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => deleteNotif.mutate(notif.id)}
                        disabled={deleteNotif.isPending}
                        aria-label="Delete notification"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <DataTablePagination
          page={page}
          pageSize={pageSize}
          totalElements={data.totalElements}
          totalPages={data.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        />
      )}
    </div>
  );
}

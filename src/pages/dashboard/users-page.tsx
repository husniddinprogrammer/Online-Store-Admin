"use client";

import { useState, useCallback } from "react";
import {
  Search,
  UserPlus,
  MoreHorizontal,
  ShieldCheck,
  Ban,
  Trash2,
  UserCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  useUsers,
  useBlockUser,
  useUnblockUser,
  useChangeUserRole,
  useDeleteUser,
} from "@/hooks/use-users";
import { getInitials, formatDate } from "@/lib/utils";
import { useTranslations } from "@/hooks/use-translations";
import { useCanEdit } from "@/hooks/use-can-edit";
import type { User, UserRole } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";

const roleBadgeVariant: Record<
  UserRole,
  "default" | "secondary" | "destructive" | "outline" | "info" | "success" | "warning" | "muted"
> = {
  SUPER_ADMIN: "destructive",
  ADMIN: "info",
  DELIVERY: "warning",
  CUSTOMER: "muted",
  VIEWER: "secondary",
};

export default function UsersPage() {
  const t = useTranslations();
  const canEdit = useCanEdit();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const debouncedSearch = useDebounce(search, 400);

  const [confirmAction, setConfirmAction] = useState<{
    type: "block" | "unblock" | "delete";
    user: User;
  } | null>(null);

  const { data, isLoading } = useUsers({
    search: debouncedSearch || undefined,
    page,
    size: pageSize,
    sort: "createdAt,desc",
  });

  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const changeRole = useChangeUserRole();
  const deleteUser = useDeleteUser();

  const handleConfirm = useCallback(async () => {
    if (!confirmAction) return;
    const { type, user } = confirmAction;
    if (type === "block") await blockUser.mutateAsync(user.id);
    else if (type === "unblock") await unblockUser.mutateAsync(user.id);
    else if (type === "delete") await deleteUser.mutateAsync(user.id);
    setConfirmAction(null);
  }, [confirmAction, blockUser, unblockUser, deleteUser]);

  const isPending = blockUser.isPending || unblockUser.isPending || deleteUser.isPending;

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(0);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={t("users.title")}
        description={t("users.subtitle", { count: data?.totalElements ?? "..." })}
      >
        <Button size="sm" disabled>
          <UserPlus className="h-4 w-4" />
          {t("common.add")}
        </Button>
      </PageHeader>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("users.search")}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("users.name")}</TableHead>
                <TableHead>{t("users.role")}</TableHead>
                <TableHead>{t("users.status")}</TableHead>
                <TableHead>{t("users.balance")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("users.phone")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("common.date")}</TableHead>
                {canEdit && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-9 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-5 w-28" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Skeleton className="h-5 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                : data?.content.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-border transition-colors hover:bg-muted/30"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {getInitials(user.name, user.surname)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {user.name} {user.surname}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleBadgeVariant[user.role] ?? "muted"}>
                          {user.role.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.blocked ? "destructive" : "success"}>
                          {user.blocked ? t("users.blocked") : t("users.active")}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {user.balance.toLocaleString()} UZS
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {user.phoneNumber}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      {canEdit && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label="User actions">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-1">
                                {t("users.changeRole")}
                              </DropdownMenuLabel>
                              {(
                                [
                                  "CUSTOMER",
                                  "DELIVERY",
                                  "ADMIN",
                                  "SUPER_ADMIN",
                                  "VIEWER",
                                ] as UserRole[]
                              ).map((role) => (
                                <DropdownMenuItem
                                  key={role}
                                  disabled={user.role === role || changeRole.isPending}
                                  onClick={() => changeRole.mutate({ id: user.id, role })}
                                >
                                  <ShieldCheck className="h-4 w-4" />
                                  {role.replace("_", " ")}
                                  {user.role === role && " (current)"}
                                </DropdownMenuItem>
                              ))}

                              <DropdownMenuSeparator />

                              {user.blocked ? (
                                <DropdownMenuItem
                                  onClick={() => setConfirmAction({ type: "unblock", user })}
                                >
                                  <UserCheck className="h-4 w-4" />
                                  {t("users.unblock")}
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setConfirmAction({ type: "block", user })}
                                >
                                  <Ban className="h-4 w-4" />
                                  {t("users.block")}
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setConfirmAction({ type: "delete", user })}
                              >
                                <Trash2 className="h-4 w-4" />
                                {t("users.deleteUser")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </motion.tr>
                  ))}
            </TableBody>
          </Table>
        </div>

        {data && (
          <div className="p-4">
            <DataTablePagination
              page={page}
              pageSize={pageSize}
              totalElements={data.totalElements}
              totalPages={data.totalPages}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(0);
              }}
            />
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={
          confirmAction?.type === "block"
            ? t("users.block")
            : confirmAction?.type === "unblock"
              ? t("users.unblock")
              : t("users.deleteUser")
        }
        description={
          confirmAction?.type === "block"
            ? `${t("users.block")} ${confirmAction.user.name}?`
            : confirmAction?.type === "unblock"
              ? `${t("users.unblock")} ${confirmAction?.user.name}?`
              : t("users.confirmDelete")
        }
        confirmLabel={
          confirmAction?.type === "block"
            ? t("users.block")
            : confirmAction?.type === "unblock"
              ? t("users.unblock")
              : t("common.delete")
        }
        variant={confirmAction?.type === "unblock" ? "default" : "destructive"}
        onConfirm={handleConfirm}
        isPending={isPending}
      />
    </div>
  );
}

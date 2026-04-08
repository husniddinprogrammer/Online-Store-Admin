"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/hooks/use-translations";

interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function DataTablePagination({
  page,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const t = useTranslations();
  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1">
      <p className="text-sm text-muted-foreground">
        {totalElements === 0
          ? t("common.noResults")
          : `${start}–${end} ${t("common.of")} ${totalElements} ${t("common.results")}`}
      </p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {t("common.rowsPerPage")}
          </span>
          <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(0)}
            disabled={page === 0}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">First page</span>
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {page + 1} / {Math.max(1, totalPages)}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={page >= totalPages - 1}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Last page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

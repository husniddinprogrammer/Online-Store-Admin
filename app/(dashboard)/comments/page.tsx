"use client";

import { useState } from "react";
import { Search, Star, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { commentsService } from "@/services/comments.service";
import { productsService } from "@/services/products.service";
import { formatDate, getInitials } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import type { Comment } from "@/types";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "text-warning fill-warning" : "text-muted-foreground"}`}
        />
      ))}
    </div>
  );
}

export default function CommentsPage() {
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);

  const debouncedSearch = useDebounce(productSearch, 400);
  const qc = useQueryClient();

  const { data: productsData } = useQuery({
    queryKey: ["products", "list", { search: debouncedSearch }],
    queryFn: () => productsService.getAll({ search: debouncedSearch || undefined, size: 10 }),
  });

  const { data: commentsData, isLoading } = useQuery({
    queryKey: ["comments", selectedProductId, page, pageSize],
    queryFn: () =>
      selectedProductId
        ? commentsService.getByProduct(selectedProductId, { page, size: pageSize })
        : null,
    enabled: !!selectedProductId,
  });

  const deleteComment = useMutation({
    mutationFn: (id: number) => commentsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", selectedProductId] });
      toast.success("Comment deleted");
    },
    onError: () => toast.error("Failed to delete comment"),
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader title="Reviews" description="Manage product reviews and ratings" />

      {/* Product Selector */}
      <Card className="p-4">
        <div className="space-y-3">
          <p className="text-sm font-medium">Select a product to view its reviews</p>
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          {productsData?.content.length ? (
            <div className="flex flex-wrap gap-2">
              {productsData.content.map((product) => (
                <button
                  key={product.id}
                  onClick={() => { setSelectedProductId(product.id); setPage(0); }}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    selectedProductId === product.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-muted"
                  }`}
                >
                  {product.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </Card>

      {/* Comments Table */}
      {selectedProductId && (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-8 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  : !commentsData?.content.length ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                          No reviews for this product
                        </TableCell>
                      </TableRow>
                    )
                  : commentsData.content.map((comment, i) => (
                      <motion.tr
                        key={comment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {getInitials(comment.userName, comment.userSurname)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {comment.userName} {comment.userSurname}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StarRating rating={comment.rating} />
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-muted-foreground line-clamp-2">{comment.text}</p>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(comment)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
              </TableBody>
            </Table>
          </div>

          {commentsData && (
            <div className="p-4">
              <DataTablePagination
                page={page}
                pageSize={pageSize}
                totalElements={commentsData.totalElements}
                totalPages={commentsData.totalPages}
                onPageChange={setPage}
                onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
              />
            </div>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Review"
        description="Delete this review permanently? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleteTarget) await deleteComment.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        isPending={deleteComment.isPending}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Trash2, RefreshCw, ExternalLink, MousePointerClick, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { AppImage } from "@/components/shared/app-image";
import { PageHeader } from "@/components/shared/page-header";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PosterUpload } from "@/components/posters/poster-upload";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePosters, useCreatePoster, useUpdatePoster, useDeletePoster } from "@/hooks/use-posters";
import { img } from "@/lib/utils";
import { useTranslations } from "@/hooks/use-translations";
import { useCanEdit } from "@/hooks/use-can-edit";
import type { Poster } from "@/types";

export default function PostersPage() {
  const t = useTranslations();
  const canEdit = useCanEdit();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  const [createOpen, setCreateOpen] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState<Poster | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Poster | null>(null);

  const { data, isLoading } = usePosters({ page, size: pageSize, sort: "createdAt,desc" });
  const createPoster = useCreatePoster();
  const updatePoster = useUpdatePoster();
  const deletePoster = useDeletePoster();

  const handleCreate = async (image: File, link: string) => {
    await createPoster.mutateAsync({ image, link: link || undefined });
    setCreateOpen(false);
  };

  const handleReplace = async (image: File) => {
    if (!replaceTarget) return;
    await updatePoster.mutateAsync({ id: replaceTarget.id, image });
    setReplaceTarget(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title={t("posters.title")}
        description={t("posters.subtitle", { count: data?.totalElements ?? "..." })}
      >
        {canEdit && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("posters.addPoster")}
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full" style={{ paddingBottom: "56.25%" }} />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </Card>
            ))
          : data?.content.map((poster, i) => (
              <motion.div
                key={poster.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="overflow-hidden group">
                  <div className="relative aspect-video w-full bg-muted">
                    {poster.imageLink ? (
                      <AppImage
                        src={img(poster.imageLink)!}
                        alt={`Poster ${poster.id}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    {canEdit && (
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setReplaceTarget(poster)}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          {t("posters.replaceImage")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteTarget(poster)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t("common.delete")}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {poster.link ? (
                        <a
                          href={poster.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-[180px]"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {poster.link.replace(/^https?:\/\//, "")}
                          </span>
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t("posters.noLink")}</span>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
                      <MousePointerClick className="h-3 w-3" />
                      {poster.clickQuantity.toLocaleString()}
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
      </div>

      {!isLoading && data?.content.length === 0 && (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{t("posters.noPosters")}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{t("posters.noPostersDesc")}</p>
          </div>
          {canEdit && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("posters.addPoster")}
            </Button>
          )}
        </Card>
      )}

      {data && data.totalPages > 1 && (
        <DataTablePagination
          page={page}
          pageSize={pageSize}
          totalElements={data.totalElements}
          totalPages={data.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(0);
          }}
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t("posters.addPoster")}</DialogTitle>
          </DialogHeader>
          <PosterUpload onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!replaceTarget} onOpenChange={(open) => !open && setReplaceTarget(null)}>
        <DialogContent className="max-w-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t("posters.replaceImage")}</DialogTitle>
          </DialogHeader>
          {replaceTarget && (
            <PosterUpload
              imageOnly
              existingUrl={img(replaceTarget.imageLink) ?? undefined}
              onSubmit={(image) => handleReplace(image)}
              onCancel={() => setReplaceTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("posters.title")}
        description={t("posters.confirmDelete")}
        confirmLabel={t("common.delete")}
        onConfirm={async () => {
          if (deleteTarget) await deletePoster.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        isPending={deletePoster.isPending}
      />
    </div>
  );
}

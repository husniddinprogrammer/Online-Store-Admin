"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ImagePicker } from "@/components/shared/image-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/use-categories";
import { img } from "@/lib/utils";
import { useTranslations } from "@/hooks/use-translations";
import { useCanEdit } from "@/hooks/use-can-edit";
import type { Category } from "@/types";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});
type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const t = useTranslations();
  const canEdit = useCanEdit();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | undefined>();

  const { data, isLoading } = useCategories({ page, size: pageSize });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const openCreate = () => {
    setEditingItem(null);
    setImageFile(null);
    setImageError(undefined);
    reset({ name: "" });
    setDialogOpen(true);
  };

  const openEdit = (item: Category) => {
    setEditingItem(item);
    setImageFile(null);
    setImageError(undefined);
    reset({ name: item.name });
    setDialogOpen(true);
  };

  const onSubmit = async (formData: CategoryFormData) => {
    if (!editingItem && !imageFile) {
      setImageError("Image is required");
      return;
    }
    setImageError(undefined);

    if (editingItem) {
      await updateCategory.mutateAsync({ id: editingItem.id, body: { name: formData.name, image: imageFile ?? undefined } });
    } else {
      await createCategory.mutateAsync({ name: formData.name, image: imageFile! });
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title={t("categories.title")} description={t("categories.subtitle", { count: data?.totalElements ?? "..." })}>
        {canEdit && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t("categories.addCategory")}
          </Button>
        )}
      </PageHeader>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">{t("common.image")}</TableHead>
                <TableHead>{t("common.name")}</TableHead>
                {canEdit && <TableHead className="w-24">{t("common.actions")}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 3 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-8 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.content.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border">
                          {item.imageLink ? (
                            <Image src={img(item.imageLink)!} alt={item.name} fill className="object-cover" sizes="40px" />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Tag className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      {canEdit && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => openEdit(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
              onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
            />
          </div>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingItem ? t("categories.editCategory") : t("categories.addCategory")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">{t("common.name")}</Label>
              <Input id="cat-name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>
                {t("common.image")}
                {!editingItem && <span className="text-destructive ml-0.5">*</span>}
                {editingItem && <span className="ml-1 text-xs text-muted-foreground">({t("categories.keepCurrent")})</span>}
              </Label>
              <ImagePicker
                value={imageFile}
                onChange={(f) => { setImageFile(f); if (f) setImageError(undefined); }}
                existingUrl={img(editingItem?.imageLink) ?? undefined}
                error={imageError}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("common.loading") : editingItem ? t("common.save") : t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("categories.title")}
        description={t("categories.confirmDelete", { name: deleteTarget?.name ?? "" })}
        confirmLabel={t("common.delete")}
        onConfirm={async () => {
          if (deleteTarget) await deleteCategory.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        isPending={deleteCategory.isPending}
      />
    </div>
  );
}

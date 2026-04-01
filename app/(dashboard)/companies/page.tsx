"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
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
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from "@/hooks/use-companies";
import { img } from "@/lib/utils";
import type { Company } from "@/types";

const companySchema = z.object({
  name: z.string().min(1, "Name is required"),
});
type CompanyFormData = z.infer<typeof companySchema>;

export default function CompaniesPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  // Image is optional for companies — no imageError needed
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data, isLoading } = useCompanies({ page, size: pageSize });
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  const openCreate = () => {
    setEditingItem(null);
    setImageFile(null);
    reset({ name: "" });
    setDialogOpen(true);
  };

  const openEdit = (item: Company) => {
    setEditingItem(item);
    setImageFile(null);
    reset({ name: item.name });
    setDialogOpen(true);
  };

  const onSubmit = async (formData: CompanyFormData) => {
    if (editingItem) {
      await updateCompany.mutateAsync({ id: editingItem.id, body: { name: formData.name, image: imageFile ?? undefined } });
    } else {
      await createCompany.mutateAsync({ name: formData.name, image: imageFile ?? undefined });
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Companies" description={`${data?.totalElements ?? "..."} companies`}>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </PageHeader>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-24">Actions</TableHead>
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
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Company" : "Add Company"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="co-name">Name</Label>
              <Input id="co-name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>
                Logo
                <span className="ml-1 text-xs text-muted-foreground">(optional)</span>
              </Label>
              <ImagePicker
                value={imageFile}
                onChange={setImageFile}
                existingUrl={img(editingItem?.imageLink) ?? undefined}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingItem ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Company"
        description={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleteTarget) await deleteCompany.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        isPending={deleteCompany.isPending}
      />
    </div>
  );
}

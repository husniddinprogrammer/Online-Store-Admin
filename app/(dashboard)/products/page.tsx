"use client";

import { useState, useCallback } from "react";
import { Search, Plus, MoreHorizontal, Pencil, Trash2, Star, Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Image from "next/image";
import { PageHeader } from "@/components/shared/page-header";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useCompanies } from "@/hooks/use-companies";
import { formatCurrency } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import type { Product, ProductRequest } from "@/types";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  stockQuantity: z.coerce.number().min(0).default(0),
  categoryId: z.coerce.number().min(1, "Category is required"),
  companyId: z.coerce.number().min(1, "Company is required"),
  arrivalPrice: z.coerce.number().min(0).default(0),
  sellPrice: z.coerce.number().min(1, "Sell price is required"),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const debouncedSearch = useDebounce(search, 400);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data, isLoading } = useProducts({
    search: debouncedSearch || undefined,
    page,
    size: pageSize,
    sort: "createdAt,desc",
  });
  const { data: categoriesData } = useCategories({ size: 100 });
  const { data: companiesData } = useCompanies({ size: 100 });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({ resolver: zodResolver(productSchema) as any });

  const openCreate = () => {
    setEditingProduct(null);
    reset({ discountPercent: 0, stockQuantity: 0, arrivalPrice: 0, sellPrice: 0, categoryId: 0, companyId: 0 });
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description,
      discountPercent: product.discountPercent,
      stockQuantity: product.stockQuantity,
      categoryId: product.category.id,
      companyId: product.company.id,
      arrivalPrice: product.arrivalPrice,
      sellPrice: product.sellPrice,
    });
    setDialogOpen(true);
  };

  const onSubmit = useCallback(
    async (formData: ProductFormData) => {
      const body: ProductRequest = {
        name: formData.name,
        description: formData.description,
        discountPercent: Number(formData.discountPercent),
        stockQuantity: Number(formData.stockQuantity),
        categoryId: Number(formData.categoryId),
        companyId: Number(formData.companyId),
        arrivalPrice: Number(formData.arrivalPrice),
        sellPrice: Number(formData.sellPrice),
      };
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, body });
      } else {
        await createProduct.mutateAsync(body);
      }
      setDialogOpen(false);
    },
    [editingProduct, createProduct, updateProduct]
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Products" description={`${data?.totalElements ?? "..."} products`}>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </PageHeader>

      <Card>
        <div className="flex gap-3 p-4 border-b border-border">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-8"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden md:table-cell">Stock</TableHead>
                <TableHead className="hidden lg:table-cell">Rating</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-8 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.content.map((product, i) => {
                    const mainImage = product.images?.find((img) => img.isMain) ?? product.images?.[0];
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                              {mainImage ? (
                                <Image
                                  src={mainImage.imageLink}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate max-w-[200px]">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.company.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary">{product.category.name}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-semibold">{formatCurrency(product.sellPrice)}</p>
                            {product.discountPercent > 0 && (
                              <p className="text-xs text-muted-foreground line-through">
                                {formatCurrency(product.discountedPrice)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={product.stockQuantity > 0 ? "success" : "destructive"}>
                            {product.stockQuantity}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                            <span className="text-sm">{product.averageRating?.toFixed(1) ?? "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(product)}>
                                <Pencil className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(product)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Input id="description" {...register("description")} />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={String(watch("categoryId") || "")}
                  onValueChange={(v) => setValue("categoryId", Number(v), { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesData?.content.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Company</Label>
                <Select
                  value={String(watch("companyId") || "")}
                  onValueChange={(v) => setValue("companyId", Number(v), { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companiesData?.content.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.companyId && <p className="text-xs text-destructive">{errors.companyId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sellPrice">Sell Price</Label>
                <Input id="sellPrice" type="number" min="0" {...register("sellPrice")} />
                {errors.sellPrice && <p className="text-xs text-destructive">{errors.sellPrice.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="arrivalPrice">Arrival Price</Label>
                <Input id="arrivalPrice" type="number" min="0" {...register("arrivalPrice")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stockQuantity">Stock</Label>
                <Input id="stockQuantity" type="number" min="0" {...register("stockQuantity")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="discountPercent">Discount %</Label>
                <Input id="discountPercent" type="number" min="0" max="100" {...register("discountPercent")} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Product"
        description={`Delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleteTarget) await deleteProduct.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        isPending={deleteProduct.isPending}
      />
    </div>
  );
}

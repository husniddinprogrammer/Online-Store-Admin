"use client";

import { useState, useCallback } from "react";
import { Search, Plus, MoreHorizontal, Pencil, Trash2, Star, Package, ImagePlus, ChevronUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Image from "next/image";
import { ProductImageUpload } from "@/components/products/product-image-upload";
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
import { formatCurrency, img } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { useQueryClient } from "@tanstack/react-query";
import { productKeys } from "@/hooks/use-products";
import { useTranslations } from "@/hooks/use-translations";
import { useCanEdit } from "@/hooks/use-can-edit";
import type { Product, ProductRequest, ProductSortOption } from "@/types";

const formatNumberWithSpacing = (value: string): string => {
  const cleanValue = value.replace(/\s/g, '');
  if (!cleanValue) return '';
  const numValue = parseFloat(cleanValue);
  if (isNaN(numValue)) return '';
  const numStr = numValue.toString();
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ').trim();
};

const parseFormattedNumber = (formattedValue: string): number => {
  return parseFloat(formattedValue.replace(/\s/g, '')) || 0;
};

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  stockQuantity: z.coerce.number().min(0).default(0),
  categoryId: z.coerce.number().min(1, "Category is required"),
  companyId: z.coerce.number().min(1, "Company is required"),
  arrivalPrice: z.coerce.number().min(1, "Arrival price is required"),
  sellPrice: z.coerce.number().min(1, "Sell price is required"),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const t = useTranslations();
  const canEdit = useCanEdit();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<ProductSortOption>("ID_DESC");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [imageUploadProduct, setImageUploadProduct] = useState<Product | null>(null);

  const [formattedSellPrice, setFormattedSellPrice] = useState("");
  const [formattedArrivalPrice, setFormattedArrivalPrice] = useState("");
  const [formattedStockQuantity, setFormattedStockQuantity] = useState("");
  const [formattedDiscountPercent, setFormattedDiscountPercent] = useState("");

  const { data, isLoading } = useProducts({
    search: debouncedSearch || undefined,
    categoryId: categoryId ?? undefined,
    companyId: companyId ?? undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    page,
    size: pageSize,
    sort,
  });
  const { data: categoriesData } = useCategories({ size: 100 });
  const { data: companiesData } = useCompanies({ size: 100 });
  const categories = (categoriesData?.content ?? []).filter(
    (category): category is NonNullable<typeof category> => category != null
  );
  const companies = (companiesData?.content ?? []).filter(
    (company): company is NonNullable<typeof company> => company != null
  );

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();

  const handleImageUploadComplete = () => {
    queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    setImageUploadProduct(null);
  };

  const handleSort = (field: "id" | "popular" | "price" | "discount" | "stock" | "sold") => {
    setSort((prev) => {
      if (field === "id") return prev === "ID_ASC" ? "ID_DESC" : "ID_ASC";
      if (field === "popular") return "POPULAR";
      if (field === "discount") return prev === "DISCOUNT_ASC" ? "DISCOUNT_DESC" : "DISCOUNT_ASC";
      if (field === "stock") return prev === "STOCK_ASC" ? "STOCK_DESC" : "STOCK_ASC";
      if (field === "sold") return prev === "SOLD_ASC" ? "SOLD_DESC" : "SOLD_ASC";
      if (prev === "PRICE_ASC") return "PRICE_DESC";
      return "PRICE_ASC";
    });
    setPage(0);
  };

  const isSortActive = (field: "id" | "popular" | "price" | "discount" | "stock" | "sold") => {
    if (field === "id") return sort === "ID_ASC" || sort === "ID_DESC";
    if (field === "popular") return sort === "POPULAR";
    if (field === "price") return sort === "PRICE_ASC" || sort === "PRICE_DESC";
    if (field === "discount") return sort === "DISCOUNT_ASC" || sort === "DISCOUNT_DESC";
    if (field === "stock") return sort === "STOCK_ASC" || sort === "STOCK_DESC";
    return sort === "SOLD_ASC" || sort === "SOLD_DESC";
  };

  const isSortDesc = (field: "id" | "popular" | "price" | "discount" | "stock" | "sold") => {
    if (field === "id") return sort === "ID_DESC";
    if (field === "price") return sort === "PRICE_DESC";
    if (field === "discount") return sort === "DISCOUNT_DESC";
    if (field === "stock") return sort === "STOCK_DESC";
    if (field === "sold") return sort === "SOLD_DESC";
    return true;
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({ resolver: zodResolver(productSchema) });

  const openCreate = () => {
    setEditingProduct(null);
    reset({ discountPercent: 0, stockQuantity: 0, categoryId: 0, companyId: 0 });
    setFormattedSellPrice("");
    setFormattedArrivalPrice("");
    setFormattedStockQuantity("");
    setFormattedDiscountPercent("");
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description,
      discountPercent: product.discountPercent,
      stockQuantity: product.stockQuantity,
      categoryId: product.category?.id ?? 0,
      companyId: product.company?.id ?? 0,
      arrivalPrice: product.arrivalPrice,
      sellPrice: product.sellPrice,
    });
    setFormattedSellPrice(formatNumberWithSpacing(product.sellPrice.toString()));
    setFormattedArrivalPrice(formatNumberWithSpacing(product.arrivalPrice.toString()));
    setFormattedStockQuantity(formatNumberWithSpacing(product.stockQuantity.toString()));
    setFormattedDiscountPercent(formatNumberWithSpacing(product.discountPercent.toString()));
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
      <PageHeader title={t("products.title")} description={t("products.subtitle", { count: data?.totalElements ?? "..." })}>
        {canEdit && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t("products.addProduct")}
          </Button>
        )}
      </PageHeader>

      <Card>
        <div className="flex gap-3 p-4 border-b border-border">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("products.search")}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-8"
            />
          </div>

          <Select
            value={categoryId === null ? "ALL" : String(categoryId)}
            onValueChange={(v) => {
              setCategoryId(v === "ALL" ? null : Number(v));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("products.category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("products.category")} — {t("common.noData").toLowerCase()}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={companyId === null ? "ALL" : String(companyId)}
            onValueChange={(v) => {
              setCompanyId(v === "ALL" ? null : Number(v));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("products.company")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("products.company")} — {t("common.noData").toLowerCase()}</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            inputMode="numeric"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(0);
            }}
            className="w-[140px]"
          />
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(0);
            }}
            className="w-[140px]"
          />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">
                  <button
                    onClick={() => handleSort("id")}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    ID
                    {isSortActive("id") && (
                      <ChevronUp className={`h-4 w-4 transition-transform ${isSortDesc("id") ? "rotate-180" : ""}`} />
                    )}
                  </button>
                </TableHead>
                <TableHead>{t("products.title")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("products.category")}</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("price")}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    {t("products.price")}
                    {isSortActive("price") && (
                      <ChevronUp className={`h-4 w-4 transition-transform ${isSortDesc("price") ? "rotate-180" : ""}`} />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("discount")}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    {t("products.discount")}
                    {isSortActive("discount") && (
                      <ChevronUp className={`h-4 w-4 transition-transform ${isSortDesc("discount") ? "rotate-180" : ""}`} />
                    )}
                  </button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <button
                    onClick={() => handleSort("stock")}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    {t("products.stock")}
                    {isSortActive("stock") && (
                      <ChevronUp className={`h-4 w-4 transition-transform ${isSortDesc("stock") ? "rotate-180" : ""}`} />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("sold")}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    {t("products.sold")}
                    {isSortActive("sold") && (
                      <ChevronUp className={`h-4 w-4 transition-transform ${isSortDesc("sold") ? "rotate-180" : ""}`} />
                    )}
                  </button>
                </TableHead>
                <TableHead className="hidden lg:table-cell">{t("reviews.rating")}</TableHead>
                {canEdit && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-8 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.content.map((product, i) => {
                    const mainImage = product.images?.find((img) => img.isMain) ?? product.images?.[0];
                    const mainImageUrl = img(mainImage?.imageUrl ?? mainImage?.imageLink);
                    const companyName = product.company?.name ?? "—";
                    const categoryName = product.category?.name ?? "—";
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="text-sm font-medium text-muted-foreground">
                          #{product.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                              {mainImageUrl ? (
                                <Image
                                  src={mainImageUrl}
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
                              <p className="text-xs text-muted-foreground">{companyName}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary">{categoryName}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            {product.discountPercent > 0 ? (
                              <p className="text-xs text-muted-foreground line-through">{formatCurrency(product.sellPrice)}</p>
                            ) : (
                              <p className="text-sm font-semibold">{formatCurrency(product.sellPrice)}</p>
                            )}
                            {product.discountPercent > 0 && (
                              <p className="text-sm font-semibold">
                                {formatCurrency(product.discountedPrice)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.discountPercent > 0 ? "warning" : "secondary"}>
                            {product.discountPercent}%
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={product.stockQuantity > 0 ? "success" : "destructive"}>
                            {product.stockQuantity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">
                            {product.soldQuantity || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                            <span className="text-sm">{product.averageRating?.toFixed(1) ?? "—"}</span>
                          </div>
                        </TableCell>
                        {canEdit && (
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
                                  {t("common.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setImageUploadProduct(product)}>
                                  <ImagePlus className="h-4 w-4" />
                                  {t("products.uploadImages")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteTarget(product)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  {t("common.delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
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
            <DialogTitle>{editingProduct ? t("products.editProduct") : t("products.addProduct")}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="name">{t("common.name")}</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="description">{t("products.description")}</Label>
                <Input id="description" {...register("description")} />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>{t("products.category")}</Label>
                <Select
                  value={String(watch("categoryId") || "")}
                  onValueChange={(v) => setValue("categoryId", Number(v), { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("products.category")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>{t("products.company")}</Label>
                <Select
                  value={String(watch("companyId") || "")}
                  onValueChange={(v) => setValue("companyId", Number(v), { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("products.company")} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.companyId && <p className="text-xs text-destructive">{errors.companyId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sellPrice">{t("products.price")}</Label>
                <Input
                  id="sellPrice"
                  type="text"
                  value={formattedSellPrice}
                  onChange={(e) => {
                    const formatted = formatNumberWithSpacing(e.target.value);
                    setFormattedSellPrice(formatted);
                    setValue("sellPrice", parseFormattedNumber(formatted), { shouldValidate: true });
                  }}
                />
                {errors.sellPrice && <p className="text-xs text-destructive">{errors.sellPrice.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="arrivalPrice">{t("products.arrivalPrice")}</Label>
                <Input
                  id="arrivalPrice"
                  type="text"
                  value={formattedArrivalPrice}
                  onChange={(e) => {
                    const formatted = formatNumberWithSpacing(e.target.value);
                    setFormattedArrivalPrice(formatted);
                    setValue("arrivalPrice", parseFormattedNumber(formatted), { shouldValidate: true });
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stockQuantity">{t("products.stock")}</Label>
                <Input
                  id="stockQuantity"
                  type="text"
                  value={formattedStockQuantity}
                  onChange={(e) => {
                    const formatted = formatNumberWithSpacing(e.target.value);
                    setFormattedStockQuantity(formatted);
                    setValue("stockQuantity", parseFormattedNumber(formatted), { shouldValidate: true });
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="discountPercent">{t("products.discount")}</Label>
                <Input
                  id="discountPercent"
                  type="text"
                  value={formattedDiscountPercent}
                  onChange={(e) => {
                    const formatted = formatNumberWithSpacing(e.target.value);
                    setFormattedDiscountPercent(formatted);
                    setValue("discountPercent", parseFormattedNumber(formatted), { shouldValidate: true });
                  }}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("common.loading") : editingProduct ? t("common.save") : t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={!!imageUploadProduct} onOpenChange={(open) => !open && setImageUploadProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("products.uploadImages")} — {imageUploadProduct?.name}</DialogTitle>
          </DialogHeader>
          {imageUploadProduct && (
            <ProductImageUpload
              productId={imageUploadProduct.id}
              onUploadComplete={handleImageUploadComplete}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("products.title")}
        description={t("products.confirmDelete")}
        confirmLabel={t("common.delete")}
        onConfirm={async () => {
          if (deleteTarget) await deleteProduct.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        isPending={deleteProduct.isPending}
      />
    </div>
  );
}

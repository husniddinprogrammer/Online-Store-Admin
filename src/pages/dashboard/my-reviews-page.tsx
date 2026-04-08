"use client";

import { useState } from "react";
import type { ElementType } from "react";
import { motion } from "framer-motion";
import { Package, PenLine, MessageSquare, Clock, Star } from "lucide-react";
import { AppImage } from "@/components/shared/app-image";
import { PageHeader } from "@/components/shared/page-header";
import { ReviewModal } from "@/components/reviews/review-modal";
import { RatingStars } from "@/components/reviews/rating-stars";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyReviews } from "@/hooks/use-reviews";
import { formatDate, formatCurrency, img } from "@/lib/utils";
import { useTranslations } from "@/hooks/use-translations";
import { useCanEdit } from "@/hooks/use-can-edit";
import type { NotReviewedProduct } from "@/types";

function ReviewSkeleton() {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      </div>
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-3/4" />
    </Card>
  );
}

function PendingSkeleton() {
  return (
    <Card className="p-4 flex items-center gap-3">
      <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3.5 w-24" />
      </div>
      <Skeleton className="h-9 w-28 rounded-lg shrink-0" />
    </Card>
  );
}

export default function MyReviewsPage() {
  const t = useTranslations();
  const canEdit = useCanEdit();
  const { data, isLoading } = useMyReviews();
  const [modalProduct, setModalProduct] = useState<NotReviewedProduct | null>(null);

  const reviewed = data?.reviewed ?? [];
  const notReviewed = data?.notReviewed ?? [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader title={t("myReviews.title")} description={t("myReviews.subtitle")} />

      <Tabs defaultValue="pending">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-3.5 w-3.5" />
            {t("myReviews.pending")}
            {notReviewed.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
                {notReviewed.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="gap-2">
            <Star className="h-3.5 w-3.5" />
            {t("myReviews.reviewed")}
            {reviewed.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
                {reviewed.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <PendingSkeleton key={i} />
              ))}
            </div>
          ) : notReviewed.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title={t("myReviews.noPending")}
              description={t("myReviews.noPendingDesc")}
            />
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="space-y-3"
            >
              {notReviewed.map((product) => (
                <motion.div
                  key={product.productId}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                >
                  <Card className="flex items-center gap-3 p-4 hover:shadow-md transition-shadow">
                    <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-muted border border-border">
                      {product.productImageLink ? (
                        <AppImage
                          src={img(product.productImageLink)!}
                          alt={product.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.productName}</p>
                      {product.price != null && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatCurrency(product.price)}
                        </p>
                      )}
                    </div>

                    {canEdit && (
                      <Button
                        size="sm"
                        className="shrink-0 gap-1.5"
                        onClick={() => setModalProduct(product)}
                      >
                        <PenLine className="h-3.5 w-3.5" />
                        {t("myReviews.writeReview")}
                      </Button>
                    )}
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <ReviewSkeleton key={i} />
              ))}
            </div>
          ) : reviewed.length === 0 ? (
            <EmptyState
              icon={Star}
              title={t("myReviews.noReviews")}
              description={t("myReviews.noReviewsDesc")}
            />
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="space-y-3"
            >
              {reviewed.map((review) => (
                <motion.div
                  key={review.id}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="relative h-11 w-11 shrink-0 rounded-xl overflow-hidden bg-muted border border-border">
                        {review.productImageLink ? (
                          <AppImage
                            src={img(review.productImageLink)!}
                            alt={review.productName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{review.productName}</p>
                        <RatingStars value={review.rating} size="sm" readonly className="mt-0.5" />
                      </div>
                      <time className="text-xs text-muted-foreground shrink-0">
                        {formatDate(review.createdAt)}
                      </time>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed pl-[3.5rem]">
                      {review.text}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      <ReviewModal product={modalProduct} onClose={() => setModalProduct(null)} />
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType;
  title: string;
  description: string;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </Card>
  );
}

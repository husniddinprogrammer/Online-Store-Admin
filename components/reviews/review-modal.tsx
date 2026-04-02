"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "@/components/reviews/rating-stars";
import { useCreateReview } from "@/hooks/use-reviews";
import { img } from "@/lib/utils";
import type { NotReviewedProduct } from "@/types";

const schema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  text: z.string().min(10, "Review must be at least 10 characters"),
});
type FormData = z.infer<typeof schema>;

interface ReviewModalProps {
  product: NotReviewedProduct | null;
  onClose: () => void;
}

export function ReviewModal({ product, onClose }: ReviewModalProps) {
  const createReview = useCreateReview();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0, text: "" },
  });

  useEffect(() => {
    if (product) reset({ rating: 0, text: "" });
  }, [product, reset]);

  const onSubmit = async (data: FormData) => {
    if (!product) return;
    await createReview.mutateAsync({
      productId: product.productId,
      rating: data.rating,
      text: data.text,
    });
    onClose();
  };

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>

        {product && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted border border-border overflow-hidden">
              {product.productImageLink ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img(product.productImageLink)!}
                  alt={product.productName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm font-medium leading-tight">{product.productName}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Rating</Label>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <RatingStars value={field.value} onChange={field.onChange} size="lg" />
              )}
            />
            {errors.rating && (
              <p className="text-xs text-destructive">{errors.rating.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-text">Your Review</Label>
            <Textarea
              id="review-text"
              placeholder="Share your experience with this product…"
              rows={4}
              {...register("text")}
              className="resize-none"
            />
            {errors.text && (
              <p className="text-xs text-destructive">{errors.text.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={createReview.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createReview.isPending}>
              {createReview.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Review
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Star, PencilSimpleLine } from "@phosphor-icons/react";
import { toast } from "sonner";
import { reviewApi } from "@/services/api";
import { useAuth } from "@/hooks";
import { cn } from "@/lib/utils";
import { Button, ButtonCTA } from "@/components/ui/button";
import { Textarea, Field } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay";

const StarPicker = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Chọn số sao">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} sao`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="transition-transform duration-300 ease-spring hover:scale-110"
        >
          <Star
            size={26}
            weight={(hover || value) >= star ? "fill" : "light"}
            className={(hover || value) >= star ? "text-copper" : "text-ink/22"}
          />
        </button>
      ))}
    </div>
  );
};

/**
 * Chi hien nut viet danh gia khi khach da nhan san pham nay
 * (server cung chan lai, day chi la lop UX).
 */
export const ReviewForm = ({ productId, onSuccess, className }) => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: reviewable = [] } = useQuery({
    queryKey: ["reviewable"],
    queryFn: reviewApi.reviewable,
    select: (res) => res.data,
    enabled: isAuthenticated,
  });

  const canReview = reviewable.some((item) => String(item.product) === String(productId));

  const submit = async (e) => {
    e.preventDefault();
    if (comment.trim().length < 10) {
      toast.error("Nhận xét cần ít nhất 10 ký tự");
      return;
    }
    setSubmitting(true);
    try {
      await reviewApi.create({ productId, rating, comment: comment.trim() });
      toast.success("Cảm ơn bạn!", { description: "Đánh giá sẽ hiển thị sau khi được duyệt." });
      setOpen(false);
      setComment("");
      setRating(5);
      onSuccess?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={cn("rounded-md bg-ink/[0.035] p-5 text-center", className)}>
        <p className="text-sm text-ink-muted">Đăng nhập để viết đánh giá</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/dang-nhap">Đăng nhập</Link>
        </Button>
      </div>
    );
  }

  if (!canReview) {
    return (
      <p className={cn("rounded-md bg-ink/[0.035] p-5 text-center text-xs leading-relaxed text-ink-faint", className)}>
        Chỉ khách hàng đã nhận sản phẩm này mới có thể viết đánh giá.
      </p>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ButtonCTA
          variant="outline"
          className={cn("w-full", className)}
          icon={<PencilSimpleLine size={13} weight="light" />}
        >
          Viết đánh giá
        </ButtonCTA>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chia sẻ trải nghiệm của bạn</DialogTitle>
          <DialogDescription>
            Nhận xét của bạn giúp những khách hàng khác chọn đúng kết cấu cho mái tóc của họ.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-7">
          <Field label="Chấm điểm" required>
            <div className="pt-2">
              <StarPicker value={rating} onChange={setRating} />
            </div>
          </Field>

          <Field
            label="Nhận xét"
            required
            hint={`${comment.length}/2000 ký tự — tối thiểu 10`}
          >
            <Textarea
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
              placeholder="Sản phẩm giữ nếp thế nào? Có hợp với loại tóc của bạn không?"
            />
          </Field>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Huỷ
            </Button>
            <ButtonCTA type="submit" disabled={submitting}>
              {submitting ? "Đang gửi…" : "Gửi đánh giá"}
            </ButtonCTA>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewForm;

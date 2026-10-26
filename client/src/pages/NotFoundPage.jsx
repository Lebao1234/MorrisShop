import { Link } from "react-router-dom";
import { SEO } from "@/components/common";
import { MaskedLines } from "@/components/common/Reveal";
import { ButtonCTA, Button } from "@/components/ui/button";

export const NotFoundPage = () => (
  <>
    <SEO title="Không tìm thấy trang" noIndex />

    <section className="container flex min-h-[80dvh] flex-col justify-center py-24">
      {/* Bo cuc lech trai, so 404 kho lon lam diem nhan thi giac */}
      <div className="grid items-end gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <span className="eyebrow">Lỗi 404</span>
          <MaskedLines
            lines={["Không tìm", "thấy trang"]}
            className="mt-7"
            lineClassName="font-display text-display-md font-normal text-ink"
          />
        </div>

        <div className="lg:col-span-5">
          <p className="text-[0.9375rem] leading-relaxed text-ink-muted">
            Trang bạn tìm không tồn tại hoặc đã được chuyển đi. Có thể sản phẩm đã ngừng bán, hoặc đường
            dẫn bị gõ sai.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <ButtonCTA asChild>
              <Link to="/shop">Về cửa hàng</Link>
            </ButtonCTA>
            <Button variant="outline" asChild>
              <Link to="/">Trang chủ</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-20 overflow-hidden border-t border-ink/10 pt-10">
        <MaskedLines
          lines={["404"]}
          delay={0.25}
          lineClassName="font-display text-[clamp(6rem,24vw,18rem)] font-normal leading-[0.8] tracking-tight text-ink/[0.06]"
        />
      </div>
    </section>
  </>
);

export default NotFoundPage;

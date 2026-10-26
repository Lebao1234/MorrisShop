import { Link } from "react-router-dom";
import { SEO, SectionHeading } from "@/components/common";
import { Reveal, MaskedLines, RevealGroup, RevealItem } from "@/components/common/Reveal";
import { ButtonCTA } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/display";
import { MarqueeStrip } from "@/components/home/Sections";

const img = (seed, w = 1200, h = 900) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const TIMELINE = [
  {
    year: "2019",
    title: "Mẻ sáp đầu tiên",
    text: "Phối trong bếp của một tiệm cắt tóc phố Hàng Bông, vì không tìm được sản phẩm giữ nếp đủ mạnh mà vẫn gội sạch trong một lần.",
  },
  {
    year: "2021",
    title: "Xưởng riêng tại Hà Nội",
    text: "Chuyển sang xưởng nhỏ ở Long Biên, chuẩn hoá quy trình nhưng vẫn giữ cách trộn và kiểm tra kết cấu bằng tay.",
  },
  {
    year: "2023",
    title: "Bảy kết cấu",
    text: "Hoàn thiện dải sản phẩm từ giữ nếp nhẹ tới cực mạnh, phủ gần như mọi loại tóc của đàn ông Việt.",
  },
  {
    year: "2026",
    title: "Bộ sưu tập hiện tại",
    text: "Toàn bộ dòng sản phẩm chuyển sang gốc nước, bao bì tái chế và thành phần in đầy đủ trên nhãn.",
  },
];

const FAQS = [
  {
    q: "Sáp gốc nước khác gì sáp gốc dầu?",
    a: "Sáp gốc nước tan trong nước nên gội một lần là sạch, không để lại lớp dầu bám trên da đầu qua đêm. Sáp gốc dầu giữ độ bóng lâu hơn nhưng thường cần dầu gội tẩy mạnh để làm sạch hoàn toàn.",
  },
  {
    q: "Tôi nên chọn độ giữ nếp nào?",
    a: "Tóc mỏng và mềm hợp với giữ nếp nhẹ hoặc vừa để tránh bết. Tóc dày và cứng nên chọn giữ nếp cao. Nếu bạn để kiểu dựng đứng hoặc pompadour cao, hãy chọn mức cực mạnh.",
  },
  {
    q: "Sản phẩm có gây rụng tóc không?",
    a: "Không. Toàn bộ công thức đều không chứa cồn khô mạnh và được kiểm nghiệm độ kích ứng. Rụng tóc thường đến từ việc không gội sạch sản phẩm, nên chúng tôi chọn gốc nước.",
  },
  {
    q: "Chính sách đổi trả thế nào?",
    a: "Bạn có thể đổi trả trong 7 ngày kể từ khi nhận hàng nếu sản phẩm chưa mở seal. Với sản phẩm lỗi từ nhà sản xuất, chúng tôi đổi mới trong 30 ngày và chịu phí vận chuyển hai chiều.",
  },
  {
    q: "Giao hàng mất bao lâu?",
    a: "Nội thành Hà Nội và TP.HCM: 1-2 ngày làm việc. Các tỉnh thành khác: 2-4 ngày làm việc. Đơn từ 500.000đ được miễn phí vận chuyển toàn quốc.",
  },
];

export const AboutPage = () => (
  <>
    <SEO
      title="Câu chuyện thương hiệu"
      description="Morris bắt đầu từ một chiếc ghế cắt tóc ở phố Hàng Bông. Sáp vuốt tóc gốc nước, phối chế thủ công từng mẻ nhỏ tại Hà Nội."
    />

    {/* Hero bien tap - chu lon lech trai, anh neo phai */}
    <section className="container pb-20 pt-32 md:pt-40">
      <div className="grid items-end gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <Reveal>
            <span className="eyebrow">Câu chuyện</span>
          </Reveal>
          <MaskedLines
            lines={["Bắt đầu từ", "một chiếc ghế", "cắt tóc"]}
            className="mt-7"
            lineClassName="font-display text-display-md font-normal text-ink"
          />
        </div>
        <Reveal delay={0.2} className="lg:col-span-5">
          <p className="text-[0.9375rem] leading-loose text-ink-muted text-pretty">
            Morris không bắt đầu từ một kế hoạch kinh doanh. Nó bắt đầu vì một người thợ cắt tóc chán việc
            phải dặn khách gội hai lần mới sạch sáp. Bảy năm sau, chúng tôi vẫn trộn từng mẻ nhỏ và vẫn
            kiểm tra kết cấu bằng ngón tay.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.15} className="mt-16">
        <div className="overflow-hidden rounded-bezel">
          <img
            src={img("morris-about-hero", 2000, 1000)}
            alt="Xưởng phối chế sáp vuốt tóc Morris"
            className="aspect-[2/1] w-full object-cover"
          />
        </div>
      </Reveal>
    </section>

    <MarqueeStrip
      items={["Phối chế thủ công", "Gốc nước hoàn toàn", "Từng mẻ nhỏ", "Hà Nội — Việt Nam"]}
    />

    {/* Dong thoi gian - bo cuc lech, nam neo trai */}
    <section className="container py-24 md:py-30">
      <SectionHeading eyebrow="Hành trình" title="Bảy năm, bảy kết cấu" />

      <div className="mt-16 space-y-0">
        {TIMELINE.map((item, i) => (
          <Reveal key={item.year} delay={i * 0.06}>
            <div className="grid gap-4 border-t border-ink/10 py-9 md:grid-cols-12 md:gap-8">
              <p className="font-display text-4xl text-copper md:col-span-2">{item.year}</p>
              <h3 className="font-display text-2xl font-normal text-ink md:col-span-4">{item.title}</h3>
              <p className="text-sm leading-relaxed text-ink-muted md:col-span-6">{item.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>

    {/* Cach lam - anh xep lop theo truc Z */}
    <section className="bg-bone-warm py-24 md:py-30">
      <div className="container grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <div className="relative">
            <div className="overflow-hidden rounded-bezel">
              <img
                src={img("morris-about-craft", 1000, 1250)}
                alt=""
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -right-4 hidden w-48 overflow-hidden rounded-bezel border-[6px] border-bone-warm md:block">
              <img
                src={img("morris-about-craft-2", 600, 600)}
                alt=""
                className="aspect-square w-full object-cover"
              />
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <span className="eyebrow">Cách chúng tôi làm</span>
            <h2 className="mt-6 font-display text-display-sm font-normal text-ink">
              Không có công thức nào ra đời sau một lần thử
            </h2>
          </Reveal>

          <RevealGroup className="mt-10 space-y-8">
            {[
              {
                title: "Bắt đầu từ mái tóc thật",
                text: "Mỗi công thức được thử trên ít nhất 40 mái tóc khác nhau tại các tiệm cắt tóc đối tác trước khi vào sản xuất.",
              },
              {
                title: "Trộn từng mẻ nhỏ",
                text: "Mỗi mẻ tối đa 200 hũ. Nhỏ đủ để kiểm soát nhiệt độ và độ ẩm — hai yếu tố quyết định kết cấu cuối cùng.",
              },
              {
                title: "Kiểm tra bằng tay",
                text: "Không máy móc nào thay được ngón tay trong việc đánh giá độ bám, độ tan và cảm giác khi vuốt lên tóc.",
              },
            ].map((item) => (
              <RevealItem key={item.title}>
                <div className="border-l border-copper/40 pl-6">
                  <h3 className="font-display text-xl font-normal text-ink">{item.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{item.text}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section id="faq" className="container py-24 md:py-30">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div>
          <Reveal>
            <span className="eyebrow">Hỏi & đáp</span>
            <h2 className="mt-6 font-display text-display-sm font-normal text-ink">
              Những câu hỏi thường gặp
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-ink-muted">
              Không tìm thấy câu trả lời? Nhắn cho chúng tôi tại{" "}
              <a href="mailto:hello@morrisshop.vn" className="text-ink underline underline-offset-4">
                hello@morrisshop.vn
              </a>
              .
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem key={faq.q} value={`faq-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>

    {/* CTA cuoi trang */}
    <section className="container pb-24 md:pb-30">
      <Reveal>
        <div className="relative overflow-hidden rounded-bezel bg-ink px-8 py-20 text-center md:px-16 md:py-28">
          <h2 className="mx-auto max-w-2xl font-display text-display-sm font-normal text-bone text-balance">
            Tìm kết cấu phù hợp với mái tóc của bạn
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-bone/60">
            Bảy công thức, từ giữ nếp nhẹ tới cực mạnh. Lọc theo loại tóc để thu hẹp nhanh.
          </p>
          <ButtonCTA variant="light" size="lg" className="mt-10" asChild>
            <Link to="/shop">Khám phá bộ sưu tập</Link>
          </ButtonCTA>
        </div>
      </Reveal>
    </section>
  </>
);

export default AboutPage;

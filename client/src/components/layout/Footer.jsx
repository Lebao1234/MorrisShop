import { useState } from "react";
import { Link } from "react-router-dom";
import { InstagramLogo, FacebookLogo, YoutubeLogo, TiktokLogo } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { ArrowGlyph } from "@/components/ui/button";
import { Reveal, MaskedLines } from "@/components/common/Reveal";

const COLUMNS = [
  {
    title: "Cửa hàng",
    links: [
      { label: "Tất cả sản phẩm", to: "/shop" },
      { label: "Sáp vuốt tóc", to: "/shop?category=sap-vuot-toc" },
      { label: "Dầu gội & dưỡng tóc", to: "/shop?category=dau-goi-duong-toc" },
      { label: "Combo chăm sóc", to: "/shop?category=combo-cham-soc" },
      { label: "Phụ kiện tạo kiểu", to: "/shop?category=phu-kien-tao-kieu" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Câu chuyện thương hiệu", to: "/about" },
      { label: "Đơn hàng của tôi", to: "/tai-khoan/don-hang" },
      { label: "Chính sách đổi trả", to: "/about#doi-tra" },
      { label: "Vận chuyển & giao hàng", to: "/about#van-chuyen" },
      { label: "Câu hỏi thường gặp", to: "/about#faq" },
    ],
  },
];

const SOCIALS = [
  { Icon: InstagramLogo, href: "https://instagram.com", label: "Instagram" },
  { Icon: FacebookLogo, href: "https://facebook.com", label: "Facebook" },
  { Icon: TiktokLogo, href: "https://tiktok.com", label: "TikTok" },
  { Icon: YoutubeLogo, href: "https://youtube.com", label: "YouTube" },
];

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email chưa hợp lệ");
      return;
    }
    // Ket noi dich vu email marketing that o day (Mailchimp, Klaviyo...)
    setSubmitted(true);
    toast.success("Cảm ơn bạn đã đăng ký nhận bản tin");
    setEmail("");
  };

  return (
    <div className="max-w-md">
      <p className="text-[0.625rem] uppercase tracking-editorial text-bone/45">Bản tin</p>
      <h3 className="mt-4 font-display text-3xl font-normal leading-tight text-bone">
        Kỹ thuật tạo kiểu, gửi mỗi tháng một lần.
      </h3>
      <p className="mt-4 text-sm leading-relaxed text-bone/55">
        Hướng dẫn từ thợ cắt tóc, sản phẩm mới và ưu đãi riêng. Không spam, huỷ bất cứ lúc nào.
      </p>

      {submitted ? (
        <p className="mt-7 text-sm text-copper-light">Đã ghi nhận. Hẹn gặp bạn trong hộp thư.</p>
      ) : (
        <form onSubmit={submit} className="mt-7 flex items-center gap-3 border-b border-bone/22 pb-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@cua-ban.com"
            aria-label="Địa chỉ email"
            className="h-9 border-0 py-0 text-bone placeholder:text-bone/35 focus:border-0"
          />
          <button
            type="submit"
            aria-label="Đăng ký nhận bản tin"
            className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bone/10 text-bone transition-all duration-500 ease-spring hover:bg-copper"
          >
            <ArrowGlyph className="transition-transform duration-500 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </form>
      )}
    </div>
  );
};

export const Footer = () => (
  <footer className="relative bg-ink text-bone">
    <div className="container py-24 md:py-30">
      {/* Bo cuc lech: chu ky thuong hieu lon ben trai, cot lien ket ben phai */}
      <div className="grid gap-16 lg:grid-cols-[1.15fr_1fr] lg:gap-24">
        <Reveal>
          <Newsletter />
        </Reveal>

        <div className="grid gap-12 sm:grid-cols-2">
          {COLUMNS.map((column, ci) => (
            <Reveal key={column.title} delay={0.08 * (ci + 1)}>
              <h4 className="text-[0.625rem] uppercase tracking-editorial text-bone/45">{column.title}</h4>
              <ul className="mt-6 space-y-3.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-bone/70 transition-colors duration-400 hover:text-bone"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Chu ky thuong hieu kho lon - dinh diem thi giac cuoi trang */}
      <div className="mt-24 overflow-hidden md:mt-30">
        <MaskedLines
          lines={["MORRIS"]}
          lineClassName="font-display text-[clamp(4rem,17vw,13rem)] font-normal leading-[0.85] tracking-[0.06em] text-bone/12"
        />
      </div>

      <div className="mt-14 flex flex-col gap-7 border-t border-bone/12 pt-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-[0.625rem] uppercase tracking-wideish text-bone/40">
          <span>© {new Date().getFullYear()} Morris Grooming Co.</span>
          <span>Hà Nội, Việt Nam</span>
          <a href="mailto:hello@morrisshop.vn" className="transition-colors hover:text-bone">
            hello@morrisshop.vn
          </a>
        </div>

        <div className="flex items-center gap-1.5">
          {SOCIALS.map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              className="flex h-9 w-9 items-center justify-center rounded-full text-bone/55 transition-all duration-500 ease-spring hover:bg-bone/10 hover:text-bone"
            >
              <Icon size={16} weight="light" />
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

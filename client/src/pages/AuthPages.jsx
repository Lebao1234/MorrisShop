import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { SEO } from "@/components/common";
import { MaskedLines } from "@/components/common/Reveal";
import { Input, Field } from "@/components/ui/input";
import { Button, ButtonCTA } from "@/components/ui/button";

/* ------------------------- Khung chung cho trang auth ------------------------ */

/**
 * Bo cuc chia doi: khoi chu bien tap ben trai, form ben phai.
 * Duoi 1024px anh nen an di, form chiem toan bo chieu ngang.
 */
const AuthShell = ({ eyebrow, titleLines, description, image, children, footer }) => (
  <div className="grid min-h-[100dvh] lg:grid-cols-2">
    {/* Cot hinh anh - chi tren desktop */}
    <div className="relative hidden overflow-hidden bg-ink lg:block">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20" />
      <div className="relative flex h-full flex-col justify-between p-14">
        <Link
          to="/"
          className="font-display text-lg font-normal tracking-[0.32em] text-bone"
          aria-label="Morris - trang chủ"
        >
          MORRIS
        </Link>
        <div>
          <MaskedLines
            lines={["Kết cấu", "làm nên", "phong thái"]}
            lineClassName="font-display text-[clamp(2.5rem,4.5vw,4rem)] font-normal leading-[1.02] text-bone"
          />
          <p className="mt-8 max-w-sm text-sm leading-relaxed text-bone/55">
            Sáp vuốt tóc thủ công phối chế từng mẻ nhỏ tại Hà Nội — gốc nước, gội sạch trong một lần.
          </p>
        </div>
        <p className="text-[0.625rem] uppercase tracking-editorial text-bone/35">
          © {new Date().getFullYear()} Morris Grooming Co.
        </p>
      </div>
    </div>

    {/* Cot form */}
    <div className="flex items-center justify-center px-6 py-24 lg:px-14">
      <motion.div
        initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.85, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-sm"
      >
        <Link
          to="/"
          className="mb-12 block font-display text-lg font-normal tracking-[0.32em] text-ink lg:hidden"
        >
          MORRIS
        </Link>

        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mt-5 font-display text-4xl font-normal leading-tight text-ink">
          {titleLines}
        </h1>
        {description && <p className="mt-4 text-sm leading-relaxed text-ink-muted">{description}</p>}

        <div className="mt-10">{children}</div>

        {footer && <div className="mt-9 text-center text-sm text-ink-muted">{footer}</div>}
      </motion.div>
    </div>
  </div>
);

const IMG_LOGIN = "https://picsum.photos/seed/morris-auth-login/1200/1600";
const IMG_REGISTER = "https://picsum.photos/seed/morris-auth-register/1200/1600";

/* --------------------------------- Dang nhap -------------------------------- */

const loginSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const login = useAuthStore((s) => s.login);
  const syncCart = useCartStore((s) => s.syncAfterLogin);
  const guestPayload = useCartStore((s) => s.guestPayload);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const user = await login(values, guestPayload());
      await syncCart();
      toast.success(`Chào mừng trở lại, ${user.name.split(" ").slice(-1)[0]}`);
      navigate(["admin", "staff"].includes(user.role) && redirect === "/" ? "/admin" : redirect, {
        replace: true,
      });
    } catch (err) {
      toast.error(err.message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Đăng nhập" noIndex />
      <AuthShell
        eyebrow="Tài khoản"
        titleLines="Đăng nhập"
        description="Theo dõi đơn hàng, lưu địa chỉ và danh sách yêu thích của bạn."
        image={IMG_LOGIN}
        footer={
          <>
            Chưa có tài khoản?{" "}
            <Link to="/dang-ky" className="text-ink underline underline-offset-4 hover:text-copper-dark">
              Đăng ký ngay
            </Link>
          </>
        }
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
          <Field label="Email" required error={form.formState.errors.email?.message}>
            <Input
              type="email"
              autoComplete="email"
              placeholder="email@cua-ban.com"
              {...form.register("email")}
            />
          </Field>

          <Field label="Mật khẩu" required error={form.formState.errors.password?.message}>
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...form.register("password")}
            />
          </Field>

          <div className="flex justify-end">
            <Link to="/quen-mat-khau" className="link-editorial text-ink-faint hover:text-ink">
              Quên mật khẩu?
            </Link>
          </div>

          <ButtonCTA type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
          </ButtonCTA>
        </form>

        {/* Tai khoan demo tu seed - go bo o ban production */}
        <div className="mt-8 rounded-md border border-dashed border-ink/15 p-4">
          <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Tài khoản dùng thử</p>
          <div className="mt-3 space-y-1.5 font-mono text-xs text-ink-muted">
            {[
              ["admin@morrisshop.vn", "admin123"],
              ["staff@morrisshop.vn", "staff123"],
              ["customer@morrisshop.vn", "customer123"],
            ].map(([email, password]) => (
              <button
                key={email}
                type="button"
                onClick={() => form.reset({ email, password })}
                className="block w-full text-left transition-colors hover:text-ink"
              >
                {email} / {password}
              </button>
            ))}
          </div>
        </div>
      </AuthShell>
    </>
  );
};

/* ---------------------------------- Dang ky --------------------------------- */

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Họ tên tối thiểu 2 ký tự"),
    email: z.string().trim().email("Email không hợp lệ"),
    phone: z
      .string()
      .trim()
      .regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ")
      .or(z.literal("")),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

export const RegisterPage = () => {
  const navigate = useNavigate();
  const registerUser = useAuthStore((s) => s.register);
  const syncCart = useCartStore((s) => s.syncAfterLogin);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async ({ confirmPassword: _ignored, ...values }) => {
    setSubmitting(true);
    try {
      const user = await registerUser(values);
      await syncCart();
      toast.success(`Chào mừng tới Morris, ${user.name.split(" ").slice(-1)[0]}`);
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Đăng ký" noIndex />
      <AuthShell
        eyebrow="Tài khoản mới"
        titleLines="Tạo tài khoản"
        description="Mất chưa tới một phút. Nhận ưu đãi riêng và theo dõi đơn hàng dễ dàng hơn."
        image={IMG_REGISTER}
        footer={
          <>
            Đã có tài khoản?{" "}
            <Link to="/dang-nhap" className="text-ink underline underline-offset-4 hover:text-copper-dark">
              Đăng nhập
            </Link>
          </>
        }
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Field label="Họ và tên" required error={form.formState.errors.name?.message}>
            <Input autoComplete="name" placeholder="Nguyễn Văn A" {...form.register("name")} />
          </Field>

          <Field label="Email" required error={form.formState.errors.email?.message}>
            <Input type="email" autoComplete="email" placeholder="email@cua-ban.com" {...form.register("email")} />
          </Field>

          <Field label="Số điện thoại" error={form.formState.errors.phone?.message} hint="Không bắt buộc">
            <Input autoComplete="tel" inputMode="tel" placeholder="0912345678" {...form.register("phone")} />
          </Field>

          <Field label="Mật khẩu" required error={form.formState.errors.password?.message}>
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="Tối thiểu 6 ký tự"
              {...form.register("password")}
            />
          </Field>

          <Field label="Nhập lại mật khẩu" required error={form.formState.errors.confirmPassword?.message}>
            <Input type="password" autoComplete="new-password" placeholder="••••••••" {...form.register("confirmPassword")} />
          </Field>

          <ButtonCTA type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
          </ButtonCTA>
        </form>
      </AuthShell>
    </>
  );
};

/* ------------------------------- Quen mat khau ------------------------------ */

export const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(z.object({ email: z.string().trim().email("Email không hợp lệ") })),
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }) => {
    setSubmitting(true);
    try {
      const res = await authApi.forgotPassword(email);
      setSent(true);
      // Khi chua cau hinh SMTP, server tra ve link de test o moi truong dev
      if (res.data?.devResetUrl) setDevLink(res.data.devResetUrl);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Quên mật khẩu" noIndex />
      <AuthShell
        eyebrow="Khôi phục"
        titleLines="Quên mật khẩu"
        description="Nhập email của bạn, chúng tôi sẽ gửi liên kết đặt lại mật khẩu có hiệu lực trong 15 phút."
        image={IMG_LOGIN}
        footer={
          <Link to="/dang-nhap" className="text-ink underline underline-offset-4 hover:text-copper-dark">
            ← Quay lại đăng nhập
          </Link>
        }
      >
        {sent ? (
          <div className="rounded-md bg-copper/10 p-6">
            <p className="text-sm leading-relaxed text-ink">
              Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi tới hộp thư của bạn.
            </p>
            {devLink && (
              <div className="mt-5 border-t border-copper/25 pt-4">
                <p className="text-[0.625rem] uppercase tracking-editorial text-copper-dark">
                  Chế độ dev — chưa cấu hình SMTP
                </p>
                <a
                  href={devLink}
                  className="mt-2 block break-all font-mono text-xs text-ink underline underline-offset-2"
                >
                  {devLink}
                </a>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
            <Field label="Email" required error={form.formState.errors.email?.message}>
              <Input type="email" autoComplete="email" placeholder="email@cua-ban.com" {...form.register("email")} />
            </Field>
            <ButtonCTA type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Đang gửi…" : "Gửi liên kết đặt lại"}
            </ButtonCTA>
          </form>
        )}
      </AuthShell>
    </>
  );
};

/* -------------------------------- Dat lai MK -------------------------------- */

const resetSchema = z
  .object({
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async ({ password }) => {
    setSubmitting(true);
    try {
      await authApi.resetPassword({ token, password });
      toast.success("Đặt lại mật khẩu thành công", { description: "Hãy đăng nhập bằng mật khẩu mới." });
      navigate("/dang-nhap", { replace: true });
    } catch (err) {
      toast.error(err.message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Đặt lại mật khẩu" noIndex />
      <AuthShell
        eyebrow="Khôi phục"
        titleLines="Đặt mật khẩu mới"
        description="Chọn một mật khẩu mạnh mà bạn chưa từng dùng ở nơi khác."
        image={IMG_REGISTER}
        footer={
          <Link to="/dang-nhap" className="text-ink underline underline-offset-4 hover:text-copper-dark">
            ← Quay lại đăng nhập
          </Link>
        }
      >
        {!token ? (
          <div className="rounded-md bg-red-700/8 p-6">
            <p className="text-sm text-ink">
              Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới.
            </p>
            <Button variant="outline" size="sm" className="mt-5" asChild>
              <Link to="/quen-mat-khau">Yêu cầu liên kết mới</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
            <Field label="Mật khẩu mới" required error={form.formState.errors.password?.message}>
              <Input type="password" autoComplete="new-password" {...form.register("password")} />
            </Field>
            <Field label="Nhập lại mật khẩu" required error={form.formState.errors.confirmPassword?.message}>
              <Input type="password" autoComplete="new-password" {...form.register("confirmPassword")} />
            </Field>
            <ButtonCTA type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Đang lưu…" : "Đặt lại mật khẩu"}
            </ButtonCTA>
          </form>
        )}
      </AuthShell>
    </>
  );
};

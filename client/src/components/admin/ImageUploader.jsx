import { useRef, useState } from "react";
import { UploadSimple, X, LinkSimple } from "@phosphor-icons/react";
import { toast } from "sonner";
import { uploadApi } from "@/services/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Tai anh len Cloudinary (hoac /uploads neu chua cau hinh Cloudinary).
 * Cung cho phep dan truc tiep URL anh co san.
 */
export const ImageUploader = ({ value = [], onChange, folder = "products", max = 8, className }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const handleFiles = async (files) => {
    if (!files?.length) return;
    const remaining = max - value.length;
    if (remaining <= 0) return toast.error(`Tối đa ${max} ảnh`);

    setUploading(true);
    try {
      const res = await uploadApi.images([...files].slice(0, remaining), folder);
      onChange([...value, ...res.data.urls]);
      toast.success(`Đã tải lên ${res.data.urls.length} ảnh`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (value.length >= max) return toast.error(`Tối đa ${max} ảnh`);
    onChange([...value, url]);
    setUrlInput("");
  };

  const removeAt = (index) => onChange(value.filter((_, i) => i !== index));

  /** Anh dau tien la anh dai dien - cho phep dua len dau danh sach */
  const makePrimary = (index) => {
    const next = [...value];
    const [item] = next.splice(index, 1);
    onChange([item, ...next]);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((url, i) => (
            <li key={`${url}-${i}`} className="group relative aspect-[4/5] overflow-hidden rounded-sm bg-bone-warm">
              <img src={url} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-ink px-2 py-0.5 text-[0.5625rem] uppercase tracking-wider text-bone">
                  Ảnh chính
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/55 opacity-0 transition-opacity duration-400 group-hover:opacity-100">
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => makePrimary(i)}
                    className="rounded-full bg-bone px-2.5 py-1 text-[0.5625rem] uppercase tracking-wider text-ink"
                  >
                    Đặt chính
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label="Xoá ảnh"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-bone text-ink transition-colors hover:bg-red-700 hover:text-white"
                >
                  <X size={12} weight="light" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="flex flex-col items-center justify-center rounded-md border border-dashed border-ink/20 px-6 py-8 text-center transition-colors duration-400 hover:border-ink/40"
      >
        <UploadSimple size={20} weight="light" className="text-ink-faint" />
        <p className="mt-3 text-sm text-ink-muted">
          Kéo thả ảnh vào đây hoặc{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-ink underline underline-offset-4"
          >
            chọn tệp
          </button>
        </p>
        <p className="mt-1.5 text-xs text-ink-faint">
          JPG, PNG, WEBP — tối đa 5MB mỗi ảnh, {max} ảnh ({value.length}/{max})
        </p>
        {uploading && <p className="mt-3 text-xs text-copper-dark">Đang tải lên…</p>}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="flex items-end gap-3">
        <div className="relative flex-1">
          <LinkSimple
            size={14}
            weight="light"
            className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="Hoặc dán URL ảnh có sẵn"
            className="h-10 pl-6 text-xs"
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addUrl}>
          Thêm
        </Button>
      </div>
    </div>
  );
};

export default ImageUploader;

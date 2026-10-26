import { MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/display";
import { Input } from "@/components/ui/input";

/** Khung bang du lieu dung chung cho cac trang quan tri */
export const AdminTable = ({ columns, rows, isLoading, empty, rowKey = (r) => r._id, className }) => (
  <div className={cn("bezel", className)}>
    <div className="bezel-core overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse text-sm">
          <thead className="border-b border-ink/10 bg-ink/[0.02]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-5 py-3.5 text-left text-[0.625rem] font-medium uppercase tracking-editorial text-ink-faint",
                    col.align === "right" && "text-right",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/[0.07]">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-4">
                      <Skeleton className="h-4 w-full max-w-[10rem]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-20 text-center">
                  <p className="font-display text-xl text-ink">{empty?.title || "Chưa có dữ liệu"}</p>
                  {empty?.description && (
                    <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">{empty.description}</p>
                  )}
                  {empty?.action && <div className="mt-6">{empty.action}</div>}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)} className="transition-colors duration-300 hover:bg-ink/[0.02]">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-5 py-4 align-middle", col.align === "right" && "text-right", col.cellClassName)}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

/** Thanh cong cu: o tim kiem + cac bo loc phu */
export const AdminToolbar = ({ search, onSearch, placeholder = "Tìm kiếm…", children, className }) => (
  <div className={cn("flex flex-wrap items-end gap-4 pb-6", className)}>
    <div className="relative min-w-[14rem] flex-1">
      <MagnifyingGlass
        size={15}
        weight="light"
        className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-ink-faint"
      />
      <Input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder}
        className="h-11 pl-7"
      />
    </div>
    {children}
  </div>
);

export default AdminTable;

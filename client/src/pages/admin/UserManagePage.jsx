import { useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { LockSimple, LockSimpleOpen, Trash, ShieldCheck } from "@phosphor-icons/react";
import { toast } from "sonner";
import { userApi } from "@/services/api";
import { formatDate, initials, ROLE_LABELS } from "@/lib/utils";
import { useAuth, useDebounce } from "@/hooks";
import { Pagination } from "@/components/common";
import { AdminPageHeader } from "./AdminLayout";
import { AdminTable, AdminToolbar } from "@/components/admin/AdminTable";
import { Avatar, AvatarFallback, AvatarImage, Badge } from "@/components/ui/display";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/controls";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/overlay";

export const UserManagePage = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const debouncedSearch = useDebounce(search, 350);

  const params = {
    page,
    limit: 15,
    search: debouncedSearch || undefined,
    role: role === "all" ? undefined : role,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => userApi.list(params),
    placeholderData: keepPreviousData,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const changeRole = async (user, nextRole) => {
    try {
      await userApi.update(user._id, { role: nextRole });
      toast.success(`Đã đổi quyền của ${user.name} thành ${ROLE_LABELS[nextRole]}`);
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleBlock = async (user) => {
    try {
      await userApi.setBlocked(user._id, !user.isBlocked);
      toast.success(user.isBlocked ? "Đã mở khoá tài khoản" : "Đã khoá tài khoản");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmDelete = async () => {
    try {
      await userApi.remove(deleting._id);
      toast.success("Đã xoá người dùng");
      setDeleting(null);
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      key: "user",
      header: "Người dùng",
      render: (user) => (
        <div className="flex items-center gap-3.5">
          <Avatar className="h-9 w-9">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm text-ink">
              {user.name}
              {String(user._id) === String(currentUser?._id) && (
                <span className="ml-2 text-[0.625rem] uppercase tracking-wider text-copper-dark">bạn</span>
              )}
            </p>
            <p className="truncate text-xs text-ink-faint">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Điện thoại",
      render: (user) => <span className="text-sm text-ink-muted">{user.phone || "—"}</span>,
    },
    {
      key: "addresses",
      header: "Địa chỉ",
      align: "right",
      render: (user) => (
        <span className="text-sm tabular-nums text-ink-muted">{user.addresses?.length || 0}</span>
      ),
    },
    {
      key: "joined",
      header: "Tham gia",
      render: (user) => <span className="text-xs text-ink-faint">{formatDate(user.createdAt)}</span>,
    },
    {
      key: "role",
      header: "Phân quyền",
      render: (user) =>
        user.role === "admin" ? (
          <Badge variant="copper">
            <ShieldCheck size={11} weight="light" /> {ROLE_LABELS.admin}
          </Badge>
        ) : (
          <Select value={user.role} onValueChange={(v) => changeRole(user, v)}>
            <SelectTrigger className="h-8 w-36 border-b-0 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">{ROLE_LABELS.customer}</SelectItem>
              <SelectItem value="staff">{ROLE_LABELS.staff}</SelectItem>
              <SelectItem value="admin">{ROLE_LABELS.admin}</SelectItem>
            </SelectContent>
          </Select>
        ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (user) => (
        <Badge variant={user.isBlocked ? "danger" : "success"}>
          {user.isBlocked ? "Đã khoá" : "Hoạt động"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (user) => {
        const isSelf = String(user._id) === String(currentUser?._id);
        const isAdmin = user.role === "admin";
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isSelf || isAdmin}
              onClick={() => toggleBlock(user)}
              aria-label={user.isBlocked ? "Mở khoá tài khoản" : "Khoá tài khoản"}
            >
              {user.isBlocked ? (
                <LockSimpleOpen size={15} weight="light" />
              ) : (
                <LockSimple size={15} weight="light" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isSelf || isAdmin}
              onClick={() => setDeleting(user)}
              aria-label="Xoá người dùng"
              className="hover:text-red-700"
            >
              <Trash size={15} weight="light" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Người dùng"
        description="Phân quyền nhân viên và quản lý trạng thái tài khoản. Không thể khoá hoặc xoá tài khoản quản trị viên."
      />

      <AdminToolbar search={search} onSearch={setSearch} placeholder="Tìm theo tên, email, số điện thoại…">
        <Select
          value={role}
          onValueChange={(v) => {
            setRole(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Phân quyền" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="customer">{ROLE_LABELS.customer}</SelectItem>
            <SelectItem value="staff">{ROLE_LABELS.staff}</SelectItem>
            <SelectItem value="admin">{ROLE_LABELS.admin}</SelectItem>
          </SelectContent>
        </Select>
      </AdminToolbar>

      <AdminTable
        columns={columns}
        rows={data?.data || []}
        isLoading={isLoading}
        empty={{ title: "Không tìm thấy người dùng nào" }}
      />

      {data?.meta?.totalPages > 1 && (
        <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} className="mt-10" />
      )}

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xoá người dùng này?</DialogTitle>
            <DialogDescription>
              Tài khoản “{deleting?.name}” sẽ bị xoá vĩnh viễn. Đơn hàng đã đặt vẫn được giữ lại trong hệ
              thống. Nếu chỉ muốn ngăn đăng nhập, hãy dùng chức năng khoá tài khoản.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Huỷ
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Xoá vĩnh viễn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagePage;

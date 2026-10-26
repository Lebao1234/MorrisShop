export const ok = (res, data, message = "Thành công", meta) =>
  res.status(200).json({ success: true, message, data, ...(meta ? { meta } : {}) });

export const created = (res, data, message = "Tạo mới thành công") =>
  res.status(201).json({ success: true, message, data });

export const noContent = (res, message = "Đã xoá") =>
  res.status(200).json({ success: true, message, data: null });

export const paginated = (res, items, { page, limit, total }, message = "Thành công") =>
  res.status(200).json({
    success: true,
    message,
    data: items,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasNext: page * limit < total,
    },
  });

export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = "Dữ liệu không hợp lệ", details) {
    return new ApiError(400, msg, details);
  }
  static unauthorized(msg = "Bạn chưa đăng nhập") {
    return new ApiError(401, msg);
  }
  static forbidden(msg = "Bạn không có quyền thực hiện hành động này") {
    return new ApiError(403, msg);
  }
  static notFound(msg = "Không tìm thấy tài nguyên") {
    return new ApiError(404, msg);
  }
  static conflict(msg = "Dữ liệu đã tồn tại") {
    return new ApiError(409, msg);
  }
  static tooMany(msg = "Quá nhiều yêu cầu, vui lòng thử lại sau") {
    return new ApiError(429, msg);
  }
  static internal(msg = "Lỗi hệ thống") {
    return new ApiError(500, msg);
  }
}

export default ApiError;

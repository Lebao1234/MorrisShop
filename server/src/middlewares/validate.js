import ApiError from "../utils/ApiError.js";

/**
 * validate({ body, query, params }) - moi key la mot Zod schema.
 * Ghi de giá trị da parse vao request de controller dung du lieu sach.
 */
export const validate = (schemas) => (req, _res, next) => {
  try {
    for (const key of ["body", "query", "params"]) {
      if (!schemas[key]) continue;
      const result = schemas[key].safeParse(req[key]);
      if (!result.success) {
        const details = result.error.issues.map((i) => ({
          field: i.path.join(".") || key,
          message: i.message,
        }));
        throw ApiError.badRequest(details[0]?.message || "Dữ liệu không hợp lệ", details);
      }
      if (key === "query") {
        // req.query la getter trong mot so phien ban express -> gan tung field
        req.validatedQuery = result.data;
        Object.defineProperty(req, "query", { value: result.data, writable: true, configurable: true });
      } else {
        req[key] = result.data;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

export default validate;

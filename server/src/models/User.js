import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    ward: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Vui lòng nhập họ tên"], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, minlength: 6, select: false },
    phone: { type: String, trim: true },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["customer", "staff", "admin"], default: "customer", index: true },
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: { type: String, default: null },
    refreshToken: { type: String, select: false, default: null },
    resetPasswordToken: { type: String, select: false, default: null },
    resetPasswordExpires: { type: Date, select: false, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Chi cho phep duy nhat 1 dia chi mac dinh
userSchema.pre("save", function normalizeAddresses(next) {
  if (this.isModified("addresses") && this.addresses?.length) {
    const defaults = this.addresses.filter((a) => a.isDefault);
    if (defaults.length === 0) this.addresses[0].isDefault = true;
    if (defaults.length > 1) {
      let seen = false;
      this.addresses.forEach((a) => {
        if (a.isDefault && seen) a.isDefault = false;
        if (a.isDefault) seen = true;
      });
    }
  }
  next();
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

userSchema.virtual("defaultAddress").get(function defaultAddress() {
  return this.addresses?.find((a) => a.isDefault) || this.addresses?.[0] || null;
});

export const User = mongoose.model("User", userSchema);
export default User;

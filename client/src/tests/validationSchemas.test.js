import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, changePasswordSchema } from "@/utils/validationSchemas";

describe("loginSchema", () => {
  it("accepts a valid login payload", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "secret" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "secret" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const base = { name: "Ada Lovelace", email: "ada@example.com", password: "password123" };

  it("accepts matching passwords", () => {
    const result = registerSchema.safeParse({ ...base, confirmPassword: "password123" });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...base, confirmPassword: "different" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toContain("confirmPassword");
  });

  it("rejects a password shorter than 6 characters", () => {
    const result = registerSchema.safeParse({ ...base, password: "123", confirmPassword: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = registerSchema.safeParse({ ...base, name: "A", confirmPassword: "password123" });
    expect(result.success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("rejects mismatched new passwords", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "old12345",
      newPassword: "new12345",
      confirmNewPassword: "different",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid change-password payload", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "old12345",
      newPassword: "new12345",
      confirmNewPassword: "new12345",
    });
    expect(result.success).toBe(true);
  });
});

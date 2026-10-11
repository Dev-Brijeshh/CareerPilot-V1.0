import { describe, it, expect, beforeEach } from "vitest";
import { tokenStorage, attachAuthToken, getErrorMessage } from "@/api/axios";

describe("tokenStorage", () => {
  beforeEach(() => localStorage.clear());

  it("returns null when no token is stored", () => {
    expect(tokenStorage.get()).toBeNull();
  });

  it("stores and retrieves a token", () => {
    tokenStorage.set("abc123");
    expect(tokenStorage.get()).toBe("abc123");
  });

  it("clears a stored token", () => {
    tokenStorage.set("abc123");
    tokenStorage.clear();
    expect(tokenStorage.get()).toBeNull();
  });
});

describe("attachAuthToken", () => {
  beforeEach(() => localStorage.clear());

  it("adds an Authorization header when a token exists", () => {
    tokenStorage.set("my-jwt");
    const config = attachAuthToken({ headers: {} });
    expect(config.headers.Authorization).toBe("Bearer my-jwt");
  });

  it("leaves headers untouched when there is no token", () => {
    const config = attachAuthToken({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });
});

describe("getErrorMessage", () => {
  it("prefers the backend's message field", () => {
    const error = { response: { data: { message: "Invalid email or password" } } };
    expect(getErrorMessage(error)).toBe("Invalid email or password");
  });

  it("gives a friendly message for network errors", () => {
    const error = { message: "Network Error" };
    expect(getErrorMessage(error)).toMatch(/reach the server/i);
  });

  it("falls back to the provided default", () => {
    const error = {};
    expect(getErrorMessage(error, "Custom fallback")).toBe("Custom fallback");
  });
});

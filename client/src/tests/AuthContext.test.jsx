import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { tokenStorage } from "@/api/axios";

vi.mock("@/api/auth", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
  },
}));

// Imported after the mock so it picks up the mocked implementation.
import { authApi } from "@/api/auth";

const TestConsumer = () => {
  const { user, isAuthenticated, initializing, login, register, logout } = useAuth();

  if (initializing) return <p>loading</p>;

  return (
    <div>
      <p data-testid="auth-state">{isAuthenticated ? "authenticated" : "anonymous"}</p>
      <p data-testid="user-name">{user?.name || "none"}</p>
      <button onClick={() => login({ email: "a@b.com", password: "secret" })}>Login</button>
      <button onClick={() => register({ name: "Ada", email: "a@b.com", password: "secret" })}>
        Register
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

const renderWithProvider = () =>
  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("starts as anonymous when there is no stored token", async () => {
    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous"));
  });

  it("logs in successfully and stores the token", async () => {
    authApi.login.mockResolvedValue({ data: { id: "1", name: "Ada Lovelace", token: "jwt-token" } });
    renderWithProvider();
    await waitFor(() => screen.getByText("Login"));

    await userEvent.click(screen.getByText("Login"));

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("user-name")).toHaveTextContent("Ada Lovelace");
    expect(tokenStorage.get()).toBe("jwt-token");
  });

  it("registers successfully and stores the token", async () => {
    authApi.register.mockResolvedValue({ data: { id: "2", name: "Ada", token: "new-token" } });
    renderWithProvider();
    await waitFor(() => screen.getByText("Register"));

    await userEvent.click(screen.getByText("Register"));

    await waitFor(() => expect(tokenStorage.get()).toBe("new-token"));
  });

  it("bootstraps the session from a stored token via /auth/me", async () => {
    tokenStorage.set("existing-token");
    authApi.me.mockResolvedValue({ data: { id: "1", name: "Returning User" } });

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("user-name")).toHaveTextContent("Returning User");
  });

  it("clears the token if the stored session is no longer valid", async () => {
    tokenStorage.set("stale-token");
    authApi.me.mockRejectedValue(new Error("401"));

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous"));
    expect(tokenStorage.get()).toBeNull();
  });

  it("clears user state on logout", async () => {
    authApi.login.mockResolvedValue({ data: { id: "1", name: "Ada", token: "jwt-token" } });
    authApi.logout.mockResolvedValue({});
    renderWithProvider();
    await waitFor(() => screen.getByText("Login"));
    await userEvent.click(screen.getByText("Login"));
    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("authenticated"));

    await userEvent.click(screen.getByText("Logout"));

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous"));
    expect(tokenStorage.get()).toBeNull();
  });
});

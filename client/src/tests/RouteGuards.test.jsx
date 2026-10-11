import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import PublicOnlyRoute from "@/components/layout/PublicOnlyRoute";

const mockUseAuth = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

const renderProtected = (initialEntries = ["/dashboard"]) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <p>Secret dashboard</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

const renderPublicOnly = () =>
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/dashboard" element={<p>Dashboard</p>} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <p>Login form</p>
            </PublicOnlyRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

describe("ProtectedRoute", () => {
  it("shows a spinner while auth is initializing", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, initializing: true });
    const { container } = renderProtected();
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.queryByText("Secret dashboard")).not.toBeInTheDocument();
  });

  it("redirects to /login when not authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, initializing: false });
    renderProtected();
    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Secret dashboard")).not.toBeInTheDocument();
  });

  it("renders the protected content when authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, initializing: false });
    renderProtected();
    expect(screen.getByText("Secret dashboard")).toBeInTheDocument();
  });
});

describe("PublicOnlyRoute", () => {
  it("redirects authenticated users away from /login", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, initializing: false });
    renderPublicOnly();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders the login form for anonymous users", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, initializing: false });
    renderPublicOnly();
    expect(screen.getByText("Login form")).toBeInTheDocument();
  });
});

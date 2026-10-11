const request = require("supertest");
const app = require("../app");
const User = require("../models/user");

const validUser = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  password: "password123",
};

describe("Auth: POST /api/auth/register", () => {
  it("registers a new user and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.email).toBe(validUser.email);
    // Password hash must never be returned to the client.
    expect(res.body.data.password).toBeUndefined();
  });

  it("rejects a duplicate email", async () => {
    await request(app).post("/api/auth/register").send(validUser);
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects a short password via the validator", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, email: "short@example.com", password: "123" });

    expect(res.status).toBe(400);
  });

  it("stores the password as a bcrypt hash, never plaintext", async () => {
    await request(app).post("/api/auth/register").send(validUser);
    const stored = await User.findOne({ email: validUser.email }).select("+password");

    expect(stored.password).not.toBe(validUser.password);
    expect(stored.password.startsWith("$2")).toBe(true); // bcrypt hash prefix
  });
});

describe("Auth: POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(validUser);
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("token");
  });

  it("rejects an incorrect password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: "wrongpassword" });

    expect(res.status).toBe(401);
  });

  it("rejects an unknown email without leaking whether it exists", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "password123" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });
});

describe("Protected routes", () => {
  it("blocks access without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("blocks access with a garbage token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });

  it("allows access with a valid token and returns the user", async () => {
    const registerRes = await request(app).post("/api/auth/register").send(validUser);
    const { token } = registerRes.body.data;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(validUser.email);
  });
});

describe("User profile: /api/users/profile", () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post("/api/auth/register").send(validUser);
    token = res.body.data.token;
  });

  it("fetches the profile", async () => {
    const res = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(validUser.name);
  });

  it("updates the name", async () => {
    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Ada L." });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Ada L.");
  });

  it("prevents changing to an email already in use", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Bob", email: "bob@example.com", password: "password123" });

    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "bob@example.com" });

    expect(res.status).toBe(400);
  });

  it("changes the password and allows login with the new one", async () => {
    const changeRes = await request(app)
      .put("/api/users/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: validUser.password, newPassword: "newpassword456" });
    expect(changeRes.status).toBe(200);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: "newpassword456" });
    expect(loginRes.status).toBe(200);
  });

  it("rejects a password change with the wrong current password", async () => {
    const res = await request(app)
      .put("/api/users/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "wrongpassword", newPassword: "newpassword456" });
    expect(res.status).toBe(400);
  });

  it("deletes the account", async () => {
    const res = await request(app)
      .delete("/api/users/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);

    const stillThere = await User.findOne({ email: validUser.email });
    expect(stillThere).toBeNull();
  });
});

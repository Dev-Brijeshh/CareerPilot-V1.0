const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

// Needed by generateToken()/authMiddleware even though we never hit a
// real Groq endpoint in tests (aiService is mocked per-suite).
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || "1h";
process.env.NODE_ENV = "test";

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  // Keep every test isolated by wiping all collections between tests.
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

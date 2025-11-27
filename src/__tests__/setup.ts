import 'reflect-metadata';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

/**
 * Connect to in-memory MongoDB before all tests
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

/**
 * Clear all collections after each test
 */
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

/**
 * Disconnect and stop MongoDB after all tests
 */
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


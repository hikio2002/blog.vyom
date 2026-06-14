import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in your .env file');
}

/** Global cache so Next.js hot-reload / serverless warm invocations reuse one connection */
declare global {
  var _mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      // Serverless: a small pool is plenty since each invocation is short-lived
      // and a too-large pool wastes time/connections on cold starts.
      maxPoolSize: 5,
      minPoolSize: 0,
      // Fail fast instead of hanging if Atlas is unreachable
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 30000,
      // Keep connections warm a bit longer across invocations
      maxIdleTimeMS: 60000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

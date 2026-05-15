import mongoose from 'mongoose';

let cachedConnection: any = null;

export const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('CRITICAL: MONGODB_URI is not defined in environment variables.');
    return;
  }

  try {
    // Disable buffering to fail fast if connection is not ready
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    cachedConnection = conn;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    cachedConnection = null;
  }
};

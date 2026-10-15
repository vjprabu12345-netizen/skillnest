import mongoose from 'mongoose';

// Disable operation buffering so requests immediately fall back to in-memory catalog instead of hanging for 10s if DB auth fails
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillnest';
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // Instead of completely crashing process in dev if user has slightly different URI, log warning
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;

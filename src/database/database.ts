import mongoose from 'mongoose';
import config from '../config/config';

class Database {
  private static instance: Database;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      await mongoose.connect(config.mongodb.uri);
      
      console.log(`✅ MongoDB connected successfully to ${config.env} database`);

      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️  MongoDB disconnected');
      });

      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB disconnected successfully');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
    }
  }

  public getConnection(): typeof mongoose {
    return mongoose;
  }
}

export default Database.getInstance(); 
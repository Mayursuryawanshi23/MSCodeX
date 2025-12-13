const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
  try {
    // Require a MongoDB URI for production deployments
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('✗ MONGODB_URI is not set. Please set MONGODB_URI in your .env file to connect to MongoDB Atlas.');
      process.exit(1);
    }

    // Default database name when none is provided in the connection string
    const defaultDbName = process.env.MONGODB_DBNAME || 'CodeIDE';

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: defaultDbName,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    // Connect to the provided MongoDB Atlas URI using the selected DB name
    await mongoose.connect(mongoURI, options);

    // Ensure the database exists by creating a lightweight init collection if necessary
    try {
      const db = mongoose.connection.db;
      const collName = '___init_collection';
      const existing = await db.listCollections({ name: collName }).next();
      if (!existing) {
        await db.createCollection(collName);
        // Insert a tiny doc and then remove it to ensure DB/collection creation
        await db.collection(collName).insertOne({ createdAt: new Date() });
        await db.collection(collName).deleteMany({});
      }
    } catch (innerErr) {
      // Non-fatal: log but don't exit; connection succeeded
      console.warn('⚠️  Warning while ensuring database creation:', innerErr.message);
    }

    console.log('✓ MongoDB connected successfully');
    console.log(`✓ Connected to database: ${defaultDbName}`);
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    console.error('\n📌 Connection String Troubleshooting:');
    console.error('   - Ensure MONGODB_URI is set in .env file');
    console.error('   - For MongoDB Atlas: Use mongodb+srv://username:password@cluster.mongodb.net');
    console.error('   - If your connection string does not include a DB name, this app will use the default DB `CodeIDE`');
    console.error('   - Password special chars must be URL-encoded (@ = %40)');
    process.exit(1);
  }
};

module.exports = connectDB;


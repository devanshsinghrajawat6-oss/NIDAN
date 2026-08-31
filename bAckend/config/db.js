const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📦 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.log('⚠️  Server will start without database. Add your current IP to MongoDB Atlas whitelist.');
        console.log('   Go to: https://cloud.mongodb.com → Network Access → Add Current IP Address');
        console.log('   Or add 0.0.0.0/0 to allow all IPs (development only).\n');
    }
};

module.exports = connectDB;

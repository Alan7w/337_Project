var mongoose = require('mongoose');

var connectDB = async function() {
    try {
        var conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tech_ecommerce', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
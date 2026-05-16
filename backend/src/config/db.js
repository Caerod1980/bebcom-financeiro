const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // ⭐ Mongoose 7 - opções simplificadas (useNewUrlParser e useUnifiedTopology são obsoletas)
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB conectado: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`❌ Erro ao conectar MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

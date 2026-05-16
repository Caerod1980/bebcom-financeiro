require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Entry = require('../models/Entry');

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany();
    await Entry.deleteMany();
    
    // Create admin user
    const admin = await User.create({
      name: 'Rodrigo Caetano',
      email: 'caerod@gmail.com',
      passwordHash: 'admin123',
      role: 'admin',
    });
    
    console.log('✅ Admin user created: caerod@gmail.com / admin123');
    
    // Create sample entries for May 2026
    const sampleEntries = [
      {
        type: 'income',
        date: new Date(2026, 4, 15),
        description: 'Venda Loja Física',
        amount: 8500,
        category: 'vendas_loja_fisica',
        channel: 'loja_fisica',
        paymentMethod: 'pix',
        dreGroup: 'receita_bruta',
        createdBy: admin._id,
      },
      {
        type: 'income',
        date: new Date(2026, 4, 15),
        description: 'Venda Delivery',
        amount: 3200,
        category: 'vendas_delivery',
        channel: 'bebcom_delivery',
        paymentMethod: 'pix',
        dreGroup: 'receita_bruta',
        createdBy: admin._id,
      },
      {
        type: 'expense',
        date: new Date(2026, 4, 10),
        description: 'Compras de Mercadorias',
        amount: 3500,
        category: 'compras_mercadorias',
        dreGroup: 'cmv',
        createdBy: admin._id,
      },
      {
        type: 'expense',
        date: new Date(2026, 4, 5),
        description: 'Aluguel',
        amount: 2000,
        category: 'aluguel',
        dreGroup: 'despesas_operacionais',
        createdBy: admin._id,
      },
      {
        type: 'expense',
        date: new Date(2026, 4, 20),
        description: 'Salários',
        amount: 3500,
        category: 'funcionarios',
        dreGroup: 'despesas_operacionais',
        createdBy: admin._id,
      },
    ];
    
    await Entry.insertMany(sampleEntries);
    console.log('✅ Sample entries created');
    
    console.log('🎉 Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();

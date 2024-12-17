const { Sequelize } = require('sequelize');

// Initialize Sequelize for SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/database.sqlite',
    logging: false,
});

// Test the database connection
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to SQLite has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
})();

// Synchronize models
(async () => {
    try {
        await sequelize.sync({ alter: true }); // Use { alter: true } for safe updates
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Error synchronizing models:', error);
    }
})();

module.exports = sequelize;

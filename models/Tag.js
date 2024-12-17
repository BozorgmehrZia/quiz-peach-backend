const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Tag = sequelize.define('Tag', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    question_number: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: false,
});

Tag.associate = (models) => {
    // A tag can have many questions
    Tag.hasMany(models.Question, {
        foreignKey: 'tag_id', // Foreign key in the Question model
        as: 'questions', // Optional alias for the relation
    });
};

module.exports = Tag;

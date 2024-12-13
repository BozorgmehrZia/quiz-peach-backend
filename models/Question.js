const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Tag = require('./Tag');

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    creator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    question: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    option1: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    option2: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    option3: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    option4: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    correct_option: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    level: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    answer_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    correct_answer_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    tag_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Tag,
            key: 'id',
        },
    }
}, {
    timestamps: false,
});

module.exports = Question;

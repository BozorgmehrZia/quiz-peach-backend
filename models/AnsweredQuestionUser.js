const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Question = require('./Question');
const User = require('./User');

const AnsweredQuestionUser = sequelize.define('AnsweredQuestionUser', {
    question_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Question,
            key: 'id',
        },
    },
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: User,
            key: 'id',
        },
    },
    answered_status: {
        type: DataTypes.ENUM,
        values: ['صحیح حل شده', 'غلط حل شده', 'حل نشده'], // Three possible options
        defaultValue: 'حل نشده', // Default to "Not answered"
    },
}, {
    timestamps: false,
});

module.exports = AnsweredQuestionUser;

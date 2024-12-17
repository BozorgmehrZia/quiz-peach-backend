const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Question = require('./Question');

const RelatedQuestion = sequelize.define('RelatedQuestion', {
    question_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Question,
            key: 'id',
        },
    },
    related_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Question,
            key: 'id',
        },
    },
}, {
    timestamps: false,
});

module.exports = RelatedQuestion;

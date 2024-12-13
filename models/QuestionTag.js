const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Question = require('./Question');
const Tag = require('./Tag');

const QuestionTag = sequelize.define('QuestionTag', {
    question_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Question,
            key: 'id',
        },
    },
    tag_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Tag,
            key: 'id',
        },
    },
}, {
    timestamps: false,
});

module.exports = QuestionTag;

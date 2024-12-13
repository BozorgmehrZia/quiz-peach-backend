const User = require('./User');
const Question = require('./Question');
const Tag = require('./Tag');
const RelatedQuestion = require('./RelatedQuestion');
const QuestionTag = require('./QuestionTag');
const AnsweredQuestionUser = require('./AnsweredQuestionUser');

// Relationships
User.hasMany(Question, { foreignKey: 'creator_id' });
Question.belongsTo(User, { foreignKey: 'creator_id' });

Question.belongsTo(Tag, { foreignKey: 'tag_id' });
Tag.hasMany(Question, { foreignKey: 'tag_id' });

Question.belongsToMany(Question, {
    through: RelatedQuestion,
    as: 'RelatedQuestions',
    foreignKey: 'question_id',
    otherKey: 'related_id',
});

User.belongsToMany(Question, { through: AnsweredQuestionUser, foreignKey: 'user_id' });
Question.belongsToMany(User, { through: AnsweredQuestionUser, foreignKey: 'question_id' });

module.exports = { User, Question, Tag, RelatedQuestion, QuestionTag, AnsweredQuestionUser };

const express = require('express');
const { Op, where } = require('sequelize');
const { Question, RelatedQuestion, Tag, AnsweredQuestionUser, User } = require('../models');
const authenticateUser = require('../middleware');

const router = express.Router();

/**
 * @swagger
 * /api/question:
 *   post:
 *     summary: Add a new question
 *     description: Add a new question to the database.
 *     tags:
 *       - Questions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               question:
 *                 type: string
 *               option1:
 *                 type: string
 *               option2:
 *                 type: string
 *               option3:
 *                 type: string
 *               option4:
 *                 type: string
 *               correct_option:
 *                 type: integer
 *               level:
 *                 type: string
 *               tag_name:
 *                 type: string
 *               related_ids:
 *                 type: array
 *     responses:
 *       201:
 *         description: Question created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error.
 */
router.post('/', authenticateUser, async (req, res) => {
    const {
        name,
        question,
        option1,
        option2,
        option3,
        option4,
        correct_option,
        level,
        tag_name,
        related_ids,
    } = req.body;

    const currentUserId = req.userId;

    try {
        // Validate the request body
        if (
            !name ||
            !question ||
            !option1 ||
            !option2 ||
            !option3 ||
            !option4 ||
            !correct_option ||
            !level ||
            !tag_name
        ) {
            return res.status(400).json({ error: 'All required fields must be provided.' });
        }

        // Validate the correct_option value
        if (![1, 2, 3, 4].includes(correct_option)) {
            return res
                .status(400)
                .json({ error: 'Correct option must be an integer between 1 and 4.' });
        }

        const tag = await Tag.findOne({ where: { name: tag_name } });
        if (!tag) {
            return res.status(404).json({ error: `Tag with name "${tag_name}" not found.` });
        }

        // Create the new question
        const newQuestion = await Question.create({
            creator_id: currentUserId,
            name: name,
            question: question,
            option1: option1,
            option2: option2,
            option3: option3,
            option4: option4,
            correct_option: correct_option,
            level: level,
            tag_id: tag.id
        });

        await tag.increment('question_number');

        // Handle related questions if provided
        if (related_ids && Array.isArray(related_ids)) {
            const relatedQuestionPromises = related_ids.map((relatedId) =>
                RelatedQuestion.create({
                    question_id: newQuestion.id,
                    related_id: relatedId,
                })
            );
            await Promise.all(relatedQuestionPromises);
        }

        res.status(201).json({
            message: 'Question created successfully.',
        });
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ error: 'Failed to create question.' });
    }
});

/**
 * @swagger
 * /api/question/answer:
 *   post:
 *     summary: Submit an answer for a question
 *     description: Allows a user to answer a question, updates the user's score if the answer is correct, and tracks answered questions.
 *     tags:
 *       - Questions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user answering the question
 *               question_id:
 *                 type: integer
 *                 description: ID of the question being answered
 *               option:
 *                 type: integer
 *                 description: The selected answer option (1-4)
 *     responses:
 *       200:
 *         description: Answer submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 correct:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Question or User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error.
 */
router.post('/answer', authenticateUser, async (req, res) => {
    let { question_id, option } = req.body;
    const user_id = req.userId;

    try {
        // Validate request body
        if (!question_id || !option) {
            return res.status(400).json({ error: 'user_id, question_id, and option are required.' });
        }
        option = parseInt(option)
        if (![1, 2, 3, 4].includes(option)) {
            return res.status(400).json({ error: 'Option must be an integer between 1 and 4.' });
        }

        // Find the user
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ error: `User with ID ${user_id} not found.` });
        }

        // Find the question
        const question = await Question.findByPk(question_id);
        if (!question) {
            return res.status(404).json({ error: `Question with ID ${question_id} not found.` });
        }

        // Check if the answer is correct
        const isCorrect = question.correct_option === option;
        const answeredStatus = isCorrect ? 'صحیح حل شده' : 'غلط حل شده';

        // Update question statistics
        await question.increment('answer_count');
        if (isCorrect) {
            await question.increment('correct_answer_count');
        }

        // Check if the question has already been answered by the user
        const existingRecord = await AnsweredQuestionUser.findOne({
            where: { user_id, question_id },
        });

        if (existingRecord) {
            return res.status(400).json({
                error: 'This question has already been answered by the user.',
            });
        }

        // Record the user's answer
        await AnsweredQuestionUser.create({
            user_id: user_id,
            question_id: question_id,
            answered_status: answeredStatus,
        });

        // Update user score if correct
        if (isCorrect) {
            await user.increment('score');
        }

        res.status(200).json({
            correct: isCorrect,
            message: isCorrect ? 'Correct answer!' : 'Incorrect answer.',
        });
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({ error: 'Failed to submit answer.' });
    }
});

/**
 * @swagger
 * /api/question/{id}/details:
 *   get:
 *     summary: Get question details
 *     description: Fetch the details of a question by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     tags:
 *       - Questions
 *     responses:
 *       200:
 *         description: Question details fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 creator_id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 question:
 *                   type: string
 *                 option1:
 *                   type: string
 *                 option2:
 *                   type: string
 *                 option3:
 *                   type: string
 *                 option4:
 *                   type: string
 *                 correct_option:
 *                   type: integer
 *                 level:
 *                   type: string
 *                 answer_count:
 *                   type: integer
 *                 correct_answer_count:
 *                   type: integer
 *       404:
 *         description: Question not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error.
 */
router.get('/:id/details', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId

        // Find the question by ID
        const question = await Question.findByPk(id, {
            include: [{ model: Tag }] // Assume Tag has been defined in your relationships
        });

        // If the question doesn't exist, return 404
        if (!question) {
            return res.status(404).json({ error: 'Question not found.' });
        }

        const answered = await AnsweredQuestionUser.findOne({
            where: {
                user_id: userId, // Specify the userId
                question_id: id, // Assuming 'id' is the questionId you want to check
            },
        });

        
        const responseData = {
            ...question.dataValues, // Spread the question properties
            answered: answered, // Add answered status (true if exists, false otherwise)
        };

        // Return the question details
        res.status(200).json(responseData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch question details.' });
    }
});

/**
 * @swagger
 * /api/question/{id}/similar:
 *   get:
 *     summary: Fetch questions by the same owner as a specific question
 *     description: Returns all questions created by the owner of the question specified by its ID in the URL.
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the question.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of questions by the same owner.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Sample Question"
 *                   tag:
 *                     type: string
 *                     example: "Sports"
 *       404:
 *         description: Question not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:id/similars', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params; // ID of the reference question

        // Step 1: Find the question by ID to get its owner
        const referenceQuestion = await Question.findByPk(id);
        if (!referenceQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const ownerId = referenceQuestion.creator_id;

        // Step 2: Find all questions by the same owner
        const questions = await Question.findAll({
            where: { creator_id: ownerId },
            include: [{ model: Tag }]
        });

        return res.status(200).json(questions);
    } catch (error) {
        console.error('Error fetching questions by owner:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/question:
 *   get:
 *     summary: Get filtered list of questions
 *     description: Fetch a list of questions with optional filters for level and answered status.
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: query
 *         name: level
 *         required: false
 *         schema:
 *           type: string
 *           enum: [متوسط, دشوار, ساده]
 *         description: The difficulty level of the question.
 *       - in: query
 *         name: answeredStatus
 *         required: false
 *         schema:
 *           type: string
 *           enum: [صحیح حل شده, غلط حل شده, حل نشده]
 *         description: The answered status of the question for a specific user.
 *     responses:
 *       200:
 *         description: List of filtered questions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   creator_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   question:
 *                     type: string
 *                   option1:
 *                     type: string
 *                   option2:
 *                     type: string
 *                   option3:
 *                     type: string
 *                   option4:
 *                     type: string
 *                   correct_option:
 *                     type: integer
 *                   level:
 *                     type: string
 *                   answer_count:
 *                     type: integer
 *                   correct_answer_count:
 *                     type: integer
 *       400:
 *         description: Invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error.
 */
router.get('/', authenticateUser, async (req, res) => {
    try {
        const { name, level, answeredStatus } = req.query;

        // Build the filter criteria
        let filters = {};

        if (name) {
            filters.name = {
                [Op.like]: `%${name}%`, // Partial match for the name
            };
        }

        if (level) {
            filters.level = level;  // Filter by level if provided
        }

        // If answeredStatus is provided, join AnsweredQuestionUser table and filter by answered status
        if (answeredStatus) {
            filters['$AnsweredQuestionUser.answered_status$'] = answeredStatus;
        }

        // Fetch the questions with the applied filters, including join with AnsweredQuestionUser to check the answered status
        const questions = await Question.findAll({
            where: filters,
            include: [{
                model: AnsweredQuestionUser,
                required: false, // Make it a left join (to include questions even if the user hasn't answered)
            },
            { model: Tag }
            ],
        });

        // Return the filtered questions with only the selected fields
        const formattedQuestions = questions.map(question => ({
            id: question.id,
            name: question.name,
            level: question.level,
            tag: question.Tag.name,  // Assuming tag is a field in the Question model
        }));

        res.status(200).json(formattedQuestions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch questions.' });
    }
});

module.exports = router;
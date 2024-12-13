const express = require('express');
const { Op } = require('sequelize');
const { Question } = require('../models');

const router = express.Router();

/**
 * @swagger
 * /api/question:
 *   post:
 *     summary: Add a new question
 *     description: Add a new question to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tag1
 *     responses:
 *       201:
 *         description: Tag created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 question_number:
 *                   type: integer
 *       400:
 *         description: Validation or duplication error.
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
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;

        // Validate the request body
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: 'Name is required and must be a string.' });
        }

        // Check if the tag already exists
        const existingTag = await Tag.findOne({ where: { name } });
        if (existingTag) {
            return res.status(400).json({ error: 'Tag already exists.' });
        }

        // Create the new tag
        const tag = await Tag.create({ name });
        res.status(201).json(tag);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create tag' });
    }
});

/**
 * @swagger
 * /api/question-details/{id}:
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
router.get('/question-details/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find the question by ID
        const question = await Question.findByPk(id);

        // If the question doesn't exist, return 404
        if (!question) {
            return res.status(404).json({ error: 'Question not found.' });
        }

        // Return the question details
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch question details.' });
    }
});



/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Get filtered list of questions
 *     description: Fetch a list of questions with optional filters for level and answered status.
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
router.get('/questions', async (req, res) => {
    try {
        const { level, answeredStatus } = req.query;

        // Build the filter criteria
        let filters = {};

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
            include: {
                model: AnsweredQuestionUser,
                required: false, // Make it a left join (to include questions even if the user hasn't answered)
            },
        });

        // Return the filtered questions with only the selected fields
        const formattedQuestions = questions.map(question => ({
            name: question.name,
            level: question.level,
            tag: question.tag,  // Assuming tag is a field in the Question model
        }));

        res.status(200).json(formattedQuestions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch questions.' });
    }
});

module.exports = router;
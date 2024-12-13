CREATE TABLE
    `RelatedQuestions` (
        `question_id` INTEGER NOT NULL REFERENCES `Questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
        `related_id` INTEGER NOT NULL REFERENCES `Questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE (`question_id`, `related_id`),
        PRIMARY KEY (`question_id`, `related_id`)
    );

CREATE TABLE
    `QuestionTags` (
        `question_id` INTEGER NOT NULL REFERENCES `Questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
        `tag_id` INTEGER NOT NULL REFERENCES `Tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE (`question_id`, `tag_id`),
        PRIMARY KEY (`question_id`, `tag_id`)
    );

CREATE TABLE
    `Users` (
        `id` INTEGER PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL UNIQUE,
        `email` VARCHAR(255) NOT NULL UNIQUE,
        `password` VARCHAR(255) NOT NULL,
        `score` INTEGER DEFAULT 0
    );

CREATE TABLE
    `Tags` (
        `id` INTEGER PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL UNIQUE,
        `question_number` INTEGER DEFAULT 0
    );

CREATE TABLE
    `Questions` (
        `id` INTEGER PRIMARY KEY,
        `creator_id` INTEGER NOT NULL REFERENCES `Users` (`id`),
        `name` VARCHAR(255) NOT NULL,
        `question` TEXT NOT NULL,
        `option1` TEXT NOT NULL,
        `option2` TEXT NOT NULL,
        `option3` TEXT NOT NULL,
        `option4` TEXT NOT NULL,
        `level` TEXT NOT NULL DEFAULT 'ساده',
        `correct_option` INTEGER NOT NULL,
        `answer_count` INTEGER DEFAULT '0',
        `correct_answer_count` INTEGER DEFAULT '0',
        `tag_id` INTEGER NOT NULL REFERENCES `Tags` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
    );

CREATE TABLE
    `AnsweredQuestionUsers` (
        `question_id` INTEGER NOT NULL UNIQUE REFERENCES `Questions` (`id`),
        `user_id` INTEGER NOT NULL UNIQUE REFERENCES `Users` (`id`),
        `answered_status` TEXT NOT NULL,
        PRIMARY KEY (`question_id`, `user_id`)
    );
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "AnsweredQuestionUsers" (
	"question_id"	INTEGER NOT NULL UNIQUE,
	"user_id"	INTEGER NOT NULL UNIQUE,
	"answered_status"	TEXT NOT NULL,
	PRIMARY KEY("question_id","user_id"),
	FOREIGN KEY("question_id") REFERENCES "Questions"("id"),
	FOREIGN KEY("user_id") REFERENCES "Users"("id")
);
CREATE TABLE IF NOT EXISTS "Questions" (
	"id"	INTEGER,
	"creator_id"	INTEGER NOT NULL,
	"name"	VARCHAR(255) NOT NULL,
	"question"	TEXT NOT NULL,
	"option1"	TEXT NOT NULL,
	"option2"	TEXT NOT NULL,
	"option3"	TEXT NOT NULL,
	"option4"	TEXT NOT NULL,
	"correct_option"	INTEGER NOT NULL,
	"level"	TEXT DEFAULT 'ساده',
	"answer_count"	INTEGER DEFAULT '0',
	"correct_answer_count"	INTEGER DEFAULT '0',
	"tag_id"	INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY("creator_id") REFERENCES "Users"("id"),
	FOREIGN KEY("tag_id") REFERENCES "Tags"("id") ON DELETE NO ACTION ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "RelatedQuestions" (
	"question_id"	INTEGER NOT NULL,
	"related_id"	INTEGER NOT NULL,
	UNIQUE("question_id","related_id"),
	PRIMARY KEY("question_id","related_id"),
	FOREIGN KEY("question_id") REFERENCES "Questions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY("related_id") REFERENCES "Questions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Tags" (
	"id"	INTEGER,
	"name"	VARCHAR(255) NOT NULL UNIQUE,
	"question_number"	INTEGER DEFAULT 0,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "Users" (
	"id"	INTEGER,
	"name"	VARCHAR(255) NOT NULL UNIQUE,
	"email"	VARCHAR(255) NOT NULL UNIQUE,
	"password"	VARCHAR(255) NOT NULL,
	"score"	INTEGER DEFAULT 0,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "Users_backup" (
	"id"	INTEGER,
	"name"	VARCHAR(255) NOT NULL UNIQUE,
	"email"	VARCHAR(255) NOT NULL UNIQUE,
	"password"	VARCHAR(255) NOT NULL,
	"score"	INTEGER DEFAULT '0',
	PRIMARY KEY("id")
);
COMMIT;

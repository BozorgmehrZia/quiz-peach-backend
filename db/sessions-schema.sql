BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "sessions" (
	"sid"	,
	"expired"	,
	"sess"	,
	PRIMARY KEY("sid")
);
COMMIT;

CREATE TABLE "Hotels" (
	"hotel_id"	INTEGER,
	"name"	TEXT,
	"location"	TEXT UNIQUE,
	"amenities"	TEXT,
	"room_size"	NUMERIC,
	"checkin_time"	INTEGER,
	"checkout_time"	INTEGER,
	"rate_per_day"	NUMERIC,
	"images"	INTEGER,
	"reserved"	INTEGER,
	"lat"	REAL,
	"lng"	REAL,
	PRIMARY KEY("hotel_id", AUTOINCREMENT)
);

CREATE TABLE "Users" (
	"user_id"	INTEGER,
	"first_name"	TEXT,
	"last_name"	TEXT,
	"username"	TEXT UNIQUE,
	"password"	TEXT,
	"email"	TEXT UNIQUE,
	PRIMARY KEY("user_id", AUTOINCREMENT)
);

CREATE TABLE "Reservations" (
	"reservation_id"	INTEGER,
	"user_id"	INTEGER,
	"hotel_id"	INTEGER,
	"checkin_time"	TEXT,
	"checkout_time"	TEXT,
	FOREIGN KEY("hotel_id") REFERENCES "Hotels"("hotel_id"),
	FOREIGN KEY("user_id") REFERENCES "Users"("user_id"),
	PRIMARY KEY("reservation_id", AUTOINCREMENT)
);
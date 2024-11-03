-- Enable foreign key support
PRAGMA foreign_keys = ON;

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    favoriteBook TEXT
);

CREATE TABLE posts (
    id INTEGER PRIMARY KEY,
    authorId INTEGER NOT NULL,
    title TEXT,
    content TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT,
    FOREIGN KEY (authorId) REFERENCES users(id)
);

CREATE TABLE sessions (
    id INTEGER PRIMARY KEY,
    userId INTEGER NOT NULL,
    token TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
);

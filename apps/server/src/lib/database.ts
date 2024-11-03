import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import * as path from 'node:path';
import bcrypt from 'bcrypt';
import { appLog, dbLog } from './logger';

export const sqlite = () =>
  open({
    filename: 'database.sqlite',
    driver: sqlite3.Database,
  });

export const runDbStmt = (stmt: string, params: unknown[] = []) =>
  sqlite().then((db) => db.run(stmt, params));
export const getDbRows = (stmt: string, params: unknown[] = []) =>
  sqlite().then((db) => db.all(stmt, params));

export const migrateDb = () =>
  sqlite().then((db) =>
    db.migrate({
      migrationsPath: path.resolve(__dirname, '..', 'migrations'),
    }),
  );

export const verifyTestData = async () => {
  dbLog('Verifying test data...');
  const testUser = {
    username: 'testuser',
    password: 'testpassword',
  };

  const rows = await getDbRows('SELECT * FROM users');
  const containsTestUser = rows.some(
    (row) => row.username === testUser.username,
  );

  if (!containsTestUser) {
    appLog('Creating test user in database for e2e tests...');

    await runDbStmt('INSERT INTO users (username, password) VALUES (?, ?)', [
      testUser.username,
      bcrypt.hashSync(testUser.password, 10),
    ]);

    appLog(
      'Test user created successfully. Username: testuser, Password: testpassword',
    );
    return;
  }

  appLog(
    'Test data ready for e2e tests. Username: testuser, Password: testpassword',
  );
};

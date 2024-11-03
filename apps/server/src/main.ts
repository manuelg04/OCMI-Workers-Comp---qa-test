import {
  appLog,
  dbLog,
  makeExpressApp,
  migrateDb,
  sqlite,
  verifyTestData,
} from './lib';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = makeExpressApp();

app.listen(port, host, () => {
  appLog(`Server started on http://${host}:${port}`);

  sqlite()
    .then(() => dbLog('Database initialized, verifying migrations...'))
    .then(() => migrateDb())
    .then(() => dbLog('Migrations up to date'))
    .then(() => verifyTestData());
});

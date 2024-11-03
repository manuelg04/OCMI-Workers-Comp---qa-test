export const logger = (message: string, module: 'app' | 'database' = 'app') => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  console.log(`[ ${module} ] ${message}`);
};

export const appLog = (...message: (string | object)[]) =>
  message.forEach((m) =>
    logger(typeof m === 'object' ? JSON.stringify(m) : m, 'app'),
  );

export const dbLog = (...message: (string | object)[]) =>
  message.forEach((m) =>
    logger(typeof m === 'object' ? JSON.stringify(m) : m, 'database'),
  );

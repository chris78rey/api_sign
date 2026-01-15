import express from 'express';

import { errorMiddleware } from './middlewares/error.middleware';
import { buildRouter } from './routes';

const app = express();

app.use(express.json());
app.use(buildRouter());
app.use(errorMiddleware);

export default app;

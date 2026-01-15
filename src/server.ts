import dotenv from 'dotenv';

dotenv.config();

import './types/express';
import app from './app';

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`listening on :${port}`);
});

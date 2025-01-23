import express from 'express';
import cors from 'cors';
import { setupRoutes } from './routes';

const app = express();
app.use(cors());
setupRoutes(app);
app.listen(8080, () => {
  console.log('server listening on port 8080');
});

import express from 'express';
import cors from 'cors';
import Redis from 'ioredis';
import path from 'node:path';

const redis = new Redis();

const app = express();
app.use(express.json());
app.use(cors());

// Serve the static files from the React app
const clientDir = path.join(__dirname, '../../client/dist');

app.get('/read', async (req, res) => {
  try {
    const cachedData = await redis.get(req.query.key as string);
    res.send((cachedData && JSON.parse(cachedData)) ?? {});
  } catch (e) {
    console.error(e);
    res.status(409).send(`failed to read data: ${(e as Error).message}`);
  }
});

app.post('/write', async (req, res) => {
  try {
    const { key, value } = req.body;
    await redis.set(key, JSON.stringify(value));
    res.send('data written');
  } catch (e) {
    console.error(e);
    res.status(409).send('failed to write data');
  }
});

app.use(express.static(clientDir));
// Handle requests by serving index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});
app.listen(8080, () => {
  console.log('server listening on port 8080');
});

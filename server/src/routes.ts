import { deletePlayer, fetchPlayersFromDb, fetchPlayerStatistics, savePlayer, savePlayerStatistics } from './db';
import { Express, json } from 'express';

export function setupRoutes(app: Express) {
  app.use(json());
  app.get('/', (_req, res) => res.send('statsoc server is running'));

  app.get('/players', (_req, res) => fetchPlayersFromDb().then(res.send.bind(res)));

  app.get('/stats', (req, res) => fetchPlayerStatistics(req.query['name'] as string).then(res.send.bind(res)));

  app.post('/players', (req, res) =>
    savePlayer(req.query['name'] as string)
      .then(() => res.send('player added'))
      .catch(() => res.status(409).send('failed to add player')),
  );

  app.post('/stats', (req, res) => {
    const { player, description, count } = req.body;
    savePlayerStatistics(player, description, count)
      .then(() => res.send('statistic added'))
      .catch(() => res.status(409).send('failed to add statistic'));
  });

  app.delete('/players/:name', (req, res) =>
    deletePlayer(req.params.name)
      .then(() => res.send('player deleted'))
      .catch(() => res.status(409).send('failed to delete player')),
  );
}

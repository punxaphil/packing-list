'use server';
import { Client } from 'pg';
import { getStatsSql, insertStatsSql, playersTableSql, statisticsTableSql } from './sql';
import { Player, Statistic } from './types';

async function getClient(): Promise<Client> {
  const client = new Client(process.env['POSTGRES_URL'] || 'postgresql://username:password@localhost:5432/packing-list');

  await client.connect();

  await client.query(playersTableSql);
  await client.query(statisticsTableSql);
  return client;
}

export async function fetchPlayersFromDb() {
  const client = await getClient();
  const sql = `SELECT name
               from players
               order by name`;

  const results = await client.query<Player>(sql);
  await client.end();
  return results.rows;
}

export async function savePlayer(name: string) {
  const client = await getClient();
  await client.query(
    `INSERT INTO players(name)
     VALUES ($1)`,
    [name],
  );
  await client.end();
}

export async function deletePlayer(name: string) {
  const client = await getClient();
  await client.query(
    `DELETE
     FROM players
     WHERE name = $1`,
    [name],
  );
  await client.end();
}

export async function fetchPlayerStatistics(name: string): Promise<Statistic[]> {
  const client = await getClient();
  const results = await client.query<Statistic>(getStatsSql, [name]);
  await client.end();
  return results.rows;
}

export async function savePlayerStatistics(player: string, description: string, count: number) {
  const client = await getClient();
  await client.query(insertStatsSql, [description, player, count]);
  await client.end();
}

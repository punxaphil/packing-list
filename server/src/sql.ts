export const playersTableSql = `CREATE TABLE IF NOT EXISTS players
                                (
                                    name TEXT UNIQUE
                                )`;
export const statisticsTableSql = `CREATE TABLE IF NOT EXISTS statistics
                                   (
                                       description TEXT,
                                       player      TEXT,
                                       count       INTEGER DEFAULT 0,
                                       FOREIGN KEY (player) REFERENCES players (name) ON DELETE CASCADE,
                                       UNIQUE (description, player)
                                   )
`;
export const insertStatsSql = `INSERT INTO statistics(description, player, count)
                               VALUES ($1, $2, $3)
                               ON CONFLICT (description, player) DO UPDATE SET description = $1,
                                                                               player      = $2,
                                                                               count       = $3`;
export const getStatsSql = `SELECT *
                            from statistics
                            WHERE player = $1`;

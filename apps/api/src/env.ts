import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

const envFileName =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env';

const envPathCandidates = [
  join(__dirname, '..', envFileName),
  join(__dirname, '..', '..', envFileName),
  join(process.cwd(), envFileName),
  join(process.cwd(), 'apps/api', envFileName),
];

config({
  path: envPathCandidates.find((path) => existsSync(path)),
});

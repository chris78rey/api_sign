import http from 'http';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

function readEnvKeys(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const keys: string[] = [];

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;

    const key = trimmed.slice(0, eq).trim();
    if (key) keys.push(key);
  }

  return keys;
}

async function httpGet(url: string): Promise<number> {
  return await new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: 2000 }, (res) => {
      res.resume();
      resolve(res.statusCode ?? 0);
    });

    req.on('timeout', () => {
      req.destroy(new Error('timeout'));
    });

    req.on('error', (err) => reject(err));
  });
}

async function main(): Promise<void> {
  const failures: string[] = [];

  const envExamplePath = path.join(process.cwd(), '.env.example');
  const envPath = path.join(process.cwd(), '.env');

  if (!fs.existsSync(envExamplePath)) {
    failures.push('Missing .env.example');
  }

  if (!fs.existsSync(envPath)) {
    failures.push('Missing .env');
  }

  if (fs.existsSync(envExamplePath) && fs.existsSync(envPath)) {
    const requiredKeys = readEnvKeys(envExamplePath);
    for (const key of requiredKeys) {
      if (!process.env[key]) {
        failures.push(`Missing ENV variable: ${key}`);
      }
    }
  }

  for (const dir of ['storage', 'src', 'prisma']) {
    if (!fs.existsSync(path.join(process.cwd(), dir))) {
      failures.push(`Missing directory: ${dir}`);
    }
  }

  try {
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
  } catch (err) {
    failures.push('Database check failed (Prisma cannot query)');
  }

  const sleep = async (ms: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  };

  try {
    const port = Number(process.env.PORT ?? 3000);

    let lastStatus = 0;
    let ok = false;

    for (let attempt = 0; attempt < 120; attempt += 1) {
      try {
        lastStatus = await httpGet(`http://localhost:${port}/health`);
        if (lastStatus === 200) {
          ok = true;
          break;
        }
      } catch {
        lastStatus = 0;
      }

      await sleep(250);
    }

    if (!ok) {
      failures.push(lastStatus ? `/health returned ${lastStatus}` : 'HTTP check failed (/health)');
    }
  } catch {
    failures.push('HTTP check failed (/health)');
  }

  const typecheck = spawnSync('npm', ['run', '-s', 'typecheck'], { encoding: 'utf8', shell: true });
  if (typecheck.status !== 0) {
    failures.push('Typecheck failed (tsc --noEmit)');
    const output = `${typecheck.stdout ?? ''}\n${typecheck.stderr ?? ''}`.trim();
    if (output) {
      failures.push(output);
    }
  }

  if (failures.length === 0) {
    process.stdout.write('HEALTH_OK\n');
    process.exit(0);
  }

  process.stderr.write('HEALTH_FAILED\n');
  for (const f of failures) {
    process.stderr.write(`- ${f}\n`);
  }
  process.exit(1);
}

main().catch(() => {
  process.stderr.write('HEALTH_FAILED\n');
  process.exit(1);
});

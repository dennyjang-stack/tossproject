import net from 'node:net';
import { spawn } from 'node:child_process';

const HOST = '127.0.0.1';
const PORT = 3000;

function assertPortIsAvailable() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();

    probe.once('error', () => {
      reject(new Error(`:${PORT} 포트가 이미 사용 중입니다. 기존 개발 서버를 종료한 뒤 다시 실행해 주세요.`));
    });

    probe.listen(PORT, HOST, () => {
      probe.close((error) => (error ? reject(error) : resolve()));
    });
  });
}

try {
  await assertPortIsAvailable();
} catch (error) {
  console.error(error instanceof Error ? error.message : '개발 서버를 시작할 수 없습니다.');
  process.exitCode = 1;
  process.exit();
}

const next = process.platform === 'win32' ? 'next.cmd' : 'next';
const server = spawn(next, ['dev', '-p', String(PORT)], {
  stdio: 'inherit',
  env: { ...process.env, NEXT_PUBLIC_API_MODE: 'stub' },
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => server.kill(signal));
}

server.once('exit', (code, signal) => {
  if (signal) {
    process.exit(0);
  }

  process.exit(code ?? 1);
});

#!/usr/bin/env node
import { spawn } from 'child_process';
import figlet from 'figlet';
import fs from 'fs';
import ora from 'ora';
import { Config } from './config';

ensureFolderExist('./data');
ensureFolderExist('./results');

export const AppConfig = Config.getInstance().init();

const count = AppConfig.data.MAX_USER_CREDENTIAL;

if (require.main === module) {
  figlet('P2PD Load Testing', async (err, data) => {
    if (err) {
      return;
    }
    const ALL_SCRIPTS = [
      'login.js',
      'create-post.js',
      'search-post.js',
      'create-order.js',
      'create-group-chat.js',
    ];

    const scriptsToRun = AppConfig.data.SCRIPTS || ALL_SCRIPTS;

    const enableInitData = (AppConfig.data.SCRIPTS || []).find((script) =>
      ALL_SCRIPTS.includes(script)
    );

    console.log('scriptsToRun: ', scriptsToRun);

    if (!enableInitData) {
      for (const script of scriptsToRun) {
        await runLoadTestScript(script);
      }
      return;
    }

    const spinner = ora({
      spinner: {
        interval: 120,
        frames: ['▹▹▹▹▹', '▸▹▹▹▹', '▹▸▹▹▹', '▹▹▸▹▹', '▹▹▹▸▹', '▹▹▹▹▸'],
      },
      text: 'Init loading data',
    });
    spinner.start();
    const init = spawn(
      'npx',
      [
        'ts-node',
        require.resolve('./init-load-test'),
        ...process.argv.slice(2),
      ],
      {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true,
      }
    );
    init.on('exit', async (code) => {
      if (code === 0) {
        spinner.succeed();
        for (const script of scriptsToRun) {
          await runLoadTestScript(script);
        }
      } else {
        spinner.fail();
        process.exit(code || 1);
      }
    });
  });
}

function runLoadTestScript(script: string): Promise<any> {
  const spinner = ora({
    spinner: {
      interval: 120,
      frames: ['▹▹▹▹▹', '▸▹▹▹▹', '▹▸▹▹▹', '▹▹▸▹▹', '▹▹▹▸▹', '▹▹▹▹▸'],
    },
    text: `RUN LOAD TEST SCRIPT: ${script}`,
  });
  spinner.start();

  const rawResultsFile = `${script}.${count}.summary.json`;

  return new Promise((resolve, reject) => {
    const loadTest = spawn(
      'k6',
      [
        'run',
        '--log-output=none',
        `./scripts/${script}`,
        `--summary-export=results/${rawResultsFile}`,
        // '--out',
        // `influxdb=http://localhost:8086/k6`,
        '-e',
        `USER_COUNT=${count}`,
        '-e',
        `LOGIN_TARGET=${AppConfig.data.LOGIN_TARGET}`,
        '-e',
        `CREATE_POST_TARGET=${AppConfig.data.CREATE_POST_TARGET}`,
        '-e',
        `SEARCH_POST_TARGET=${AppConfig.data.SEARCH_POST_TARGET}`,
        '-e',
        `CREATE_ORDER_TARGET=${AppConfig.data.CREATE_ORDER_TARGET}`,
        '-e',
        `CREATE_GROUP_CHAT_TARGET=${AppConfig.data.CREATE_GROUP_CHAT_TARGET}`,
        '-e',
        `LIST_ONLINE_POST_TARGET=${AppConfig.data.LIST_ONLINE_POST_TARGET}`,
      ],
      {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true,
      }
    );
    loadTest.on('exit', (code) => {
      if (code === 0) {
        spinner.succeed();
        resolve(code);
      } else {
        spinner.fail();
        resolve(code);
      }
    });
    loadTest.on('error', (err) => {
      spinner.fail();
      reject(err);
    });
  });
}

function ensureFolderExist(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

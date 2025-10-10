import app_root_path from 'app-root-path';
import { Command } from 'commander';
import dotenv from 'dotenv';
import dotenvParseVariables from 'dotenv-parse-variables';
import fs from 'fs';
import path from 'path';
import { ConfigOptions, EnvironmentVariables } from './types';
import { camelCase } from './utils/string';

export class Config {
  public get data(): EnvironmentVariables {
    return this._data;
  }

  public static getInstance(): Config {
    if (!Config._instance) {
      Config._instance = new Config();
    }
    return Config._instance;
  }
  private static _instance: Config;

  protected _data: EnvironmentVariables = {} as any;

  protected _commandLineOptions: ConfigOptions;

  public init(): Config {
    if (Object.keys(Config.getInstance()._data || {}).length) {
      return this;
    }
    Config.getInstance().loadConfiguration();
    const jsonFile = Config.getInstance().getConfigJsonFilePath();
    fs.writeFileSync(jsonFile, JSON.stringify(this._data), { flag: 'w' });
    return Config.getInstance();
  }

  public getResourceJsonFilePath() {
    return path.join(__dirname, `./data/resource.json`);
  }

  public getEndUserWithoutLoginJsonFilePath() {
    return path.join(
      __dirname,
      `./data/end-users-${Config.getInstance()._data.MAX_USER_CREDENTIAL}.json`,
    );
  }

  public getEndUserWithLoginJsonFilePath() {
    return path.join(
      __dirname,
      `./data/end-users-with-login-${
        Config.getInstance()._data.MAX_USER_CREDENTIAL
      }.json`,
    );
  }

  public getMerchantJsonFilePath() {
    return path.join(__dirname, `./data/merchants.json`);
  }

  public getConfigJsonFilePath() {
    return path.join(__dirname, `./data/config.json`);
  }

  protected loadConfiguration(): void {
    this.loadEnv();
    this.loadCustomConfiguration();
  }

  protected loadEnv(): void {
    const dotenvPath = path.join(
      process.cwd(),
      `.env${process.env.NODE_ENV === 'test' ? '.test' : ''}`,
    );
    const env = dotenv.config({ path: dotenvPath, override: true });
    if (!env.error) {
      this._data = dotenvParseVariables(
        env.parsed as dotenvParseVariables.Parsed,
      ) as unknown as EnvironmentVariables;
    }
  }

  protected loadCustomConfiguration(): void {
    const commandLineArguments = this.parseCommandLineArguments();
    this._commandLineOptions = commandLineArguments.opts<ConfigOptions>();

    Config.getInstance()._data['MAX_USER_CREDENTIAL'] =
      this.ensureValueNotNull<number>('MAX_USER_CREDENTIAL', this.parseInt);

    Config.getInstance()._data['API_URL'] =
      this.ensureValueNotNull<string>('API_URL');

    Config.getInstance()._data['BLOCKCHAIN_VCHAIN_RPC_URL'] =
      this.ensureValueNotNull<string>('BLOCKCHAIN_VCHAIN_RPC_URL');

    Config.getInstance()._data['LOGIN_TARGET'] =
      this.ensureValueNotNull<number>('LOGIN_TARGET', this.parseInt);

    Config.getInstance()._data['CREATE_POST_TARGET'] =
      this.ensureValueNotNull<number>('CREATE_POST_TARGET', this.parseInt);

    Config.getInstance()._data['SEARCH_POST_TARGET'] =
      this.ensureValueNotNull<number>('SEARCH_POST_TARGET', this.parseInt);

    Config.getInstance()._data['LIST_ONLINE_POST_TARGET'] =
      this.ensureValueNotNull<number>('LIST_ONLINE_POST_TARGET', this.parseInt);

    Config.getInstance()._data['CREATE_ORDER_TARGET'] =
      this.ensureValueNotNull<number>('CREATE_ORDER_TARGET', this.parseInt);

    Config.getInstance()._data['CREATE_GROUP_CHAT_TARGET'] =
      this.ensureValueNotNull<number>(
        'CREATE_GROUP_CHAT_TARGET',
        this.parseInt,
      );

    Config.getInstance()._data['SCRIPTS'] = this.ensureValueNotNull<string[]>(
      'SCRIPTS',
      this.parseStringToArray,
    );
  }

  protected parseCommandLineArguments(): Command {
    const packageJsonPathFileName = path.resolve(
      app_root_path.path,
      'package.json',
    );
    const packageJson = require(packageJsonPathFileName);

    const program = new Command()
      .name(packageJson.name)
      .description(packageJson.description)
      .version(packageJson.version)
      .option(
        '--api-url <api-url>',
        'Specify the prefix URI server which run testing',
        'http://localhost:1600',
      )
      .option(
        '--blockchain-vchain-rpc-url <vchain-rpc-url>',
        'Specify the Vchain RPC URI which this client will send request',
        'http://test.rpc.vcex.xyz/',
      )
      .option(
        '--max-user-credential <count>',
        'Specify the number of fake credentials evaluated, before interact with the server',
        this.parseInt,
        100,
      )
      .option(
        '--login-target <count>',
        'Specify the number of virtual users evaluated(size: sm), before login server',
        this.parseInt,
        1000,
      )
      .option(
        '--create-post-target <count>',
        'Specify the number of virtual users evaluated(size: sm), before create post',
        this.parseInt,
        1000,
      )
      .option(
        '--search-post-target <count>',
        'Specify the number of virtual users evaluated(size: sm), before search post',
        this.parseInt,
        1000,
      )
      .option(
        '--list-online-post-target <count>',
        'Specify the number of virtual users evaluated(size: sm), before list online post',
        this.parseInt,
        1000,
      )
      .option(
        '--max-end-user <count>',
        'Specify the number of virtual end users evaluated',
        this.parseInt,
        1000,
      )
      .option(
        '--create-order-target <count>',
        'Specify the number of virtual users evaluated, before create order',
        this.parseInt,
        1000,
      )
      .option(
        '--create-group-chat-target <count>',
        'Specify the number of virtual users evaluated, before create group chat',
        this.parseInt,
        500,
      )
      .option(
        '--scripts <script,script>',
        'Specify the scripts to test with k6',
        'login.js,create-post.js,search-post.js,create-order.js',
      );
    return program.parse();
  }

  protected parseInt(value?: string): number {
    if (!value) {
      throw new Error(`Invalid value number ${value}`);
    }
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
      throw new Error(`Invalid value number ${value}`);
    }
    return parsedValue;
  }

  protected ensureValueNotNull<T>(
    pattern: keyof EnvironmentVariables,
    fn?: (value?: any) => T,
  ): T {
    try {
      const value =
        (fn
          ? fn?.(this._commandLineOptions[camelCase(pattern)])
          : this._commandLineOptions[camelCase(pattern)]) ||
        (fn ? fn?.(process.env[pattern]) : process.env[pattern]) ||
        this._data[pattern];

      if (!value) {
        throw new Error(`Environment variable ${pattern} is not set.`);
      }
      return value as T;
    } catch (err) {
      throw new Error(`Environment variable ${pattern} is not set: ${err}`);
    }
  }

  protected parseStringToArray(
    input: string = '',
    seperator: string = ',',
  ): string[] {
    if (input) {
      return input.split(seperator);
    }
    return [];
  }
}

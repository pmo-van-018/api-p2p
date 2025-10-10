import { Command, Option } from 'commander';

export function parseCommandLineArguments(): Command {
  const packageJson = require('../package.json');
  const program = new Command()
    .name(packageJson.name)
    .description(packageJson.description)
    .version(packageJson.version)
    .addOption(
      new Option(
        '--chain-env <chain enviroment>',
        'Specify the chain enviroment that the serer will be run on.'
      ).choices(['mainnet', 'testnet'])
    )
    .option('--usdt-bsc-contract <contract>', 'Specify the contract address of USDT(BSC) on which server is using.')
    .option(
      '--rpc-bsc-url <rpc>',
      'Specify the rpc of chain BSC on which server is using. (Use comma "," to add more rpc)'
    )
    .option(
      '--explorer-bsc-url <rpc>',
      'Specify the explorer url of chain BSC on which server is using. (Use comma "," to add more explorer url)'
    )
    .option(
      '--usdt-polygon-contract <contract>',
      'Specify the contract address of USDT(Polygon) on which server is using.'
    )
    .option(
      '--rpc-polygon-url <rpc>',
      'Specify the rpc of chain Polygon on which server is using. (Use comma "," to add more rpc)'
    )
    .option(
      '--explorer-polygon-url <rpc>',
      'Specify the explorer url of chain Polygon on which server is using. (Use comma "," to add more explorer url)'
    )
    .option('--usdt-tron-contract <contract>', 'Specify the contract address of USDT(Tron) on which server is using.')
    .option(
      '--rpc-tron-url <rpc>',
      'Specify the rpc of chain Tron on which server is using. (Use comma "," to add more rpc)'
    )
    .option(
      '--explorer-tron-url <rpc>',
      'Specify the explorer url of chain Tron on which server is using. (Use comma "," to add more explorer url)'
    )
    .option(
      '--ignore-error <is-ignore-error>',
      'Specify whether the server is ignore error when setup chain before application is running',
      parseBoolean
    )
    .option(
      '--overwrite-contract <is-overwrite-contract>',
      'Specify the contract address will be overwritten.',
      parseBoolean
    )
    .option(
      '--load-remote <is-load-remote>',
      'Specify whether the server is fetching chains data in remote.',
      parseBoolean
    );
  return program.parse();
}

function parseBoolean(v: string) {
  return v === 'true';
}

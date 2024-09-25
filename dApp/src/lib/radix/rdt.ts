import { RadixDappToolkit, RadixNetwork, Logger } from '@radixdlt/radix-dapp-toolkit';

export const rdt = RadixDappToolkit({
  dAppDefinitionAddress:
    'account_tdx_2_12x67lrf9er7euqpfrzsjpa4e8vyck2ywj6jzxdte0szgwe00n2kxpp',
  networkId: RadixNetwork.Mainnet,
  applicationName: 'Radix Web3 dApp',
  applicationVersion: '1.0.0',
  logger: Logger(1)
});
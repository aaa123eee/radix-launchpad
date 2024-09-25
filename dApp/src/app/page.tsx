"use client";

import { gatewayApi } from "@/lib/radix/gateway";
import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";
import { DataRequestBuilder, Logger, RadixDappToolkit, RadixNetwork } from "@radixdlt/radix-dapp-toolkit";

let rdt: RadixDappToolkit;
let clientConfig: string;
let userAccountAddress: string | undefined;

try {
  rdt = RadixDappToolkit({
    dAppDefinitionAddress:
      'account_tdx_2_12x67lrf9er7euqpfrzsjpa4e8vyck2ywj6jzxdte0szgwe00n2kxpp',
    networkId: RadixNetwork.Stokenet,
    applicationName: 'Radix Web3 dApp',
    applicationVersion: '1.0.0',
    logger: Logger(1)
  });

  const gatewayApi = GatewayApiClient.initialize(
    rdt.gatewayApi.clientConfig,
  );

  // dAppToolkit.walletApi.provideChallengeGenerator(async () => generateRolaChallenge())

  // dAppToolkit.walletApi.setRequestData(
  //   DataRequestBuilder.persona().withProof(),
  //   DataRequestBuilder.accounts().atLeast(1),
  // );

  clientConfig = JSON.stringify(rdt.gatewayApi.clientConfig, null, 2);

  // // ************ Connect to wallet ************
  rdt.walletApi.setRequestData(DataRequestBuilder.accounts().exactly(1));
  // Subscribe to updates to the user's shared wallet data, then display the account name and address.
  rdt.walletApi.walletData$.subscribe((walletData) => {
    console.log("connected wallet data: ", walletData);
    // Set the account variable to the first and only connected account from the wallet
    userAccountAddress = walletData.accounts[0]?.address;
    // console.log("Account: ", account);

    // getPoolUnitBalance(); // Update displayed pool unit balance - Defined in Pool Section
  });
} catch (e) {
  console.log(e);
}

export default function Home() {

  return (
    <div>
      homepage
    </div>
  );
}

// todo: add logo to the request
// todo: handle success and error states
// todo: make dedicated page for launching

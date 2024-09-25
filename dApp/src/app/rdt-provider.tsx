"use client";

import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";
import {
  DataRequestBuilder,
  Logger,
  RadixDappToolkit,
  RadixNetwork,
} from "@radixdlt/radix-dapp-toolkit";
import { useEffect } from "react";

let rdt: RadixDappToolkit;
let clientConfig: string;
let userAccountAddress: string | undefined;

export const xrdAddress =
  "resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"; //Stokenet XRD resource address
export const launchpadComponentAddress =
  "component_tdx_2_1crqkk8ur44ecxdar96a34fpnd407ful4swhhgk038s5kp8xec38vqp";

export let gatewayApi: GatewayApiClient;

export const RadixProvider = () => {
  useEffect(() => {
    try {
      rdt = RadixDappToolkit({
        dAppDefinitionAddress:
          "account_tdx_2_12x67lrf9er7euqpfrzsjpa4e8vyck2ywj6jzxdte0szgwe00n2kxpp",
        networkId: RadixNetwork.Stokenet,
        applicationName: "Radix Web3 dApp",
        applicationVersion: "1.0.0",
        logger: Logger(1),
      });

      gatewayApi = GatewayApiClient.initialize(rdt.gatewayApi.clientConfig);

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
  }, []);

  return (
    <head>
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script src="https://www.unpkg.com/@radixdlt/radix-dapp-toolkit@2.1.0/dist/radix-dapp-toolkit.bundle.umd.cjs"></script>
    </head>
  );
};

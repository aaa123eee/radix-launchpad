"use client";

import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";
import {
  DataRequestBuilder,
  Logger,
  RadixDappToolkit,
  RadixNetwork,
} from "@radixdlt/radix-dapp-toolkit";
import { useEffect } from "react";
import { atom, useAtom } from "jotai";

export const rdtAtom = atom<RadixDappToolkit | null>(null);
export const clientConfigAtom = atom<string>("");
export const userAccountAddressAtom = atom<string | undefined>(undefined);
export const gatewayApiAtom = atom<GatewayApiClient | null>(null);
export const packageAddress = 'package_tdx_2_1ph7w6ekuxpvn03rad3uy5zay2hmgqf9j7fpg3rpqccph80xldc25tq';

export const xrdAddress =
  "resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"; //Stokenet XRD resource address
export const launchpadComponentAddress =
  "component_tdx_2_1crqkk8ur44ecxdar96a34fpnd407ful4swhhgk038s5kp8xec38vqp";

export const RadixProvider = () => {
  const [, setRdt] = useAtom(rdtAtom);
  const [, setClientConfig] = useAtom(clientConfigAtom);
  const [, setUserAccountAddress] = useAtom(userAccountAddressAtom);
  const [, setGatewayApi] = useAtom(gatewayApiAtom);

  useEffect(() => {
    try {
      const rdtInstance = RadixDappToolkit({
        dAppDefinitionAddress:
          "account_tdx_2_12x67lrf9er7euqpfrzsjpa4e8vyck2ywj6jzxdte0szgwe00n2kxpp",
        networkId: RadixNetwork.Stokenet,
        applicationName: "Radix Web3 dApp",
        applicationVersion: "1.0.0",
        logger: Logger(1),
      });

      setRdt(rdtInstance);

      const gatewayApiInstance = GatewayApiClient.initialize(
        rdtInstance.gatewayApi.clientConfig,
      );
      setGatewayApi(gatewayApiInstance);

      // dAppToolkit.walletApi.provideChallengeGenerator(async () => generateRolaChallenge())

      // dAppToolkit.walletApi.setRequestData(
      //   DataRequestBuilder.persona().withProof(),
      //   DataRequestBuilder.accounts().atLeast(1),
      // );

      setClientConfig(
        JSON.stringify(rdtInstance.gatewayApi.clientConfig, null, 2),
      );

      // // ************ Connect to wallet ************
      rdtInstance.walletApi.setRequestData(
        DataRequestBuilder.accounts().exactly(1),
      );
      // Subscribe to updates to the user's shared wallet data, then display the account name and address.
      rdtInstance.walletApi.walletData$.subscribe((walletData) => {
        console.log("connected wallet data: ", walletData);
        // Set the account variable to the first and only connected account from the wallet
        setUserAccountAddress(walletData.accounts[0]?.address);
        // console.log("Account: ", account);

        // getPoolUnitBalance(); // Update displayed pool unit balance - Defined in Pool Section
      });
    } catch (e) {
      console.log(e);
    }
  }, [setRdt, setClientConfig, setUserAccountAddress, setGatewayApi]);

  return (
    <head>
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script src="https://www.unpkg.com/@radixdlt/radix-dapp-toolkit@2.1.0/dist/radix-dapp-toolkit.bundle.umd.cjs"></script>
    </head>
  );
};

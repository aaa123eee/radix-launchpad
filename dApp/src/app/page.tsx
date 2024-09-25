"use client";

import MemeCoinLaunchpadForm from "./components/features/create-coin-form";
import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";
import { DataRequestBuilder, Logger, RadixDappToolkit, RadixNetwork } from "@radixdlt/radix-dapp-toolkit";
import {api } from "@/trpc/react";

let rdt: RadixDappToolkit;
let clientConfig: string;
let userAccountAddress: string;

const xrdAddress =
  "resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"; //Stokenet XRD resource address
const launchpadComponentAddress = 'component_tdx_2_1crqkk8ur44ecxdar96a34fpnd407ful4swhhgk038s5kp8xec38vqp';

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
    userAccountAddress = walletData.accounts[0].address;
    // console.log("Account: ", account);

    // getPoolUnitBalance(); // Update displayed pool unit balance - Defined in Pool Section
  });
} catch (e) {
  console.log(e);
}

export default function Home() {

  async function onCreateNewTokenAndBuyTenPercentRequest({ coinName, coinDescription, logoFile, twitterHandle, investment }: {
    coinName: string;
    coinDescription: string;
    logoFile: File | null;
    twitterHandle: string;
    investment: number;
  }) {
    const request = createNewTokenAndBuyTenPercentRequest({
      userAccountAddress: userAccountAddress,
      depositAmount: investment.toString(),
      coinName,
      coinDescription,
    });

    console.log({ request });

    const result = await rdt.walletApi.sendTransaction({
      transactionManifest: request,
    });

    console.log("transaction result: ", result);
  }

  const a = api.token.createToken.useMutation();

  // a.mutate({})


  return (
    <div>
      <div className="flex justify-end">
        <div>
          {/* @ts-expect-error Web Component connected in index.html */}
          <radix-connect-button />
        </div>
      </div>

      <MemeCoinLaunchpadForm onHandleSubmit={onCreateNewTokenAndBuyTenPercentRequest} />
    </div>
  );
}

interface CreateNewTokenAndBuyTenPercentRequestParams {
  userAccountAddress: string;
  depositAmount: string;
  coinName: string;
  coinDescription: string;
}

function createNewTokenAndBuyTenPercentRequest({
  userAccountAddress,
  depositAmount,
  coinName,
  coinDescription
}: CreateNewTokenAndBuyTenPercentRequestParams): string {
  return `
CALL_METHOD
    Address("${userAccountAddress}")
    "withdraw"
    Address("${xrdAddress}")
    Decimal("${depositAmount}")
;
TAKE_FROM_WORKTOP
    Address("${xrdAddress}")
    Decimal("${depositAmount}")
    Bucket("bucket1")
;
CALL_METHOD
    Address("${launchpadComponentAddress}")
    "create_new_token_and_buy_10_percent"
    "${coinName}"
    "${coinDescription}"
    Bucket("bucket1")
;
CALL_METHOD
    Address("${userAccountAddress}")
    "try_deposit_batch_or_refund"
    Expression("ENTIRE_WORKTOP")
    Enum<0u8>()
;
  `;
}

// todo: add logo to the request
// todo: handle success and error states
// todo: make dedicated page for launching

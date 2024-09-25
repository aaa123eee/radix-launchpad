"use client";

import MemeCoinLaunchpadForm from "../components/features/create-coin-form";
import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";
import { DataRequestBuilder, Logger, RadixDappToolkit, RadixNetwork } from "@radixdlt/radix-dapp-toolkit";
import { api } from "@/trpc/react";

let rdt: RadixDappToolkit;
let clientConfig: string;
let gatewayApi: GatewayApiClient;
let userAccountAddress: string | undefined;

const xrdAddress =
  "resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"; //Stokenet XRD resource address
const packageAddress = 'package_tdx_2_1p40xpyvghxuma2dg2kxeu7809ma85zd8lu7g40cmgsh5ur37cp0qc0';

try {
  rdt = RadixDappToolkit({
    dAppDefinitionAddress:
      'account_tdx_2_12x67lrf9er7euqpfrzsjpa4e8vyck2ywj6jzxdte0szgwe00n2kxpp',
    networkId: RadixNetwork.Stokenet,
    applicationName: 'Radix Web3 dApp',
    applicationVersion: '1.0.0',
    logger: Logger(1)
  });
  
  gatewayApi = GatewayApiClient.initialize(
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

export default function Deploy() {

  const a = api.token.createToken.useMutation();

  async function onCreateNewTokenAndBuyTenPercentRequest({ coinName, coinDescription, logoUrl, twitterHandle, investment }: {
    coinName: string;
    coinDescription: string;
    logoUrl: string;
    twitterHandle: string;
    investment: number;
  }) {
    if (!userAccountAddress) {
      alert("No user account address connected");
      return;
    }

    const request = createDeployComponentManifest({
      userAccountAddress: userAccountAddress,
      depositAmount: investment.toString(),
      coinName,
      coinDescription,
      logoUrl,
    });

    console.log({ request });

    const result = await rdt.walletApi.sendTransaction({
      transactionManifest: request,
    });

    console.log("transaction result: ", result);

    if (result.isOk()) {

      const details = await gatewayApi.transaction.getCommittedDetails(result.value.transactionIntentHash);

      // ToDo: depends on contract exec
      const newResourseAddress = details.transaction?.affected_global_entities?.[3];

      a.mutate({
        symbol: coinName,
        name: coinName,
        // ToDo: take address from response
        address: newResourseAddress!,
        iconUrl: logoUrl,
        supply: investment,
      }, {
        onError: error => {
          console.log({error});
        },
      });
    }
  }
  

  return (
    <div>
      deploy page
      <MemeCoinLaunchpadForm onHandleSubmit={onCreateNewTokenAndBuyTenPercentRequest} />
    </div>
  );
}

interface CreateNewTokenAndBuyTenPercentRequestParams {
  userAccountAddress: string;
  depositAmount: string;
  coinName: string;
  coinDescription: string;
  logoUrl: string;
}

function createDeployComponentManifest({ 
  userAccountAddress, 
  depositAmount, 
  coinName, 
  coinDescription,
  logoUrl,
}: CreateNewTokenAndBuyTenPercentRequestParams) {
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
CALL_FUNCTION
    Address("${packageAddress}")
    "TokenPool"
    "instantiate_token_pool"
    "${coinDescription}"
    "${coinName}"
    "${logoUrl}"
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

// todo: handle success and error states
// todo: make dedicated page for launching
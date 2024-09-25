"use client";

import MemeCoinLaunchpadForm from "../components/features/create-coin-form";

import { api } from "@/trpc/react";
import {
  launchpadComponentAddress,
  rdtAtom,
  userAccountAddressAtom,
  xrdAddress,
  packageAddress,
  gatewayApiAtom
} from "../rdt-provider";
import { useAtom } from "jotai/react";

export default function Deploy() {
  const [gatewayApi] = useAtom(gatewayApiAtom);
  const [userAccountAddress] = useAtom(userAccountAddressAtom);
  const [rdt] = useAtom(rdtAtom);

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

    const result = await rdt?.walletApi.sendTransaction({
      transactionManifest: request,
    });

    console.log("transaction result: ", result);

    if (result && result.isOk() && gatewayApi) {

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

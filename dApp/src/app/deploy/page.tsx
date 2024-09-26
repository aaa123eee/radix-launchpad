"use client";

import MemeCoinLaunchpadForm from "../components/features/create-coin-form";
import { useRouter } from "next/navigation";

import { api } from "@/trpc/react";
import {
  rdtAtom,
  userAccountAddressAtom,
  xrdAddress,
  packageAddress,
  gatewayApiAtom,
} from "../rdt-provider";
import { useAtom } from "jotai/react";
import {isDeployingAtom} from "@/lib/utils";

export default function Deploy() {
  const router = useRouter();
  const [gatewayApi] = useAtom(gatewayApiAtom);
  const [userAccountAddress] = useAtom(userAccountAddressAtom);
  const [rdt] = useAtom(rdtAtom);
  const [, setIsDeploying] = useAtom(isDeployingAtom);
  const createToken = api.token.createToken.useMutation();
  const createComponent = api.component.create.useMutation();

  async function onCreateNewTokenAndBuyTenPercentRequest({
    coinName,
    coinDescription,
    logoUrl,
    twitterHandle,
    investment,
  }: {
    coinName: string;
    coinDescription: string;
    logoUrl: string;
    twitterHandle: string;
    investment: number;
  }) {
    setIsDeploying(true);
    if (!userAccountAddress) {
      alert("No user account address connected");
      return;
    }

    try {
      const request = createDeployComponentManifest({
        userAccountAddress: userAccountAddress,
        depositAmount: investment.toString(),
        coinName,
        coinDescription,
        logoUrl,
      });

      const result = await rdt?.walletApi.sendTransaction({
        transactionManifest: request,
      });

      console.log("transaction result: ", result);

      if (result && result.isOk() && gatewayApi) {
        const details = await gatewayApi.transaction.getCommittedDetails(
          result.value.transactionIntentHash,
        );

        const poolInstantiatedEvent = details.transaction.receipt?.events?.find(
          (item) => item.name === "PoolInstantiatedEvent",
        );
        const newResourseAddress =
          poolInstantiatedEvent?.data.fields?.find(
            (item) => item.type_name === "ResourceAddress",
          )?.value || details.transaction?.affected_global_entities?.[3];
        const newComponentAddress = poolInstantiatedEvent?.data.fields?.find(
          (item) => item.type_name === "ComponentAddress",
        )?.value;

        console.log({ poolInstantiatedEvent });

        createToken.mutate(
          {
            symbol: coinName,
            name: coinName,
            address: newResourseAddress!,
            iconUrl: logoUrl,
            supply: 100000000000,
            componentAddress: newComponentAddress,
          },
          {
            onError: (error) => {
              console.log({ error });
            },
            onSuccess: (res) => {
              console.log("Token creation successful:", res);
              router.push(`/token/${newResourseAddress}`);
            },
          },
        );
      }
    } catch (error) {
      console.error("Error during token creation:", error);
      alert("An error occurred during token creation. Please try again.");
    } finally {
      setIsDeploying(false);
    }
  }

  return (
    <div className="flex justify-center pt-10">
      <MemeCoinLaunchpadForm
        onHandleSubmit={onCreateNewTokenAndBuyTenPercentRequest}
      />
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

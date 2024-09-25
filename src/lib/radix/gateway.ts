import { GatewayApiClient } from '@radixdlt/babylon-gateway-api-sdk';
import { rdt } from './rdt'; // Assuming rdt is defined in this file

export const gatewayApi = GatewayApiClient.initialize(rdt.gatewayApi.clientConfig);

import axios from 'axios'

const url = 'https://stokenet.radixapi.net/v1/'

const api = axios.create({
  baseURL: url,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    Authorization: `Bearer w4ZPIFRurhi1s4MkCLn0adZVVzuuWE3PotEtEm7HAm8`,
  },
})

interface Holder {
  balance: number;
  account_id: string;
}

interface PoolResource {
  pool_address: string;
  pool_unit_address: string;
  resource_address: string;
  resource_balance: number;
  holders: Holder[];
}

interface PoolInfoResponse {
  data: PoolResource[];
  code: number;
  time_utc: number;
}

export const Api = {
  getPoolInfo: async (poolAddress: string): Promise<PoolInfoResponse> => {
    const response = await api.get<PoolInfoResponse>(`pool/holders/${poolAddress}`)
    if (response.status !== 200) {
      throw new Error(`Failed to get pool info. Status: ${response.status}`)
    }
    return response.data;
  }
}



// Example usage: Extracting resource_balance from all tokens in a pool
const exampleUsage = async () => {
  try {
    const poolAddress = 'pool_tdx_2_1p5qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzqu57yag'; // Example pool address
    const poolInfo = await Api.getPoolInfo(poolAddress);
    
    const resourceBalances = poolInfo.data.map(resource => ({
      resourceAddress: resource.resource_address,
      balance: resource.resource_balance
    }));

    console.log('Resource balances:', resourceBalances);
  } catch (error) {
    console.error('Error fetching pool info:', error);
  }
};

// Uncomment the line below to run the example
// exampleUsage();


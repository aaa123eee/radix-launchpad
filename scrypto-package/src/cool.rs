use scrypto::prelude::*;

#[blueprint]
mod Launchpad {
    use std::collections::HashMap;

    enable_method_auth! {
        // decide which methods are public and which are restricted to the component's owner
        methods {
            create_new_token_and_buy_10_percent => PUBLIC;
            withdraw_fee => restrict_to: [OWNER];
            swap_tokens => PUBLIC;
            instantiate_launchpad => PUBLIC;
        }
    }

    struct Launchpad {
        // Define what resources and data will be managed by Hello components
        liquidity_pools: HashMap<String, Global<TwoResourcePool>>,
        token_vault: Vault,
        xrd_vault: Vault,
        lp_tokens: Vault
        fee_vault: Vault,
    }

    impl Launchpad {
        // Implement the functions and methods which will manage those resources and data

        // This is a function, and can be called directly on the blueprint once deployed
        pub fn instantiate_launchpad() -> Global<Launchpad> {
            // Instantiate a Hello component, populating its vault with our supply of 1000 HelloToken

            let badge: Bucket = ResourceBuilder::new_fungible(OwnerRole::None)
                .divisibility(0)
                .metadata(metadata! {
                    init {
                        "name" => "Launchpad Admin Badge", locked;
                        "symbol" => "LAB", locked;
                    }
                })
                .mint_initial_supply(1);

            Self {
                liquidity_pools: HashMap::new(),
                lp_tokens: HashMap::new(),
                fee_vault: Vault::new(0),
            }
            .instantiate()
            .prepare_to_globalize(OwnerRole::Fixed(rule!(require(badge))))
            .globalize()

            badge
        }

        pub fn create_new_token_and_buy_10_percent(&mut self, symbol: String, name: String, bucket: Bucket) -> (Bucket, Option<Bucket>) {
            // Check if the provided bucket is XRD
            if bucket.resource_address() != XRD {
                error!("Error: The provided bucket must contain XRD tokens.");
            }


            // let fee10Percent = bucket.amount() * 10 / 100;
            // self.fee_vault.add(fee10Percent);

            // Create a new fungible resource
            let new_fungible_bucket = ResourceBuilder::new_fungible(OwnerRole::None)
                .divisibility(DIVISIBILITY_MAXIMUM)
                .metadata(metadata! {
                    init {
                        "name" => name, locked;
                        "symbol" => symbol.clone(), locked;
                    }
                })
                .mint_initial_supply(100_000_000);
            let resource_address = new_fungible_bucket.resource_address();

            info!("new_fungible_bucket: {:?}", new_fungible_bucket);
            info!("Resource address: {:?}", resource_address);

            let mut new_bucket: Bucket = new_fungible_bucket.into();
            let bucket_with_10_percent = new_bucket.take(10000000);

            info!("bucket_with_10_percent: {:?}", bucket_with_10_percent);

            let mut pool_component = Blueprint::<TwoResourcePool>::instantiate(
                OwnerRole::None,
                rule!(allow_all),
                (XRD, resource_address),
                None,
            );

            info!("pool_component: {:?}", pool_component);

            let (lp_token, change) = pool_component.contribute((new_bucket, bucket));
            info!("lp_token: {:?}", lp_token);
            info!("change: {:?}", change);

            self.lp_tokens.insert(symbol.clone(), Vault::with_bucket(lp_token));

            self.liquidity_pools.insert(symbol.clone(), pool_component);

            (bucket_with_10_percent, change)
        }

        pub fn swap_tokens(&mut self, symbol: String, input_bucket: Bucket) -> Bucket {
            let pool_component = self.liquidity_pools.get_mut(&symbol).unwrap();

            let mut reserves = pool_component.get_vault_amounts();

            let input_amount = input_bucket.amount();

            let amountToTake = input_amount * 5 / 100;
            let fee = input_bucket.take(amountToTake);
            self.fee_vault.add(fee);

            let input_reserves = reserves
                .shift_remove(&input_bucket.resource_address())
                .expect("Resource does not belong to the pool");

            let (output_resource_address, output_reserves) = reserves.into_iter().next().unwrap();


            //constant product formula
            // Constant product formula: x * y = k
            // Where x and y are the reserves of the two tokens
            // and k is a constant
            // 
            // After the swap: (x + dx) * (y - dy) = k
            // Where dx is the input amount and dy is the output amount
            //
            // Solving for dy:
            // dy = y - k / (x + dx)
            // dy = y - (x * y) / (x + dx)
            let output_amount = input_amount
                .checked_mul(output_reserves)
                .unwrap()
                .checked_div(input_reserves.checked_add(input_amount).unwrap())
                .unwrap();

            pool_component.protected_deposit(input_bucket);
            pool_component.protected_withdraw(
                output_resource_address,
                output_amount,
                WithdrawStrategy::Rounded(RoundingMode::ToZero),
            )
        }

        pub fn withdraw_fee(&mut self) -> Bucket {
            self.fee_vault.take_all()
        }
    }
}

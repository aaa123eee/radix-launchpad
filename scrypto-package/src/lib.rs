use scrypto::prelude::*;

#[blueprint]
#[events(PoolInstantiatedEvent, TokenSwapEvent)]

mod token_pool {

    enable_method_auth! {
        methods {
            swap_tokens => PUBLIC;
            withdraw_fees => restrict_to: [OWNER];
        }
    }

    struct TokenPool {
        // Define what resources and data will be managed by Hello components
        pool_component: Global<TwoResourcePool>,
        lp_tokens: Vault,
        xrd_fees: Vault,
        token_fees: Vault,
    }

    impl TokenPool {
        // Implement the functions and methods which will manage those resources and data

        // This is a function, and can be called directly on the blueprint once deployed
        pub fn instantiate_token_pool(name: String, symbol: String, icon_url: String, mut input_bucket: Bucket, protocol_admin_badge: ResourceAddress) -> (Global<TokenPool>, Bucket, Option<Bucket>) {
            let input_amount = input_bucket.amount();
            let five_percent = input_amount * 3 / 100;
            let fees_bucket: Bucket = input_bucket.take(five_percent);

            let new_fungible_bucket = ResourceBuilder::new_fungible(OwnerRole::None)
                .divisibility(DIVISIBILITY_MAXIMUM)
                .metadata(metadata! {
                    init {
                    "name" => name, locked;
                    "symbol" => symbol.clone(), locked;
                    "icon_url" => Url::of(icon_url), locked;
                    // "description" => description, locked;
                }
            })
            .mint_initial_supply(100_000_000);

            let resource_address = new_fungible_bucket.resource_address();

            let mut new_token_bucket: Bucket = new_fungible_bucket.into();
            let bucket_with_10_percent = new_token_bucket.take(10000000);

            let mut pool_component = Blueprint::<TwoResourcePool>::instantiate(
                OwnerRole::None,
                rule!(allow_all),
                (XRD, resource_address),
                None,
            );

            let (lp_token_bucket, change) = pool_component.contribute((new_token_bucket, input_bucket));

            let component = Self {
                pool_component,
                lp_tokens: Vault::with_bucket(lp_token_bucket),
                xrd_fees: Vault::with_bucket(fees_bucket),
                token_fees: Vault::new(resource_address),
            }
            .instantiate()
            .prepare_to_globalize(
                OwnerRole::Fixed(rule!(require(protocol_admin_badge)))
            )
            .globalize();

            // Emit an event for token creation
            Runtime::emit_event(PoolInstantiatedEvent {
                resource_address: resource_address,
                component_address: component.address(),
            });

            (component, bucket_with_10_percent, change)
        }

        pub fn swap_tokens(&mut self, mut input_bucket: Bucket) -> Bucket {
            let mut reserves = self.pool_component.get_vault_amounts();

            
            // take 5% of the input bucket as fees
            let input_bucket_amount = input_bucket.amount();
            let fees = input_bucket_amount * 5 / 100;
            let fees_bucket = input_bucket.take(fees);

            if input_bucket.resource_address() == XRD {
                self.xrd_fees.put(fees_bucket);
            } else {
                self.token_fees.put(fees_bucket);
            };

            let input_amount = input_bucket.amount();

            let input_reserves = reserves
                .shift_remove(&input_bucket.resource_address())
                .expect("Resource does not belong to the pool");
            
            let (output_resource_address, output_reserves) = reserves.into_iter().next().unwrap();

            // uniswap v2 formula
            let output_amount = input_amount
                .checked_mul(output_reserves)
                .unwrap()
                .checked_div(input_reserves.checked_add(input_amount).unwrap())
                .unwrap();

            Runtime::emit_event(TokenSwapEvent {
                input_amount: Decimal::from(input_amount),
                output_amount: Decimal::from(output_amount),
            });

            self.pool_component.protected_deposit(input_bucket);
            self.pool_component.protected_withdraw(
                output_resource_address,
                output_amount,
                WithdrawStrategy::Rounded(RoundingMode::ToZero),
            )
        }

        pub fn withdraw_fees(&mut self) -> (Bucket, Bucket) {
            (self.xrd_fees.take_all(), self.token_fees.take_all())
        }
    }
}

#[derive(ScryptoSbor, ScryptoEvent)]
pub struct PoolInstantiatedEvent {
    pub resource_address:   ResourceAddress,
    pub component_address:  ComponentAddress,
}

#[derive(ScryptoSbor, ScryptoEvent)]
pub struct TokenSwapEvent {
    pub input_amount: Decimal,
    pub output_amount: Decimal,
}

// use scrypto::prelude::*;

// pub mod cool;

// #[blueprint]
// mod launchpad {
//     use std::collections::HashMap;

//     struct Launchpad {
//         // Define what resources and data will be managed by Hello components
//         liquidity_pools: HashMap<String, Global<TwoResourcePool>>,
//         lp_tokens: HashMap<String, Vault>,
//     }

//     impl Launchpad {
//         // Implement the functions and methods which will manage those resources and data

//         // This is a function, and can be called directly on the blueprint once deployed
//         pub fn instantiate_launchpad() -> Global<Launchpad> {
//             // Instantiate a Hello component, populating its vault with our supply of 1000 HelloToken
            
//             Self {
//                 liquidity_pools: HashMap::new(),
//                 lp_tokens: HashMap::new(),
//             }
//             .instantiate()
//             .prepare_to_globalize(OwnerRole::None)
//             .globalize()
//         }
        
//         pub fn create_new_token_and_buy_10_percent(&mut self, symbol: String, name: String, bucket: Bucket) -> (Bucket, Option<Bucket>) {
//             // Check if the provided bucket is XRD
//             if bucket.resource_address() != XRD {
//                 error!("Error: The provided bucket must contain XRD tokens.");
//             }

//             // Create a new fungible resource
//             let new_fungible_bucket = ResourceBuilder::new_fungible(OwnerRole::None)
//                 .divisibility(DIVISIBILITY_MAXIMUM)
//                 .metadata(metadata! {
//                     init {
//                         "name" => name, locked;
//                         "symbol" => symbol.clone(), locked;
//                     }
//                 })
//                 .mint_initial_supply(100_000_000);
//             let resource_address = new_fungible_bucket.resource_address();

//             info!("new_fungible_bucket: {:?}", new_fungible_bucket);
//             info!("Resource address: {:?}", resource_address);

//             let mut new_bucket: Bucket = new_fungible_bucket.into();
//             let bucket_with_10_percent = new_bucket.take(10000000);

//             info!("bucket_with_10_percent: {:?}", bucket_with_10_percent);

//             let mut pool_component = Blueprint::<TwoResourcePool>::instantiate(
//                 OwnerRole::None,
//                 rule!(allow_all),
//                 (XRD, resource_address),
//                 None,
//             );

//             info!("pool_component: {:?}", pool_component);

//             let (lp_token, change) = pool_component.contribute((new_bucket, bucket));
//             info!("lp_token: {:?}", lp_token);
//             info!("change: {:?}", change);

//             self.lp_tokens.insert(symbol.clone(), Vault::with_bucket(lp_token));

//             self.liquidity_pools.insert(symbol.clone(), pool_component);

//             (bucket_with_10_percent, change)
//         }

//         pub fn swap_tokens(&mut self, symbol: String, input_bucket: Bucket) -> Bucket {
//             let pool_component = self.liquidity_pools.get_mut(&symbol).unwrap();

//             let mut reserves = pool_component.get_vault_amounts();

//             let input_amount = input_bucket.amount();

//             let input_reserves = reserves
//                 .shift_remove(&input_bucket.resource_address())
//                 .expect("Resource does not belong to the pool");
            
//             let (output_resource_address, output_reserves) = reserves.into_iter().next().unwrap();

//             let output_amount = input_amount
//                 .checked_mul(output_reserves)
//                 .unwrap()
//                 .checked_div(input_reserves.checked_add(input_amount).unwrap())
//                 .unwrap();

//             pool_component.protected_deposit(input_bucket);
//             pool_component.protected_withdraw(
//                 output_resource_address,
//                 output_amount,
//                 WithdrawStrategy::Rounded(RoundingMode::ToZero),
//             )
//         }
//     }
// }

use scrypto::prelude::*;

#[blueprint]
mod token_pool {

    enable_method_auth! {
        roles {
            admin => updatable_by: [];
        },
        methods {
            swap_tokens => PUBLIC;
            withdraw_fees => restrict_to: [admin];
        }
    }

    struct TokenPool {
        // Define what resources and data will be managed by Hello components
        pool_component: Global<TwoResourcePool>,
        lp_tokens: Vault,
        fees: Vault,
    }

    impl TokenPool {
        // Implement the functions and methods which will manage those resources and data

        // This is a function, and can be called directly on the blueprint once deployed
        pub fn instantiate_launchpad(name: String, symbol: String,icon_url: String, mut input_bucket: Bucket, admin: ResourceAddress) -> (Global<TokenPool>, Bucket, Option<Bucket>) {
            let admin_access_rule: AccessRule = rule!(require(admin)); // #1

            let input_amount = input_bucket.amount();
            let five_percent = input_amount * 5 / 100;
            let fees_bucket: Bucket = input_bucket.take(five_percent);

            let new_fungible_bucket = ResourceBuilder::new_fungible(OwnerRole::None)
                .divisibility(DIVISIBILITY_MAXIMUM)
                .metadata(metadata! {
                    init {
                    "name" => name, locked;
                    "symbol" => symbol.clone(), locked;
                    "icon_url" => icon_url, locked;
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
                fees: Vault::with_bucket(fees_bucket),
            }
            .instantiate()
            .prepare_to_globalize(OwnerRole::None)
            .roles(roles! {
                admin => admin_access_rule;
            })
            .globalize();

            (component, bucket_with_10_percent, change)
        }

        pub fn swap_tokens(&mut self, input_bucket: Bucket) -> Bucket {
            let mut reserves = self.pool_component.get_vault_amounts();

            let input_amount = input_bucket.amount();

            let input_reserves = reserves
                .shift_remove(&input_bucket.resource_address())
                .expect("Resource does not belong to the pool");
            
            let (output_resource_address, output_reserves) = reserves.into_iter().next().unwrap();

            let output_amount = input_amount
                .checked_mul(output_reserves)
                .unwrap()
                .checked_div(input_reserves.checked_add(input_amount).unwrap())
                .unwrap();

            self.pool_component.protected_deposit(input_bucket);
            self.pool_component.protected_withdraw(
                output_resource_address,
                output_amount,
                WithdrawStrategy::Rounded(RoundingMode::ToZero),
            )
        }

        pub fn withdraw_fees(&mut self) -> Bucket {
            self.fees.take_all()
        }
    }
}

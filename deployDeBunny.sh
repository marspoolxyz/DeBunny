
 


ALICE_PUBLIC_KEY="principal \"$( \
    dfx identity get-principal
)\""


dfx identity use marspool

MODE="upgrade"
#MODE="reinstall"  # Removes all the data
#MODE="install"  # Removes all the data

NETWORK=""
NETWORK="--network ic"


eval dfx canister $NETWORK create debunny
eval dfx build $NETWORK debunny
eval dfx canister $NETWORK  install debunny --argument="'($ALICE_PUBLIC_KEY)'"  --mode $MODE

echo dfx canister --network ic call debunny ext_setAdmin '(principal "cg5zh-ncb4u-2c4va-ijjay-4ohx2-c67hs-ey5kh-tctf7-wlmft-cn4c7-kae")'
echo dfx canister --network ic  call debunny ext_setOwner '(principal "cg5zh-ncb4u-2c4va-ijjay-4ohx2-c67hs-ey5kh-tctf7-wlmft-cn4c7-kae")'
echo dfx canister --network ic  call debunny ext_setAdmin '(principal "bjbel-2mu7a-j24xj-zbua7-s7vsb-3o7xv-k4aqq-fira4-kl67i-ln3sl-kqe")'

echo dfx canister --network ic  call debunny ext_setAdmin '(principal "pwswf-gdycx-spviv-fiuw6-gfzob-36m2b-7nes3-p5k6p-tm72y-uugic-wae")'

echo dfx canister --network ic  call debunny ext_removeAdmin '(principal "bjbel-2mu7a-j24xj-zbua7-s7vsb-3o7xv-k4aqq-fira4-kl67i-ln3sl-kqe")'


eval dfx canister $NETWORK  call debunny ext_admin
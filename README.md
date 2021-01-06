# Stormbreaker Feedelegation Serve(VIP201)

[![](https://badgen.net/badge/status/Alpha/red)]()
[![](https://badgen.net/badge/node/>=14.15/green)]()
[![](https://badgen.net/badge/storage/sqlite|mysql/blue)]()

> :warning: It just an `Alpha` Version ! Don't use it on the `Production Environment` or `VeChainThor Mainnet`.
## 1. Introduction

Stormbreaker Feedelegation Serve is a [VIP201](https://github.com/vechain/VIPs/blob/master/vips/VIP-201.md) implementation. Its target is to become a public and decentralized serve that provides fee delegation service for DApp and blockchain applications.

- Public fee delegation serve
  
    Every appliction want to use this serve,it need an authorizationID. The service include a calculate engine. It can configure a rule for each application based on the authorizationID and filter the transaction send by application to decide whether to sign. In this way, the service can serve different applications without the need to develop and deploy services for earch application.More about the `Engine`,you can ref this [Calculate Engine(comming soon)]().

- Decentralized serve

    This service has been deployed and provides a fee broker service for the following applications:
    - [faucet-new(Testnet)](https://github.com/mongelly/faucet-new)
    - [Vote(comming soon)]()

    But in blockchain world, we don't want all applications to rely on a single service, so we're open source and expect more developers and companies to maintain the project and deploy the service. Provide services for Vechain ecology, which can be combined with `DeFi` in the future.This is a description of our vision:
    ![image](http://www.plantuml.com/plantuml/png/bP7DReCm48Jl-nJx0Xp2CQggj4f_JkqbYdgpjcO1AyP6PabQHNttAXWbAQBGtjXXTaR-TjK81Mah2vPpGV4OJ54APYQm5kCTv84gHlxG9Rc2Zw0fPAYzpTI1h6M9GkcbdnTHg8FPix3AcJEsND0fJ3KSzWnVqAVMxRirEgfXSGH4n6uxfrQpACS7jRwhwykFlHSUI35ah4WjVgbAhwfU7ZU3mFN3sq1vekeVhUcfjJDjMPTatARqGTrRhtVTYDHWzm5mXGsJsskiImdacfm3Yj-n--6yIP8flaigs7MthEaJjvldLnZmZ0aJt4OYpkHdbm4YqtbhEjBJqv_VXVDLvgq04xmmIVfxJBtgJwxqubgnozhAVWC0)



## 2. API
The sign API follow [VIP201](https://github.com/vechain/VIPs/blob/master/vips/VIP-201.md)

Once the serve started, the default api address is `http://localhost:18050`

``` http
POST /sign HTTP/1.1 localhost:18050/sign?authorization=c16499***********4389328704&recaptcha=-BS0b5*******AGGY3
Content-Type: application/json;charset=UTF-
{
    "raw":"0xf7278778f3e100d299a812dcdb942b990f387b513f6afa6b87a73f6533f2f19407ce80844e71d92d8082ea608088d5bbec1195eea92dc101",
    "origin":"0x0489a3fff1930b85f1d73eff8a4699281aadb558"
}
```

Request Params

| Parameter      | Type   | Description                             | Required|
| -------- | ------ | -------------------------------- | ----------- |
| authorization | string | every application need regiest an authorizationID in delegation server |YES|
| recaptcha | string | if you configure google recaptcha,it's a must  |NO|
| raw | string | RLP-encoded raw transaction. Prefixed with '0x'.  |YES|
| origin | string | The origin of the transaction, address type. Prefixed with '0x' |YES|

Response Example

``` http
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache
{
    "signature": "f8fe82c74f9e1f5bf443f8a7f8eb968140f554968fdcab0a6ffe904e451c8b9244be44bccb1feb34dd20d9d8943f8c131227e55861736907b02d32c06b934d7200"
}
```

Response Params
| Parameter      | Type   | Description                             |
| -------- | ------ | -------------------------------- | ----------- |
| signature | string | 65 bytes of signature, in hex format (130 chars). |


Responses with HTTP status code other than 200 is considered an error.
## 3. Project Setup
The server requires `nodejs` 14.15+ and `Typescript` 3.8+. the storage support `sqlite` and `mysql`.

Build project
``` shell
    npm run build
```

Run project
``` shell
    npm run serve
```

- The `sqlite` configuration file example [config](./config/config_example_sqlite.json), you need edit it and resave to `~/config/config.json`, and need install sqlite3 package
```
    npm install sqlite3 --save
```

- The `mysql` configuration file example [config](./config/config_example_mysql.json),you need edit it and resave to `~/config/config.json` and need install mysql package
```
    npm install mysql --save
```

If you want to use this service for fee delegation payment, you need to register an `authorizationID` and setup some configure. I can give you a example of how there configurations work in `faucet-new(Testnet)` [faucet-new-example]().
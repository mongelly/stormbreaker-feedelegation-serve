# Fee Delegation as a Service (DaaS)

[![](https://badgen.net/badge/status/Alpha/red)]()
[![](https://badgen.net/badge/node/>=14.15/green)]()
[![](https://badgen.net/badge/storage/sqlite|mysql/blue)]()

> :warning: It just an `Alpha` Version ! Don't use it on the `Production Environment` or `VeChainThor Mainnet`.
## 1. Introduction

Fee Delegation as a Service (DaaS) is a [VIP201](https://github.com/vechain/VIPs/blob/master/vips/VIP-201.md) implementation. Its target is to become a public and distributed service that provides fee delegation service for dApps and blockchain applications.

- Public fee delegation serve
  
    Every appliction want to use this serve,it need an authorizationID. The service include a calculate engine. It can configure a rule for each application based on the authorizationID and filter the transaction send by application to decide whether to sign. In this way, the service can serve different applications without the need to develop and deploy services for earch application.More about the `Calculate Engine`,you can ref this [Calculate Engine(comming soon)]().

- Distributed serve

    This service has been deployed and provides a fee broker service for the following applications:
    - [faucet-new(Testnet)](https://github.com/mongelly/faucet-new)
    - [Vote(comming soon)]()

    But in blockchain world, we don't want all applications to rely on a single service, so we're open source and expect more developers and companies to maintain the project and deploy the service. Provide services for Vechain ecology, which can be combined with `DeFi` in the future.This is a description of our vision:
    ![image](http://www.plantuml.com/plantuml/png/VLBBReCm4BplL_W7SWZ7gAhIAdsSsaEZg3ThQvPWnGzabgHLr7-lQo81aGCdF3Cx2pDUjuo1Esl0KCM2lGXwNxCeTI35sZke0beIzArgT7iwWy9G2kLDAKze374Fr9udPsnROcdHuPuiEPOjXQDMrBDDq4TYaXl43_Y5ouwc-p9Q9IM5vHb4V9Aymav5DqSdkNbece4uUgOfT359pd9vmxiOURyzRwySDa-VLyWBsharnV-QXEuefgJTjlP1FXgl3kaOmn3f1M28ITmjxiSnhZYWQoiAWls1t5IvcCbpi9WNtYBIrBYGLHIuT1KQ_16xxUixm5K3QMQIT6OebPDN0yJOyroHSKgDPCNGLvFd0CQ_9IBVjp3vb3nS3F2QNDbPymS0)

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
| Parameter      | Type   | Description |
| -------- | ------ | -------------------------------- |
| signature | string | 65 bytes of signature, in hex format (130 chars). |

Responses with HTTP status code other than 200 is considered an error.

## 3. How to use it

The project is a DaaS framework,which has the basic modules and APIs by DaaS.

However it can't used directly. The developers need to carry out a samll amount of development and configuration.
### 1. Development of calculate node

the project already includes some base and common nodes.

- base calculate nodes ()

    path: `/src/utils/calculateEngine/baseCalculateNode`

    includes some logical operations nodes.
    - `Normal`
    - `And`
    - `Or`
    - `Not`

- request filter node
  
  path:`/src/server/requestFilter/nodes`

  includes some common request filter nodes.
  - `GasMax`
  - `GoogleRecaptchaCheck`
  - `SingleAddressCallLimit`
  - `SmartContractWhiteList`
  - `TxOriginWhiteList`
  - `TxTargetWhiteList`

Each node has a unique ID - nodeID, if there nodes can't meet the needs of the dApps, you can implement your node, it need follow the [BaseCalculateNode](src/utils/calculateEngine/baseCalculateNode.ts) abstract class, and add the project.

Some nodes have a instance json config. A node can be configured for different instance json config to adapt to different dApps.

### 2. Regiest a new appid

 Each dApp need regiest a appid, which has a `tree node config` and an `instance config`.

   - Generate a appid like this `039be23b-ca50-4b50-97bb-34d9d2ce86ca`.
   - Add the appid to `authorzation_info` table of database.

### 3. Configuration tree node config

This is a tree node config sample:

```json
{
    "name": "faucet-new",
    "root": {
        "node": "and",
        "inputs": [
            {
                "type": "ref",
                "value": "f0aa22dd-e32f-49bb-9687-a0a50ef5c476"
            },
            {
                "type": "ref",
                "value": "3535822f-acf5-4ecb-b1a3-c71dae62b472"
            }
        ],
        "nodeid": "00000000-0000-0000-0001-3336ad58a20e",
        "instanceid": "5be18c61-fa8f-4603-9949-2cd5ebf0e548"
    },
    "configid": "feabbfe3-74fb-4596-a7d5-697a35c0c713",
    "references": [
        {
            "node": "and",
            "inputs": [
                {
                    "type": "ref",
                    "value": "2a717992-a930-4b81-9db2-faf39fdb70df"
                },
                {
                    "type": "ref",
                    "value": "4de3bf24-27d0-48e2-a7e6-410305e0334c"
                }
            ],
            "nodeid": "00000000-0000-0000-0001-3336ad58a20e",
            "instanceid": "f0aa22dd-e32f-49bb-9687-a0a50ef5c476"
        },
        {
            "node": "Google Recaptcha V3",
            "inputs": [],
            "nodeid": "a99b8f65-0fec-4871-a195-97a7dbcbf416",
            "instanceid": "2a717992-a930-4b81-9db2-faf39fdb70df"
        },
        {
            "node": "Smart contract whitelistit",
            "inputs": [],
            "nodeid": "d0ebe102-8f42-46d3-a31f-aabc0b34b7af",
            "instanceid": "4de3bf24-27d0-48e2-a7e6-410305e0334c"
        },
        {
            "node": "Single address call limit",
            "inputs": [],
            "nodeid": "0786acd0-7f6b-445e-9d5e-94432c551461",
            "instanceid": "3535822f-acf5-4ecb-b1a3-c71dae62b472"
        }
    ]
}
```
Convert to a tree like this:

![image](http://www.plantuml.com/plantuml/png/TOun2iCm34Ltdy8NoD2C7Kfk8bHR90PPAhPChz_MAIwKP1F_lu_UKWsBjSnED997YN3vdVD-hgeh4nGA-B2muPxMZCKWg5Z1OF3SaX6dQjysoMU3CHQg5G8o0wUSpBd-n4_JpR-hndQzgpAXkDDDX_jii5tl8Fzt7SWya3Fn0tGXYItp2m00)

- Tree node config description
  - `root`      It's a tree root node.
  - `node`      It's a node's name,just an alias
  - `inputs`    Some nodes can support child nodes or receive a value.
      - `inputs.type`   Support `ref` and `value`
      - `inputs.value`  When type is `ref`, the value is a instanceid,`references` will contain the node with this instanceid. When type is `value`, the value is a json value or json object.
  - `nodeid`    It's a node unique ID, the service will find the node class based on this ID.
  - `instanceid` Each node has an instanceid in the file,which is used to find corresponding configuration in `references` or match it in `instance config json`.

When finish the `tree node config`,add json to `calculate_tree_config` table of database. It needs to be associated with an appid.

### 4. Configuration instance config

This is a instance config sample:

```json
{
    "configs": [
        {
            "config": {
                "callLimit": 5,
                "timeInterval": 86400
            },
            "instanceid": "3535822f-acf5-4ecb-b1a3-c71dae62b472"
        },
        {
            "config": {
                "smartcontract_whitelist": [
                    {
                        "address": "0xf5bae8079C294b65DafE28f21acD4F627572cf40",
                        "functionHashs": [
                            "0x4e71d92d"
                        ]
                    }
                ]
            },
            "instanceid": "4de3bf24-27d0-48e2-a7e6-410305e0334c"
        },
        {
            "instanceid": "2a717992-a930-4b81-9db2-faf39fdb70df",
            "config":{
                "secret":"6LfL1-kZAAAAAAAa-0j_zhemiVcjGf1qI_iKwV-c"
            }
        }
    ],
    "instanceid": "2c114ecf-e51d-428c-b137-e67a41d6bad5"
}
```

The config in each `configs` is associated with the node in the `tree node config` via `instanceid`. The framework uses a unified function to manage `instance config` for each `appid`.

When finish the `instance config`,add json to `calculate_instance_config` table of database. It needs to be associated with an appid.

### 5. Development of remote sign serve

The server has a remote sign service, the server is used to protect the delegator private key. The server isn't open source,because each resellers has different security rules and implementation for the private key.

The framework include a [signServe interface](src/server/iSignServe.ts) and an [implementation](src/server/remoteSignServe.ts).

## 4.Execute process

  process

  ![image](http://www.plantuml.com/plantuml/png/ZP8nJyCm48LtViKfSv60iGFgW91O6LYZK_oQMiHsE9_Jmg-dTHpK8LR9vBjxtzD5ztPHMJIvuOxENxFdr45RZsD3zy_d6cWD1lIiGTe8cT1i8xmXmLT2r8ojoZ8_sV7fuV5zrdv0xFwxoGXHBo6DvAmn0uuiAErLfEgrxGxeFfTbQ6HXXtZJYfCUWjWVLXjy7jWklvVbwefR1cMZMJ3Ftrx-wQh2Fd9tQRpQGI6BszMWMC6RybgXibcq_V8xfSXjWGiJwDAWSa_A1zNJ9eZjhT_yNRBGAqpLAXTwgfFrM950a_WiPaqb4VLqNQUrHk_WJNB3Bm00)

1. send a delegator request

  ``` http
  POST /sign HTTP/1.1 localhost:18050/sign?authorization=c16499***********4389328704&recaptcha=-BS0b5*******AGGY3
  Content-Type: application/json;charset=UTF-
  {
      "raw":"0xf7278778f3e100d299a812dcdb942b990f387b513f6afa6b87a73f6533f2f19407ce80844e71d92d8082ea608088d5bbec1195eea92dc101",
      "origin":"0x0489a3fff1930b85f1d73eff8a4699281aadb558"
  }
  ```

2. `RequestInfoVerifyMiddleware.vip201RequestVerify`,check the request parames are valid.
3. `AuthorizationVerificationMiddleware.authorizationVerification`,check authorzationID valid.
4. the engine will found `tree config` and `instance config` by authorizationID, and create the a tree instance.
5. `TransactionFilterMiddleware.transactionFilter`, use engine to check the rules.
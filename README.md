# Fee Delegation as a Service (DaaS)

[![](https://badgen.net/badge/status/Alpha/red)]()
[![](https://badgen.net/badge/node/>=14.15/green)]()
[![](https://badgen.net/badge/storage/sqlite|mysql/blue)]()

> :warning: It just an `Alpha` Version ! Don't use it on the `Production Environment` or `VeChainThor Mainnet`.

## 1. Introduction

Fee Delegation as a Service (DaaS) is an infrastructure-level module that provides a framework for setting up a fee-delegation service based on the VIP-191 protocol on the VeChain Thor public blockchain. It allows projects to hide the complexity of paying transaction costs from their users entirely, significantly improving the user experience and making them more able to be mass adopted. According to the current design, applications that use the same DaaS services are identified by their authorizationID. The module includes a so-called `Request-Validation-Engine` that allows the service provider to configure different rules for different applications to filter txs. In this way, a single service can serve different applications without customization for each application. To learn more about `Request-Validation-Engine`, you can check this document (coming soon). For demonstration purposes, we have deployed the DaaS module on the testnet to provide the fee-delegation service for the following two applications:

- [faucet-new(Testnet)](https://github.com/mongelly/faucet-new)
- Vote(comming soon)

This project is aimed to provide a framework for efficiently setting up a VIP-191 fee-delegation service. We welcome more developers to join and together maintain the project. The figure below gives some examples of how DaaS can be used to provide fee-delegation services on Thor.

![image](http://www.plantuml.com/plantuml/png/VLBBReCm4BplL_W7SWZ7gAhIAdsSsaEZg3ThQvPWnGzabgHLr7-lQo81aGCdF3Cx2pDUjuo1Esl0KCM2lGXwNxCeTI35sZke0beIzArgT7iwWy9G2kLDAKze374Fr9udPsnROcdHuPuiEPOjXQDMrBDDq4TYaXl43_Y5ouwc-p9Q9IM5vHb4V9Aymav5DqSdkNbece4uUgOfT359pd9vmxiOURyzRwySDa-VLyWBsharnV-QXEuefgJTjlP1FXgl3kaOmn3f1M28ITmjxiSnhZYWQoiAWls1t5IvcCbpi9WNtYBIrBYGLHIuT1KQ_16xxUixm5K3QMQIT6OebPDN0yJOyroHSKgDPCNGLvFd0CQ_9IBVjp3vb3nS3F2QNDbPymS0)

## 2. API

The sign API follow [VIP201](https://github.com/vechain/VIPs/blob/master/vips/VIP-201.md)

Once the server started, the default api address is `http://localhost:18050`. the online *OpenAPI* doc default 

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

Here we talk about how to use the current code to run a fee-delegation service:

### 1. Development of calculate node

The project already includes some base and common units.

- base calculate units

    project path: `/src/utils/calculateEngine/src/builtinUnits`

    includes some logical operations units.
  - `Normal`
  - `And`
  - `Or`
  - `Not`

- request filter units
  
  project path:`/src/server/requestValidation/units`

  includes some common request filter nodes.
  - `GasLimit`
  - `GoogleRecaptchaCheck`
  - `SingleAddressCallLimit`
  - `SmartContractWhiteList`
  - `TxOriginWhiteList`

Each unit has a unique ID - unitID, if the units can't meet the needs of your dApp, you can implement your own, it needs to follow the `BaseRequestValidationUnit` abstract class, and add to the project.

Some units have an instance json config. A node can be configured for different instance json config to adapt to different dApps.

### 2. Register a new appid

 Each dApp need register an appid, which has a `tree node config` and an `instance config`.

   - Generate a appid like this `039be23b-ca50-4b50-97bb-34d9d2ce86ca`.
   - Add the appid to the `authorzation_info` table of the built in database.

### 3. Configuration of the tree node config

This is a tree node config sample:

```json
{
    "configID":"fea5300a-095d-4036-9092-e59761e45cdf",
    "root":{
        "instanceID":"2dab7719-951d-4c1c-806a-57211dc8c131",
        "unitID":"00000000-0000-0000-0001-3336ad58a20e",
        "inputs":[
            {
                "type":"ref",
                "value":"2b9cbb5e-5dbb-435b-9991-db59393a305e"
            },
            {
                "type":"ref",
                "value":"ba735eff-2184-4a1b-ab8c-66c3544e545c"
            }
        ]
    },
    "references":[
        {
            "instanceID":"2b9cbb5e-5dbb-435b-9991-db59393a305e",
            "unitID":"00000000-0000-0000-0001-3336ad58a20e",
            "inputs":[
                {
                    "type": "ref",
                    "value": "157343f4-0a1e-4a58-ba3f-5c54d65f3b0f"
                },
                {
                    "type": "ref",
                    "value": "2011d92e-4d04-46bb-8a8e-e765702398ab"
                }
            ]
        },
        {
            "instanceID":"157343f4-0a1e-4a58-ba3f-5c54d65f3b0f",
            "unitID":"a99b8f65-0fec-4871-a195-97a7dbcbf416",
            "inputs": []
        },
        {
            "instanceID":"2011d92e-4d04-46bb-8a8e-e765702398ab",
            "unitID":"d0ebe102-8f42-46d3-a31f-aabc0b34b7af",
            "inputs": []
        },
        {
            "instanceID":"ba735eff-2184-4a1b-ab8c-66c3544e545c",
            "unitID":"0786acd0-7f6b-445e-9d5e-94432c551461",
            "inputs": []
        }
    ]
}
```

Convert to a tree like this:

![image](http://www.plantuml.com/plantuml/png/TOun2iCm34Ltdy8NoD2C7Kfk8bHR90PPAhPChz_MAIwKP1F_lu_UKWsBjSnED997YN3vdVD-hgeh4nGA-B2muPxMZCKWg5Z1OF3SaX6dQjysoMU3CHQg5G8o0wUSpBd-n4_JpR-hndQzgpAXkDDDX_jii5tl8Fzt7SWya3Fn0tGXYItp2m00)

- Tree node config description
  - `root`      root node.
  - `node`      node's name,just an alias
  - `inputs`    some nodes can support child nodes or receive a value.
      - `inputs.type`   supports `ref` and `value`
      - `inputs.value`  when type is `ref`, the value is an instanceid,`references` will contain the node with this instanceid. When type is `value`, the value is a json value or json object.
  - `nodeid`    node's unique ID based on which, the service will find the node class.
  - `instanceid` each node has an instanceid in the file,which is used to find corresponding configuration in `references` or match it in `instance config json`.

When finishing the `tree node config`,add json to the `calculate_tree_config` table. It needs to be associated with an appid.

### 4. Configuration of instance config

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

The configuration in each `configs` is associated with the node in the `tree node config` via `instanceid`. The framework uses a unified function to manage `instance config` for each `appid`.

When finishing the `instance config`,add json to the `calculate_instance_config` table. It needs to be associated with an appid.

### 5. Development of remote signing service

The server requireshas a separate remote signing service that, the server is used to protects the service provider’s delegator private key. We decide not to implement the signing service isn't open source, because each service provider may have resellers has different security rules and implementation for the private key management.

The framework includes a signing Service interface and BE AWARE that the current implementation should NOT be used in production.

## 4.Execute process

  The figure below illustrates the interaction between the faucet contract and DaaS service:

  ![image](http://www.plantuml.com/plantuml/png/bPB1IiD048RlVOfXpnNKOm_IGn6yAdWjm-uq7Kncu-nigpwzSPTWaPXeJilyttmCuTycGxNSjIiOFdV0xCdsGcS7LtVWTeXFU-pPRH990ANNJCagEsQLF75_UttpM85dKZwyky81D1fp3ns7qD8PbUfuUkLNryOVoR-C5q2FYXsbHHLcEqRb3pIEKWBsvJqUDqFC2yQBAb3pXzqVhQOe2VtNu9vR8nrj5q5LJR7_LP24rPmgSICi3IJI4ti2bY4weAVoa-RoigxKHIFuGRaDbCxOspegDophG2qrQ56BTNfjKJbC1kMouRkve6HPfM0ul6YglXV5drZOaeJSjPy0)

1. send service request

  ``` http
  POST /sign HTTP/1.1 localhost:18050/sign?authorization=c16499***********4389328704&recaptcha=-BS0b5*******AGGY3
  Content-Type: application/json;charset=UTF-
  {
      "raw":"0xf7278778f3e100d299a812dcdb942b990f387b513f6afa6b87a73f6533f2f19407ce80844e71d92d8082ea608088d5bbec1195eea92dc101",
      "origin":"0x0489a3fff1930b85f1d73eff8a4699281aadb558"
  }
  ```

2. `RequestInfoVerifyMiddleware.vip201RequestVerify` is a built in middleware,it checks if request parameter are valid.

3. `AuthorizationVerificationMiddleware.authorizationVerification` is a built in middleware, it checks if authorizationID is valid.

4. The engine will find `tree config` and `instance config` by authorizationID, and creates thee instance.

5. `TransactionFilterMiddleware.transactionFilter`,is a built in middleware, it use the `Request-Validation-Engine` to check the rules.

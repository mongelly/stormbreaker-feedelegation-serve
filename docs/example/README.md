# Example configurations with faucet-new appliction

## Develop and Setup Up

1. When you first deploy the fee delegation serve. you need run service first, the service will initialize the database.
2. In faucet-new DApp, it have some rules to filter the request.

    - faucet-new is a Web-Application, so it must be enabled the Google reCAPTCHA Serve.
    - faucet-new have a smartcontract for sending VET and VTHO to the transaction orgin, so the serve just sign the transaction send to the smartcontract address `0x2b990f387b513f6afa6b87a73f6533f2f19407ce` and call the `claim` method.
    - a single address just call the `claim` method 5 times in 24 hours.
3. After i had confirm the rules, i designed a logical tree to be applied to the engine,like this.
![image](http://www.plantuml.com/plantuml/png/TOun2iCm34Ltdy8NoD2C7Kfk8bHR90PPAhPChz_MAIwKP1F_lu_UKWsBjSnED997YN3vdVD-hgeh4nGA-B2muPxMZCKWg5Z1OF3SaX6dQjysoMU3CHQg5G8o0wUSpBd-n4_JpR-hndQzgpAXkDDDX_jii5tl8Fzt7SWya3Fn0tGXYItp2m00)

4. I developed the nodes I needed and added them to the project, there will be common nodes for other application’s rules.

- Base calculate node
  - [And Node](./../../src/utils/calculateEngine/baseCalculateNode/and.ts)
- Request filter nodes
  - [Google Recaptcha Node](./../../src/server/requestFilter/nodes/googleRecaptchaCheck.ts)
  - [Signle Address Call Limit](./../../src/server/requestFilter/nodes/singleAddressCallLimit.ts)
  - [Smart Contract WhilteList](./../../src/server/requestFilter/nodes/smartContractWhilteList.ts)

- filter node can be include a configuration
  - `Google Recaptcha Node` configurations define.

    ``` json
        "secret":"6LfL1-******************iKwV-c" /// Google reCAPTCHA secret
    ```

  - `Signle Address Call Limit` configurations define.

    ``` json
        "callLimit": 5, 
        "timeInterval": 86400 //(24 hours)
    ```

  - `Smart Contract WhilteList` configurations define.

    ```json
        "smartcontract_whitelist": [
        {
            "address": "0x2b990f387b513f6afa6b87a73f6533f2f19407ce",    /// clause.to address
            "functionHashs": [
                "0x4e71d92d"    /// smart contract method hash
            ]
        }
    ]
    ```

5. According to there,nodes,configurations,i create two json configurations.
   - `tree config`:

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

   - `instance config json`

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
                            "address": "0x2b990f387b513f6afa6b87a73f6533f2f19407ce",
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
                    "secret":"6LfL1-******************iKwV-c"
                }
            }
        ],
        "instanceid": "2c114ecf-e51d-428c-b137-e67a41d6bad5"
    }
    ```

  - these configurations will be save to database,`tree config json` save to datatable `calculate_tree_config`,`instance config json` save to datatable `calculate_instance_config`.
  - create a new authorizationid ( as appid in database),and mapping a `tree config json` and a `instance config json`.
  - afer the steops are completed, the engine can be work.

6. he server has a remote sign service, the server is used to protect the delegator private key. i implementation a HDWallet (BIP44). I can set a authorzationID mapping a delegator address.
  - > the serve isn't open source, because each resellers has different security rules and implementation for the private key.

> We encourage developers to develop more common nodes after the engine release. But for now, the engine is strill under development, the code and configurations define will be change.

## Execute process

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
5. `TransactionFilterMiddleware.transactionFilter`, use engine to check the rules
     
     - Successful case

    ![image](http://www.plantuml.com/plantuml/png/TOz12W8n34NtFSM0wrauInSozn09eGsTGffAckBrrQcWADrz-j-ZFsirL6kPdPH04qg0uoSkFSPI8XCeURoPtx2_rengu8kOeZUuRyc8KxLtc-JbO0XAjO97Pk2KapctVpBDy-KGbKYkv-c9DBQJQICt5B-DFhGB-z1H-JlzZriwDpfcnAyaeML-0000)

     - Google recaptcah fail case

    ![image](http://www.plantuml.com/plantuml/png/TK-x2iCm3Dpz5O7E6PenGyX_b624hIO6sIwoJ7-_hHLeISbsw1vtcei0IuraKlROGVBs-eM3mZNdbT0oEdY8sq2l9GABTJa9WnFxt88WXI8x6zB70zupbc8T45aACOWnhQJh-zk5qIzJznPKal4ELD2S-ffXPSIqJBfp5AvesiwVDAKqx3Zy81jssTadVvM3LiwOV8tq0W00)

      - Exceeding single address limit case

    ![image](http://www.plantuml.com/plantuml/png/XS_12i8m30RW-vwYu7a7T_GWUm-H4jgu5T9MaXHVtrcak8tXZjdt__GVHO6rHEhCzqlPeu7axNb_6jQdAUU9q38wUAgROVrNuj9iNKxAuDI-vg18GNIZGlfqWFUC8jO1aQKGWtRDrSUOlh-T6FtzQXPOI2yF8C663dj-WhLeawkpgfaOCJMbN1hQ3TtvOUKFf__BZPXyYVG6)

    if all rules will return true, the server will send the transaction to `remote sign serve` and return delegator signature.

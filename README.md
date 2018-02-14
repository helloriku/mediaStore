# mediaStore
> What is it?

A Blockchain implementation of a Media Store. Implemented with Ethereum Smart-Contract. More [here](https://medium.com/@srirambandi/my-blockchain-decentralized-application-for-music-industry-ee9ae58f885f)

## Run on your machine:

````
  $ git clone https://github.com/srirambandi/mediaStore/
  $ cd mediaStore
  $ npm install
  $ npm install ethereumjs-testrpc
  $ node_modules/.bin/testrpc
  $ truffle migrate
  $ npm run dev
````

## check the deployed Contract

```
  $ find . -name '.DS_Store' -type f -delete (optional)
  $ truffle console

  Store.deployed().then(function(contractInstance){contractInstance.allCreators.call().then(function(v){console.log(v)})})
```

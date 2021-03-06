// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

/*
 * When you compile and deploy your Store contract,
 * truffle stores the abi and deployed address in a json
 * file in the build directory. We will use this information
 * to setup a Store abstraction. We will use this abstraction
 * later to create an instance of the Store contract.
 * Compare this against the index.js from our previous tutorial to see the difference
 * https://gist.github.com/maheshmurthy/f6e96d6b3fff4cd4fa7f892de8a1a1b4#file-index-js
 */

import Store_artifacts from '../../build/contracts/Store.json'

var Store = contract(Store_artifacts);

let creators = {};
let consumers = {};
let index = 0;

window.setAccount = function() {
  index = $("#account").val();
  web3.eth.defaultaAccount = web3.eth.accounts[index];
  $("#logs").html(web3.eth.defaultaAccount + "</br>");
  Store.deployed().then(function(contractInstance) {
    contractInstance.allCreators.call().then(function(candidateArray) {
      //candidateArray --> byte32[] datatype
      for(let i = 0; i < candidateArray.length; i++) {
        // console.log("candidateArray: " + candidateArray[i] + " -> "+web3.toUtf8(candidateArray[i]));
        creators[web3.eth.accounts[i]] = web3.toUtf8(candidateArray[i]);
      }
      if (web3.eth.defaultaAccount in creators) {
        loadCreator();
      }
      else {
        loadConsumer();
      }
    });
  });
  console.log("setAccount: " + web3.eth.defaultaAccount);
}


function loadCreator() {
  $("#logs").append("<h3> User Type: Creator</h3><hr>");
  let address = web3.eth.defaultaAccount;
  Store.deployed().then(function(contractInstance) {
    contractInstance.getWallet.call(address).then(function(balance) {
      $("#right-lower").html("<h3>Your account balance :  $"+balance.toString()+"</h3>");
    });
  });
  Store.deployed().then(function(contractInstance) {
    contractInstance.getMediaCount.call(address).then(function(mediaSize) {
      let mediaCount = parseInt(mediaSize.c[0]);
      if (mediaCount != 0) {
        $("#logs").append('<h3>You have uploaded '+mediaCount+' creations.</h3></br></br></br></br><h2>Songs Uploaded</h2>');
        for (let i = 0; i < mediaCount; i++) {
          Store.deployed().then(function(contractInstance2) {
            contractInstance2.getMedia.call(address, i).then(function(r1) {
              // console.log(r1);
              let cururl = r1[0];
              console.log("url: "+cururl);
              $("#logs").append('</br></br><h3>'+web3.toUtf8(r1[1])+"</h3>");
              $("#logs").append('<audio controls id="output" src="'+cururl+'"></audio>');
            });
          });
        }
      }
      else {
        $("#logs").append("<h3>You have not uploaded any creations yet.</h3>");
      }
    });
    $("#logs").append('<form class="form-inline" action="/"><div class="form-group"><fieldset><h3>Upload Song!</h3><input type="file" class="form-control-file" name="media" id="media"><input type="text" class="form-control" name="title" id="title" placeholder="title"><input class="form-control" type="text" name="price" id="price" placeholder="price">&nbsp:<button type="button" class="btn btn-primary mb-2" onclick="upload()">Upload</button></fieldset></div></form></br></br><a id="url"></a><hr></br></br>');
    $("#right-lower").html('');
    showTransactions();
  });
}

function showTransactions() {
  $("#right-upper").html('<h2>Transactions</h2>');
  Store.deployed().then(function(contractInstance) {contractInstance.Transfer({_to: web3.eth.defaultaAccount}, {fromBlock: 0,toBlock: 'latest'})
    .get((error, logs) => {
     logs.forEach(
       log => $("#right-upper").append("<span style=\"color:#47A244\">"+JSON.parse(JSON.stringify(logs[0].args._from))+" -- "+JSON.parse(JSON.stringify(logs[0].args._value))+" $</span></br></br>")
     )
    });
  });
}

function loadConsumer() {
  $("#logs").append("<h3> User Type: Consumer</h3><hr>");
  $("#right-upper").html('');
  let address = web3.eth.defaultaAccount;
  // Store.deployed().then(function(contractInstance) {
  //   contractInstance.getWallet.call(address).then(function(balance) {
  //     $("#logs").append("<h3>Your account balance :  $"+balance.toString()+"</h3>");
  //   });
  // });
  Store.deployed().then(async function(contractInstance) {

    for (var key in creators) {
      $("#logs").append('</br><button type="button" class="btn btn-primary btn-lg btn-block" data-toggle="collapse" data-target=#'+creators[key]+'>'+creators[key]+'</button><div id='+creators[key]+' class="collapse"></div>');
      let address = key;
      var mediaSize = await contractInstance.getMediaCount.call(address);
      // .then(function(mediaSize) {

        let mediaCount = parseInt(mediaSize.c[0]);
        if (mediaCount != 0) {
          $("#"+creators[key]).append(mediaCount+' songs');
          $("#"+creators[key]).append('<div class="table-responsive"><table class="table table-bordered table-dark"><tbody id='+ creators[key]+"tab" +'>');

          for (let i = 0; i < mediaCount; i++) {
              var r = await contractInstance.getMedia.call(address, i);
                console.log("here5: "+r[0]);
                var checkBool = await contractInstance.checkMediaForConsumer.call(r[0],web3.eth.defaultaAccount);
                console.log("checkMediaForConsumer: "+checkBool);
                if (checkBool) {
                  $('#'+creators[key]+"tab").append('<tr><td scope="row"><h3>'+web3.toUtf8(r[1])+'</h3></td><td><audio controls src="'+r[0]+'"></audio></td></tr>');
                }
                else{
                  $('#'+creators[key]+"tab").append('<tr><td scope="row"><h3>'+web3.toUtf8(r[1])+'</h3></td><td><h3>'+r[2]+'$'+'</h3><button type="button" class="btn btn-primary" onclick="buy(\'' + r[0] + '\')">Buy</button></td></tr>');
                }
          }

          $('#'+creators[key]).append('</tbody></table></div>');

      }
      else {
        $("#"+creators[key]).append('No songs');
      }
    }
    let address = web3.eth.defaultaAccount;
    Store.deployed().then(function(contractInstance) {
      contractInstance.getWallet.call(address).then(function(balance) {
        $("#right-lower").append("<h3>Your account balance :  $"+balance.toString()+"</h3>");
      });
    });

    $("#right-lower").html('<h3>Add to Wallet</h3>');
    $("#right-lower").append('<hr><br/><input type="text" id="amountToWallet" class="col-sm-2" placeholder="Add to wallet"/> $ &nbsp;<a href="#" onclick="addToWallet()" class="btn btn-primary">Buy</a>');
  });
}

window.buy = function(url){
  Store.deployed().then(function(contractInstance) {
    contractInstance.buy.sendTransaction(url,{gas: 1000000, from: web3.eth.defaultaAccount}).then(function(r) {
      console.log("urlll: "+url);
      console.log("buy here: "+r);
    });
  });
}

window.upload = function() {
  const reader = new FileReader();
  reader.onloadend = function() {
    const ipfs = window.IpfsApi('localhost', 5002) // Connect to IPFS
    const buf = buffer.Buffer(reader.result) // Convert data into buffer
    ipfs.files.add(buf, (err, result) => { // Upload buffer to IPFS
      if(err) {
        console.error(err)
        return
      }
      let url = `https://ipfs.io/ipfs/${result[0].hash}`
      console.log(`Url --> ${url}`)
      document.getElementById("url").innerHTML= url
      document.getElementById("url").href= url
      // document.getElementById("o utput").src = url
      let creatorAddress = web3.eth.defaultaAccount;
      let mediaTitle = $("#title").val();
      let mediaPrice = parseInt($("#price").val());
      Store.deployed().then(async function(contractInstance) {
        try {
          var r = await contractInstance.addMedia.sendTransaction(url, mediaTitle, mediaPrice, {gas: 1000000, from: web3.eth.defaultaAccount});
        } catch (e) {
          alert("This Duplicate Song can't be uploaded");
        }
        console.log("imppp: "+r);
      });
      setAccount();
    })
  }
  const song = document.getElementById("media");
  reader.readAsArrayBuffer(song.files[0]); // Read Provided File
}

window.addToWallet = function() {
  let amtow = $("#amountToWallet").val();
  Store.deployed().then(function(contractInstance) {
    contractInstance.addToWallet.sendTransaction(amtow, {gas: 1000000, from: web3.eth.defaultaAccount}).then(function(r) {
      console.log("amount added : "+r);
    });
  });
}

$( document ).ready(function() {
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  Store.setProvider(web3.currentProvider);
  web3.eth.defaultaAccount = web3.eth.accounts[index];
  $("#account").val(0);
  setAccount();
  // console.log(web3.eth.defaultaAccount);
});

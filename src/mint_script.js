#!/usr/bin/env node

const isLocal = false; // mint locally or on ic
var minterSeed = "antique truth police leave olympic build chapter orange review belt custom december";


var canisterIdIC = "5kuny-yiaaa-aaaal-acgta-cai";
var canisterIdLocal = "rno2w-sqaaa-aaaaa-aaacq-cai";

var basePath = "/home/user/projects/collection/"
basePath = "/home/waheed/SuperNova/generative-art-node/"
var assetPathBase = basePath+ "build/";
var thumbsPathBase = basePath +"build/";

require = require('esm-wallaby')(module);
var fetch = require('node-fetch');
var fs = require('fs');
const sharp = require('sharp');
const glob = require("glob");
const extjs = require("./extjs/extjs");
const utils = require("./extjs/utils");
global.fetch = fetch;

const bip39 = require('bip39')
const mime = require('mime');

const Ed25519KeyIdentity = require("@dfinity/identity").Ed25519KeyIdentity;
const HttpAgent = require("@dfinity/agent").HttpAgent;
const Actor = require("@dfinity/agent").Actor;
const Principal = require("@dfinity/principal").Principal;
const V2IDL = require("./v2.did.js").default;
const NFTFACTORY = "bn2nh-jaaaa-aaaam-qapja-cai";
const NFTFACTORY_IDL = ({ IDL }) => {
  const Factory = IDL.Service({
    'createCanister' : IDL.Func([IDL.Text, IDL.Text], [IDL.Principal], []),
  });
  return Factory;
};


const mnemonicToId = (mnemonic) => {
  var seed = bip39.mnemonicToSeedSync(mnemonic);
  seed = Array.from(seed);
  seed = seed.splice(0, 32);
  seed = new Uint8Array(seed);
  return Ed25519KeyIdentity.generate(seed);
}

var id = mnemonicToId(minterSeed);

 


var API;
if (isLocal)
{
  console.log("Local.....");

  var agent = new HttpAgent({
    host : "http://localhost:8000",
    identity : id
  });
  agent.fetchRootKey();

  API = Actor.createActor(V2IDL, {
    agent : agent,
    canisterId : canisterIdLocal // your canister id on local network
  });
}
else
{
  API = Actor.createActor(V2IDL, {
    agent : new HttpAgent({
      host : "https://boundary.ic0.app/",
      identity : id
    }),
    canisterId : canisterIdIC
  });
  
}




const CHUNKSIZE = 1900000;

//Internal -> true for thumbnails, goes directly on collection canister. If false, goes to asset canister.
// api -> canister actor
// ah -> asset handle (usually filename without extension)
// filename -> full file name (with extension)
// filepath -> full file path (including filename)

const uploadAsset = async (internal, api, ah, filename, filepath) =>{
  var data = fs.readFileSync(filepath);
  var type = mime.getType(filepath); 
  var pl = [...data];
  await api.ext_assetAdd(ah, type, filename, (internal ? {direct:[]} : {canister:{canister:"",id:0}}), pl.length);
  var numberOfChunks = Math.ceil(pl.length/CHUNKSIZE);
  var c = 0;
  var first = true;
  var total = Math.ceil(pl.length/CHUNKSIZE);
  while (pl.length > CHUNKSIZE) {
    c++;
    await api.ext_assetStream(ah, pl.splice(0, CHUNKSIZE), first);
    if (first) first = false;
  };
  await api.ext_assetStream(ah, pl, first);  
  return true;
}
const removeFilenameExtension = (filename) => {
  return filename.split('.').slice(0, -1).join('.');
};

(async () => {

          // first we create required asset canisters - usually we use 800mb per asset canister, so for a collection of 1.5gb worth of assets this would be 2 asset canisters
          //await API.ext_addAssetCanister();
          //await API.ext_addAssetCanister();
          //await API.ext_addAssetCanister();

          //loop through all assets, and call upload asset
          var collLen = 5;
          var alreadyMinted = 0
          var i = -1 + alreadyMinted;
          var toMint = [];
          while (++i < collLen)
          {
            var filename = "" + i + ".png";
            var ahAsset = removeFilenameExtension(filename);
            var ahThumb = ahAsset+"_thumbnail";
            var asset = assetPathBase+filename;
            var thumb = thumbsPathBase + removeFilenameExtension(filename) + ".png";

            //await uploadAsset(true, API, ahThumb, filename, thumb)  // upload thumbnail            
            //await uploadAsset(false, API, ahAsset, filename, asset); // upload image

            console.log("Currently in " + i);


            // add asset handlers to toMint array
            toMint.push([
              "a5a9dce51088dc4584342667844fb29cd120020274a95f3329026693375a78b0",
              {
                nonfungible : {
                  name : ""+i+"_front",
                  asset : ahAsset,
                  thumbnail : ahAsset,
                  metadata : []
                }
              }
              
            ])

          }

          // mint in the end
          await API.ext_mint(toMint);

        })();

    
    

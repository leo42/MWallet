import {  Utils , C , Lucid, Blockfrost ,ExternalWallet , TxComplete } from "./lucid/dist/esm/mod.js";
import Datasource  from "./Datasource";
import { Kupmios } from "lucid-cardano";
const { Transaction} = C;

const data1 = await Datasource.from_blockfrost("preprodLZ9dHVU61qVg6DSoYjxAUmIsIMRycaZp")

class Wallet {
    // Initialize the wallet with the provided script and address
    constructor(wallet_json,name) {
    //   const address =  Address.from_bech32("addr_test1qpy8h9y9euvdn858teawlxuqcnf638xvmhhmcfjpep769y60t75myaxudjacwd6q6knggt2lwesvc7x4jw4dr8nmmcdsfq4ccf") // L
            
    //   const address2 =  Address.from_bech32("addr_test1qpceptsuy658a4tjartjqj29fhwgwnfkq2fur66r4m6fpc73h7m9jt9q7mt0k3heg2c6sckzqy2pvjtrzt3wts5nnw2q9z6p9m") // Trash

    //   let mintingScripts =  NativeScripts.new()
    //   mintingScripts.add( NativeScript.new_script_pubkey( ScriptPubkey.new( BaseAddress.from_address(address).payment_cred().to_keyhash())))
    //   mintingScripts.add( NativeScript.new_script_pubkey( ScriptPubkey.new( BaseAddress.from_address(address2).payment_cred().to_keyhash())))
    //   console.log(NativeScript.new_script_all( ScriptAll.new(mintingScripts)).to_json())
    //   this.wallet_script = NativeScript.new_script_all( ScriptAll.new(mintingScripts))
      this.signersNames = []
       
      this.wallet_script = JSON.parse(JSON.stringify(wallet_json))
      this.spending_script =  JSON.parse(JSON.stringify(wallet_json))
      this.staking_script = JSON.parse(JSON.stringify(wallet_json))
      this.wallet_address = "";
      this.name=name
      this.defaultAddress= ""
      this.txDetails = {}
      this.pendingTxs = [];
      this.addressNames = {}
      console.log(this.spending_script, this.staking_script, this.signersNames)
    }

    extractSignerNames(json) {
      for (const key in json) {
        if (json.hasOwnProperty(key)) {
          const element = json[key];
          if (element.type === "sig"){
            this.signersNames.push( { hash:element.keyHash , name:element.name})


          } else if (typeof element === 'object') {
            this.extractSignerNames(element);
          } 
        }
      }
    }

    refinePaymentScript(json) {
      for (const key in json) {
        if (json.hasOwnProperty(key)) {
          const element = json[key];
          if (element.type === "sig"){
            if (element.keyHash.substring(0, 5)=== "addr_"){
              element.keyHash=this.lucid.utils.getAddressDetails(element.keyHash).paymentCredential.hash
            }
          } else if (typeof element === 'object') {
            this.refinePaymentScript(element);
          } 
        }
      }
    }

    refineStakingScript(json) {
      for (const key in json) {
        if (json.hasOwnProperty(key)) {
          const element = json[key];
          if (element.type === "sig"){
            if (element.keyHash.substring(0, 5)=== "addr_"){
              element.keyHash=this.lucid.utils.getAddressDetails(element.keyHash).stakeCredential.hash
            }
          } else if (typeof element === 'object') {
            this.refineStakingScript(element);
          } 
        }
      }
    }

    keyHashToSighnerName(keyHash){
      for(var index=0; index< this.signersNames.length; index++){
        if (this.signersNames[index].hash == keyHash){
          let name=this.signersNames[index].name
          return name
        };
      }
    }

    async initialize (settings){
      if(settings.provider === "Blockfrost"){
      this.lucid = await Lucid.new(
        new Blockfrost(settings.api.url, settings.api.projectId),
        settings.network,
      );
     }else if(settings.provider === "Kupmios"){
        this.lucid = await Lucid.new(
          new Kupmios(settings.api.kupoUrl, settings.api.ogmiosUrl),
          settings.network,
        );
      }else if(settings.provider === "MWallet"){
        new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "preprodLZ9dHVU61qVg6DSoYjxAUmIsIMRycaZp"),
        settings.network
      }
      

      this.refinePaymentScript(this.spending_script)
      this.extractSignerNames(this.spending_script)
      this.refineStakingScript(this.staking_script)
      console.log(this.spending_script, this.staking_script, this.signersNames)
      this.lucidNativeScript = this.lucid.utils.nativeScriptFromJson(this.spending_script )
      this.lucidNativeStakingScript = this.lucid.utils.nativeScriptFromJson(this.staking_script )
      this.lucid.selectWalletFrom(  { "address":this.getAddress()})
      await this.loadUtxos()

    } 

    async changeSettings(settings){
      try{
      if (settings.provider === "Blockfrost"){
        await this.lucid.switchProvider(new Blockfrost(settings.api.url, settings.api.projectId), settings.network)
      }else if (settings.provider === "Kupmios"){
        await this.lucid.switchProvider(new Kupmios(settings.api.kupoUrl, settings.api.ogmiosUrl), settings.network)
      }
      await this.loadUtxos()
    }catch(e){
      throw new Error('Invalid Connection Settings'+ e);
    }
    }



    
    getJson() {
      return this.wallet_script;
    }

    getName(){
      return this.name
    }
    getSignatures(){
      return this.signatures;
    }

    getBalance(){
      const utxos = this.utxos
      let result = 0
      utxos.map( utxo => {
        result += Number( utxo.assets.lovelace)
      }

      )
      return result
   }

   getBalanceFull(address=""){
    const utxos = this.utxos
    let result = {}
    utxos.map( utxo => {
      if (address==="" || utxo.address ===address){
        for (var asset in  utxo.assets ) {
          asset in result ? result[asset] +=  utxo.assets[asset] : result[asset] =   utxo.assets[asset]
        } 
      } 
    }
     )
    return result
 }

 async getTransactionHistory(address){
  //return [{thHash:"adsaecf"},{thHash:"asda"}]
   let txList= await this.lucid.provider.getTransactions(address)
   let result = []
   for(let index =0 ; index < txList.length; index++){
     if (!(txList[index].tx_hash in this.txDetails)){
       const txDetails = txList[index]
       txDetails.utxos =  await this.lucid.provider.getTransactionUtxos(txList[index].tx_hash)
      this.txDetails[txList[index].tx_hash] = txDetails
    } 
    result.push(this.txDetails[txList[index].tx_hash])
  }
   return result.sort((a,b) => {return b.block_time - a.block_time})   
 }

    getAddress(stakingAddress="") {
        const rewardAddress = stakingAddress === "" ? this.lucid.utils.validatorToScriptHash(this.lucidNativeStakingScript) : this.lucid.utils.getAddressDetails(stakingAddress).stakeCredential.hash
        return this.lucid.utils.validatorToAddress(this.lucidNativeScript, {type:"key", hash: rewardAddress} )
    }

 
    getSigners(){
      return this.signersNames
    }

    getFundedAddress(){
      const utxos = this.utxos
      let result = []
      utxos.map( utxo => {
        result.push(utxo.address);
          
         }
        )
        
      return  [...new Set(result)]; 
    }

    getUtxos() {
        return this.utxos
    }
   
    async loadUtxos() {
      this.utxos = await this.lucid.provider.getUtxos(this.lucid.utils.getAddressDetails(this.getAddress()).paymentCredential)
    }
    
    getPendingTxs(){
        return this.pendingTxs
    }

    decodeTransaction(tx){
      const uint8Array = new Uint8Array(tx.toString().match(/.{2}/g).map(byte => parseInt(byte, 16)));
      const txBody =  Transaction.from_bytes(uint8Array).body().to_js_value()
  
      return txBody

    }

    getPendingTxDetails(index){
      const txDetails = this.decodeTransaction(this.pendingTxs[index].tx)
      txDetails.signatures = txDetails.required_signers.map( (keyHash) => (
        {name: this.keyHashToSighnerName(keyHash) , keyHash:keyHash , haveSig: (keyHash in this.pendingTxs[index].signatures ? true : false)}
      ))
      return txDetails
    }

    checkSigners(signers){
        const json=this.spending_script
        console.log(json)
        const that = this
        let requires_before = false
        let requires_after = false
        let result = checkRoot(json)
        if (result){
          return ({requires_before:requires_before, requires_after:requires_after})
        }
        else{
          return false
        }
        function checkAll(json){
              for (var index = 0; index < json.length; index++){

                if (!checkRoot(json[index]) ){
                  return false;
                }
              }
              return true
          }

        function checkAny(json){
            for (var index = 0; index < json.length; index++){

              if (checkRoot(json[index]) ){
                return true;
              }
            }
            return false
        }

        function checkAtLeast(json,required){
          var sigs=0;
          for (var index = 0; index < json.length; index++){

            if (checkRoot(json[index]) ){
               sigs++
               
            }
            if(sigs >= required){
              return true
            }
            
          }
          return false
       }
        

        function checkSig(json){

            if( signers.includes( json.keyHash))
              return true
            else
              return false
        }

        function checkBefore(json){ 
          const slot = json.slot          
          const currentSlot = that.lucid.utils.unixTimeToSlot(Date.now())
          console.log(slot,currentSlot)
          if (slot > currentSlot){
              (requires_before === false || requires_before > json.slot) ? requires_before = json.slot : null
              return true
          }
          else{
              return false
          }
        }     
      

        function checkAfter(json){
          const slot = json.slot          
          const currentSlot = that.lucid.utils.unixTimeToSlot(Date.now())
          if (slot < currentSlot){
              (requires_after === false || requires_after < json.slot) ? requires_after = json.slot : null
      
            return true
          }
          else{
              return false
          }
        }

        function checkRoot(json) {
            switch (json.type) {
              case "all": 
                    return checkAll(json.scripts)
                    break;
              case "any": 
                    return checkAny(json.scripts)
                    break;
              case "atLeast":
                    return  checkAtLeast(json.scripts,json.required)
                    break;
              case "sig":
                    return checkSig(json)
                    break;              
              case "before":
                    return checkBefore(json)
                    break;              
              case "after":
                    return checkAfter(json)
                    break;
          }}
      }

      
    
    
    async createTx(recipients, signers,sendFrom  ){ 
        const sigCheck = this.checkSigners(signers)
        if (!sigCheck){
          throw new Error('Not enough signers');
        }

       
        
        if(sendFrom!==""){
          let utxos = this.utxos.filter( (utxo,index) => (utxo.address === sendFrom)  )
          this.lucid.selectWalletFrom(  { "address":sendFrom, "utxos": utxos})
        }else{
          this.lucid.selectWalletFrom(  { "address":this.getAddress(), "utxos": this.utxos})
        }

        const tx = this.lucid.newTx()
        recipients.map( recipient => (
          tx.payToAddress(recipient.address,recipient.amount)
        ))

        
        console.log(sigCheck)
        if (sigCheck.requires_after !== false){
          tx.validFrom( this.lucid.utils.slotToUnixTime(sigCheck.requires_after))
          
        }

        if (sigCheck.requires_before !== false){
          tx.validTo( this.lucid.utils.slotToUnixTime(sigCheck.requires_before))
        }

        signers.map( value => (
          tx.addSignerKey(value)
        ))


        tx.attachSpendingValidator(this.lucidNativeScript)
        const completedTx = await tx.complete()
//await tx.complete({ change :{address :changeAddress }}) :
        this.pendingTxs.map( (PendingTx) => {
          console.log(PendingTx.tx.toHash(),completedTx.toHash())
          if (PendingTx.tx.toHash() === completedTx.toHash()) {
            throw new Error('Transaction already registerd');
          }
      })

        this.pendingTxs.push({tx:completedTx, signatures:{}})
        return "Sucsess"
    }

    async importTransaction(transaction)
    { 
      console.log(transaction)
      const uint8Array = new Uint8Array(transaction.match(/.{2}/g).map(byte => parseInt(byte, 16)));

      const tx =  new   TxComplete(this.lucid, Transaction.from_bytes(uint8Array)) 
 //     tx.txBuilder = 
      const txInfo = this.decodeTransaction(tx)
      if (!tx.txComplete.is_valid()) {throw new Error('Transaction is not valid');}

      try{
        this.pendingTxs.map( (PendingTx) => {
          console.log(PendingTx.tx.toHash(),completedTx.toHash())
          if (PendingTx.tx.toHash() === transaction.toHash()) {
            throw new Error('Transaction already registerd');
          }
         })

      this.pendingTxs.push({tx:tx, signatures:{}})
      
      }catch(e){
        throw new Error('Transaction already registerd');
      }
    }

    

    async createDelegationTx(pool, signers){ 

      const rewardAddress =  this.lucid.utils.validatorToRewardAddress(this.lucidNativeStakingScript)
      if (!this.checkSigners(signers)){
        console.log("Not enough signers")
        return "Not enough signers"
      }

      const tx = this.lucid.newTx()

      signers.map( value => (
        tx.addSignerKey(value)
      ))
      
      tx.payToAddress(this.getAddress(),{lovelace: 5000000})
       // .delegateTo(rewardAddress,pool)
      .attachSpendingValidator(this.lucidNativeScript)
      .attachWithdrawalValidator(this.lucidNativeStakingScript)
      .registerStake(rewardAddress)
   
   
      const uint8Array = new Uint8Array(this.lucid.utils.validatorToScriptHash(this.lucidNativeStakingScript).match(/.{2}/g).map(byte => parseInt(byte, 16)));

      C.StakeDelegation.new(
          tx.txBuilder.add_certificate(C.Certificate.new_stake_delegation(
          C.StakeDelegation.new( C.StakeCredential.from_scripthash(
            C.ScriptHash.from_bytes(uint8Array)  
          ),
          C.Ed25519KeyHash.from_bech32(pool)  
      ))))

      const completedTx =await tx.complete()
      
     this.pendingTxs.push({tx:completedTx, signatures:[]})

      return "Sucsess"
    }

    isAddressMine(address){
      return (this.lucid.utils.getAddressDetails(address).paymentCredential.hash === this.lucid.utils.getAddressDetails(this.getAddress()).paymentCredential.hash)
    }
    decodeSignature(signature){

      
      const witness  =  C.TransactionWitnessSet.from_bytes(this.hexToBytes(signature))
      const signer = witness.vkeys().get(0).vkey().public_key().hash().to_hex()

      return {signer: signer , witness : witness}     
    }
    hexToBytes(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    }
    
    addSignature(signature){
      console.log(signature)
      const signatureInfo = this.decodeSignature(signature)
      this.signersNames.some(obj => obj.keyHash === signatureInfo.signer);

      for (var index = 0; index < this.pendingTxs.length; index++){
            if (signatureInfo.witness.vkeys().get(0).vkey().public_key().verify( this.hexToBytes(this.pendingTxs[index].tx.toHash()), signatureInfo.witness.vkeys().get(0).signature()))
            {
              if (!(signatureInfo.signer in this.pendingTxs[index].signatures)) {
                   this.pendingTxs[index].signatures[signatureInfo.signer] = (signature)
                }else{
                   throw new Error('Signature already registerd');
                  }
            }

        }

    }

    getSignature(index,keyHash){
      return this.pendingTxs[index].signatures[keyHash]
    }

    async submitTransaction(index){
       const tx = this.pendingTxs[index]
       const signedTx = await tx.tx.assemble(Object.values(tx.signatures)).complete();
       const txHash = await signedTx.submit();
       this.pendingTxs = this.pendingTxs.filter( (item,i) => i!==index)
      return( this.lucid.awaitTx(txHash))

    }
    // Setters
    setScript(wallet_script) {
      this.wallet_script = wallet_script;
    }

    setDefaultAddress(address){
      this.defaultAddress = address
    }
    
    setAddressNamess(names){
      this.addressNames = names

    }


    changeAddressName(address,name){
      this.addressNames[address] = name
    }

    getDefaultAddress(){
     return this.defaultAddress 
    }
    getAddressNames(){
      return this.addressNames
    }
    
    getAddressName(address){
      const resault = address in this.addressNames ? this.addressNames[address] : address
      return resault
    }

  }

  export default Wallet;
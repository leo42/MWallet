import React from "react";
import WalletPicker from "./WalletPicker"


function MWalletPendingTxs(props) {
    const [walletPickerOpen, setWalletPickerOpen] = React.useState(false);

    async function signWithLocalWallet(wallet){
        const api = await window.cardano[wallet].enable()
        const signature = await api.signTx(props.tx.tx.toString() ,true)
        props.root.addSignature(signature)
      }  
      
    const txDetails = props.root.state.wallets[props.root.state.selectedWallet].getPendingTxDetails(props.index)
    console.log(txDetails)
    console.log(props.root.state.wallets[props.root.state.selectedWallet].keyHashToSighnerName(txDetails.required_signers[0]))


    return (
        <div className="pedningTx">
             {walletPickerOpen && <WalletPicker setOpenModal={setWalletPickerOpen} operation={signWithLocalWallet} tx={props.tx}/>}
            {txDetails.signatures.map( (item, index) => (
                <div key={index} className={"pendingTx_signer"+ (item.haveSig ? " pendingTx_signer_signed" : "")} >Hey { item.name}</div>
            )

             )}
            
            <button onClick={() => setWalletPickerOpen(true)} >add signature</button>
        
            <button onClick={() => props.root.submit(props.tx)} >Submit</button>
        </div>
    )
}

export default MWalletPendingTxs
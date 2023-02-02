import React from "react";
import "./SettingsModal.css";
import { useState} from 'react';
import {  toast } from 'react-toastify';

function SettingsModal(props) {
  const [network, setNetwork] = useState(props.root.state.settings.network);
  const [provider, setProvider] = useState(props.root.state.settings.provider);
  const [providerConnection, setProviderConnection] = useState(props.root.state.settings.api);
  const [metadataProvider, setMetadataProvider] = useState(props.root.state.settings.metadataProvider);
  
  function changeProvider(provider){
    setProvider(provider)
    if(provider === "Blockfrost"){
      setProviderConnection({
        "projectId": ""
      } )
    }else if(provider === "MWallet"){
      
      setProviderConnection({})
    }else if(provider === "Kupmios"){
      setProviderConnection({"kupoUrl": "" , "ogmiosUrl": ""})
    }    
  }
  
  function applyNetworkSettings() {
    let localproviderConnection = providerConnection
    if (provider === "Blockfrost"){
      if (providerConnection.url === "" || providerConnection.projectId === ""){
        toast.error("Please fill all fields");
        return
      }
      switch (network) {
        case "Mainnet": 
          localproviderConnection.url = "https://cardano-mainnet.blockfrost.io/api/v0"  
          break;
        case "Testnet":
          localproviderConnection.url = "https://cardano-testnet.blockfrost.io/api/v0"
          break;
        case "Preprod":
          localproviderConnection.url = "https://cardano-preprod.blockfrost.io/api/v0"
          break;
        default:
          localproviderConnection.url = "https://cardano-preprod.blockfrost.io/api/v0"
          break;
      }

    }
    else if (provider === "Kupmios"){
      if (providerConnection.kupoUrl === "" || providerConnection.ogmiosUrl === ""){
        toast.error("Please fill all fields");
        return
      }
    }else if (provider === "MWallet"){
      switch (network) {
      case "Mainnet": 
      localproviderConnection.url = "https://cardano-mainnet.blockfrost.io/api/v0"  
      localproviderConnection.projectId = "mainnetpHvIYtcVH3eRVTJLwln9cd6aUCC9zAh6"
      break;
    case "Testnet":
      localproviderConnection.url = "https://cardano-testnet.blockfrost.io/api/v0"
      break;
    case "Preprod":
      localproviderConnection.url = "https://cardano-preprod.blockfrost.io/api/v0"
      localproviderConnection.projectId = "preprodLZ9dHVU61qVg6DSoYjxAUmIsIMRycaZp"
      break;
    default:
      localproviderConnection.url = "https://cardano-preprod.blockfrost.io/api/v0"
      break;


  }
    }

      

    const applySetting = props.root.setSettings({
      "network": network,
      "provider": provider,
      "api": providerConnection,
      "metadataProvider": metadataProvider
    })
    toast.promise(applySetting, { loading: "Applying settings", 
                                  success: "Settings applied", 
                                  error:{
                                    render({data}){
                                      // When the promise reject, data will contains the error
                                      return `message=${data.message}`
                                    } }})

  }

  function providerSettings(){
    if(provider === "Blockfrost"){
      return (
        <div>

          <input type="text" placeholder="projectId" value={providerConnection.projectId} onChange={(event) => setProviderConnection({...providerConnection, projectId: event.target.value})} />
    </div>
      )}else if(provider === "MWallet"){
        return ("")}
      else if(provider === "Kupmios"){
        return ( <div>
          <input type="text" placeholder="kupoUrl" value={providerConnection.kupoUrl} onChange={(event) => setProviderConnection({...providerConnection, kupoUrl: event.target.value})} />    
          <br/>
          <input type="text" placeholder="ogmiosUrl" value={providerConnection.ogmiosUrl} onChange={(event) => setProviderConnection({...providerConnection, ogmiosUrl: event.target.value})} />
          </div>
        )}
  }  



  return (
    <div className="modalBackground" >
      <div className="modalContainer"  >
        <div className="titleCloseBtn">
          <button
            onClick={() => {
              props.setOpenModal(false);
            }}
          >
            X
          </button>
        </div>
  
        <div className="title">
        </div>
        <div className="body">
          <h1>Network Settings</h1>
        <select onChange={(event) => setNetwork(event.target.value)} defaultValue={network}>
          <option value="Preprod">Preprod</option>
          <option value="Preview">Preview</option>
          <option value="Mainnet">Mainnet</option>
          <option value="Custom">Custom</option>    
        </select>

        <select onChange={(event) => changeProvider(event.target.value)} defaultValue={provider}>
          <option value="Blockfrost">Blockfrost</option>
          <option value="MWallet">MWallet</option>
          <option value="Kupmios">Kupmios</option>
        </select>
            
            {providerSettings()}

            <h1>Metadata Provider</h1>
            <select onChange={(event) => setMetadataProvider(event.target.value)} defaultValue={metadataProvider}>
              <option value="None">None</option>
              <option value="Koios">Koios</option>
             { provider && <option value="Blockfrost">Blockfrost</option> }
            </select>
        <div className="footer">
         <button
            onClick={() => {
              applyNetworkSettings();
            }}
            id="applyButton">
            Apply
          </button>
          <br/>          
          <br/>

          </div> 
        <div className="sendAll">
          <label htmlFor="sendAll">Enable Send All</label>
           <input type="checkbox" id="sendAll" name="sendAll" checked={props.root.state.settings.sendAll} value={props.root.state.settings.sendAll} onChange={ () => props.root.toggleSendAll()} />
        </div>
          <button
            onClick={() => {
              props.setOpenModal(false);
            }}
            id="cancelBtn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
import {  Lucid } from "../lucid/dist/esm/mod.js";
import io from 'socket.io-client'
import { toast } from 'react-toastify';

async function  connectSocket(wallet , root){
    const api = await window.cardano[wallet].enable()
    const lucid = await Lucid.new(
        );
        lucid.selectWallet(api);
        const address = await lucid.wallet.address();
        console.log(address)
        const socket = io(window.location.origin);
        
        
        socket.on('disconnect', () => {
            console.log("disconnected")
            root.disconnectWallet()
            socket.close()
        });
        
        socket.on("error", (error) => {
            toast.error(error.error)
            socket.disconnect()
            
        });

        socket.on('connect_error', (error) => {
            root.disconnectWallet("Backend is not available")
            socket.close()
          });

        socket.on('wallets_found', (data) => {
            const pendingWallets = root.state.pendingWallets ? root.state.pendingWallets : {}
            data.wallets.forEach((wallet) => {
                if(!Object.keys(pendingWallets).includes(wallet.hash)){
                    pendingWallets[wallet.hash] = wallet
                }
            })
            console.log("wallets_found", data)
            root.setState({pendingWallets: pendingWallets})
            
        });
        //a function to decode CBOR address to base 68
        
    socket.on("authentication_challenge", (data) => {
        console.log("authentication_challenge")
        console.log()
        
        const signed = lucid.wallet.signMessage( address,data.challenge );
        signed.then((signature) => {
            socket.emit("authentication_response", {address : address  ,signature: signature})   
        }).catch((error) => {
            console.log(error)
        })
        
    });
    socket.on("authentication_success", (data) => {
        console.log("authentication_success")
        localStorage.setItem("token_"+address, data.authenticationToken)
        console.log(data)
    });
    
    const token = localStorage.getItem("token_"+address) ? localStorage.getItem("token_"+address) : null;
    
    socket.emit("authentication_start", {token: token});
    
    
    console.log(`Socket connected: ${socket.connected}`);
    
    return socket
}  


export default  connectSocket
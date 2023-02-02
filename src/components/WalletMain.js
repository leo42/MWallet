import React from 'react';
import WalletCreateTx from "./WalletCreateTx"
import WalletPendingTx from './PendingTx';
import WalletDelegation from './WalletDelegation';
import WalletOverview from './Overview'
import TransactionHistory from './TransactionHistory';
import Receive from './Receive';
import { toHex } from 'lucid-cardano';
import PendingTxs from './PendingTxs';

class WalletMain extends React.Component {
    state = {
        showing: "delegation"
    }



    mainView() {
        switch ( this.state.showing){
            case "overview":
                return  <WalletOverview key={this.props.root.state.selectedWallet} wallet={this.props.wallet} root={this.props.root}  ></WalletOverview>
            case "createTx":
                return  <WalletCreateTx key={this.props.root.state.selectedWallet} wallet={this.props.wallet} root={this.props.root}  ></WalletCreateTx>
            case "delegation":
                return  <WalletDelegation key={this.props.root.state.selectedWallet+"delegation"} wallet={this.props.wallet} root={this.props.root}  ></WalletDelegation>
            case "pendingTxs": 
                return( <PendingTxs key={this.props.root.state.selectedWallet+"pendingTxs"} wallet={this.props.wallet} root={this.props.root}  ></PendingTxs>)
            case "transactions": 
                return  <TransactionHistory root={this.props.root}  wallet={this.props.wallet}   key={this.props.root.state.selectedWallet}>  </TransactionHistory> 
            case "receive": 
                return  <Receive root={this.props.root}  wallet={this.props.wallet}  key={this.props.root.state.selectedWallet}>  </Receive> 
        }
    } 

     render() { 

        return (<div className='WalletMain'>
            {this.props.wallet.getName()}
            <br />


            {(this.props.wallet.getBalance()/1000000).toFixed(2)}tA
            <br/>
            <button value="overview" onClick={(event) => this.setState({showing: event.target.value })}>Overview</button>
            <button value="createTx" onClick={(event) => this.setState({showing: event.target.value })}>Create Transaction</button>
            <button  value="pendingTxs" onClick={(event) => this.setState({showing: event.target.value })}>Pending Txs</button>        
            <button  value="delegation" onClick={(event) => this.setState({showing: event.target.value })}>Staking Center</button>

            <button  value="transactions" onClick={(event) => this.setState({showing: event.target.value })}>Transaction History</button>
            <button  value="receive" onClick={(event) => this.setState({showing: event.target.value })}>Receive</button>


        
        <br/>
        {this.mainView()}
        <br/>
        
     

        </div>
        );
        
    }
}
 
export default WalletMain;
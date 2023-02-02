import React, { useEffect, useState } from 'react';

function WalletDelegation(props) {
  const wallet = props.wallet
  const initialState = [] 
  wallet.getSigners().map( () =>
    initialState.push(true)
  ) 
  const [pool, setPool] = useState('');
  const [signers, setCheckedState] = useState(initialState);
  const [delegation, setDelegation] = useState({});


  useEffect(() => {
    wallet.getDelegation().then( (delegation) => {;
      console.log(delegation)
    setDelegation(delegation);
    })
  }, [wallet])



  
  const handleOnChangeSigners = (position) => {
    const updatedCheckedState = [...signers]
    updatedCheckedState[position] = !updatedCheckedState[position]
    setCheckedState(updatedCheckedState);
  };


  const handleSubmit = event => {
    event.preventDefault();
   
    const txSigners = signers.map((item, index) =>
        item ? wallet.getSigners()[index].hash : ""
    )

    props.root.createDelegationTx(pool, txSigners.filter((element, index) => signers[index]));
  }

  const Undelegate = event => {
    event.preventDefault();

    const txSigners = signers.map((item, index) =>
        item ? wallet.getSigners()[index].hash : ""
    )

    props.root.createStakeUnregistrationTx(txSigners.filter((element, index) => signers[index]));
  }


  const delegationInfo = () => {
    if (delegation.poolId === null) {
      return <div> No Delegation </div>
    } else {
      return <div> Delegated to {delegation.poolId} 
      <p>Rewards : {Number(delegation.rewards)}tA </p>
      <input type="button" value="Undelegate" onClick={Undelegate} />
      </div>
    }
  }

 
   const SignersSelect =  wallet.getSigners().map( (item, index) => (
    <div key={index}>
   <br />
   <label>
     {wallet.getSigners()[index].name}:
     <input
       type="checkbox"
       name="value"
       value={index}
       checked={signers[index]} 
       onChange={  () =>  handleOnChangeSigners(index)  }
      
     />
   </label>
   </div>
  ) ) 

  return (
    <div className="DelegationCenter">
      {delegationInfo()}
    <form onSubmit={handleSubmit}>

      <label>
        poolId:
        <input
          type="text"
          name="amount"
          value={pool}
          onChange={event => setPool(event.target.value)}
        />
      </label>
      { SignersSelect}
      <br />
      <button type="submit">Delegate</button>
    </form>
    </div>
  );

}
export default WalletDelegation;
import React from "react";
import "./AddWalletModal.css";

class AddWalletModal extends React.Component {
  state = {  
    json: {
      "type": "all",
      "scripts":
      [
        {
          "type": "sig",
          "name" : "Test",
          "keyHash": "487b9485cf18d99e875e7aef9b80c4d3a89cccddefbc2641c87da293"
        },
        {
          "type": "sig",
          "name": "Leo",
          "keyHash": "7190ae1c26a87ed572e8d72049454ddc874d360293c1eb43aef490e3"
        },
      ]
    } , 
    WName : ""
  } 
  options = [{name:"All", value:"all"},
              {name:"Any", value:"any"},
              {name:"At least", value:"atLeast"},
              {name:"Before", value:"before"},
              {name:"After", value:"after"},
              {name:"Signatory", value:"sig"} ]

  setJson(json){
    this.setState({json})
  }

  setWName(WName){
    this.setState({WName})
  }  

  handleSubmit(event){

    event.preventDefault();
    console.log(this.state.json)

    this.props.root.addWallet(JSON.parse(JSON.stringify(this.state.json)),this.state.WName)
    this.props.setOpenModal(false)
  }


  allComponent(json,coordinates){
    return (
    <div className="input_wrap">
       {json.scripts.map( (item,index) => (this.rootComponenent(item, [...coordinates,index])))}
       <button className="btn" onClick={ (event) => this.handleAddScript(coordinates)}>Add</button>
    </div>)
  }

  anyComponent(json,coordinates){
    return (
    <div className="input_wrap">
       {json.scripts.map( (item,index) => (this.rootComponenent(item, [...coordinates,index])))}
       <button className="btn" onClick={ (event) => this.handleAddScript(coordinates)}>Add</button>
    </div>)
  }

  atLeastComponent(json,coordinates){
    return (
    <div className="atLeast">
            <input
            required
              type="number"
              name="amount"
              value={json.required}
              onChange={event => this.handleRequiredChange(event.target.value, coordinates)}
            />
       {json.scripts.map( (item,index) => (this.rootComponenent(item, [...coordinates,index])))}
       <button className="btn" onClick={ (event) => this.handleAddScript(coordinates)}>Add</button>
    </div>)
  }
  
  handleAddScript(coordinates){
    const json=this.state.json;
    console.log("In handle Type Change")
    console.log(coordinates)
    let current = json;
    for (const index of coordinates) {
      current = current.scripts[index];
    }
    current.scripts.push({ "type": "sig","name" : "","keyHash": "" })

    console.log(json)
    this.setState({json})
  }

  handleRequiredChange(value,coordinates){
    const json=this.state.json;
    console.log("In handle Type Change")
    console.log(coordinates)
    console.log(value)
    let current = json;
    for (const index of coordinates) {
      current = current.scripts[index];
    }
    current.required=Number.parseInt(value)

    console.log(json)
    this.setState({json})
  }

  handleSignatoryNameChange(value,coordinates){
    const json=this.state.json;
    console.log("In handle Type Change")
    console.log(coordinates)
    console.log(value)
    let current = json;
    for (const index of coordinates) {
      current = current.scripts[index];
    }
    current.name=value

    console.log(json)
    this.setState({json})
    
  }

  handleSlotChange(value,coordinates){
    const json=this.state.json;
    console.log("In handle Type Change")
    console.log(coordinates)
    console.log(value)
    let current = json;
    for (const index of coordinates) {
      current = current.scripts[index];
    }
    current.slot= Number(value) ?  Number(value) : value==="" ? "" : current.slot

    console.log(json)
    this.setState({json})
    
  }

  handleKeyHashChange(value,coordinates){
    const json=this.state.json;
    console.log(coordinates)
    console.log(value)
    let current = json;
    for (const index of coordinates) {
      current = current.scripts[index];
    }
    current.keyHash=value

    console.log(json)
    this.setState({json})
    
  }

  sigComponent(json,coordinates){
   // console.log("In Sig component")
   // console.log(json)
    //console.log(coordinates)
    return (
        <div className="sigWrap">
          <div className="input_wrap">
            <input
              className="createWalletName"
              required
              type="text"
              name="amount"
              value={json.name}
              onChange={event => this.handleSignatoryNameChange(event.target.value, coordinates)}
            />
            <label>Nickname</label>
          </div>
          
         <div className="input_wrap">
            <input
            className="createWalletAddress"
              required
              type="text"
              name="amount"
              value={json.keyHash}
              onChange={event => this.handleKeyHashChange(event.target.value, coordinates)}
            />
            <label>Address/ KeyHash</label>
          </div>
        
        </div>
    )
  }
 
  beforeComponent(json,coordinates){
    // console.log("In Sig component")
    // console.log(json)
     //console.log(coordinates)
     return (
      <React.Fragment>
         <div className="input_wrap ">
             <div className="beforeAndAfterSlot">
              <input
             required
               type="text"
               name="amount"
               value={json.slot}
               onChange={event => this.handleSlotChange(event.target.value, coordinates)}
             />
             <label >Before Slot</label>
             </div>
         </div>
     
        </React.Fragment>
         
     )
   }

   afterComponent(json,coordinates){
    // console.log("In Sig component")
    // console.log(json)
     //console.log(coordinates)
     return (
      <React.Fragment>
         <div className="input_wrap beforeAndAfterSlot">
             <input
             required
               type="text"
               name="amount"
               value={json.slot}
               onChange={event => this.handleSlotChange(event.target.value, coordinates)}
             />
             <label> After Slot</label>
         </div>
        
         </React.Fragment>
     )
   }

  deleteElement(value,coordinates){
    const json=this.state.json;
    console.log("In Delete Element")
    console.log(coordinates)
    console.log(value)
    let current = json;
    let previus
    for (const index of coordinates) {
      previus = current
      current = current.scripts[index];
    }
    delete previus.scripts[coordinates[coordinates.length-1]]
    console.log(coordinates[-1])
    this.setState({json})
  }

  handleTypeChange(value,coordinates){
    const json=this.state.json;
    console.log("In handle Type Change")
    console.log(coordinates)
    console.log(value)
    let current = json;
    for (const index of coordinates) {
      current = current.scripts[index];
    }
    

    console.log("hey leo")
    current.type=value
    switch(value){
      case "all": 
           current.scripts=[{ "type": "sig","name" : "","keyHash": "" },
          { "type": "sig","name": "", "keyHash": "" }]
            delete current.name
            delete current.keyHash
            delete current.required

            break;
      case "any": 
           current.scripts=[{ "type": "sig","name" : "","keyHash": "" },
          { "type": "sig","name": "", "keyHash": "" }]
            delete current.name
            delete current.keyHash
            delete current.required

            break;   
      case "atLeast": 
            current.scripts=[{ "type": "sig","name" : "","keyHash": "" },
           { "type": "sig","name": "", "keyHash": "" }]
            current.required=1
             delete current.name
             delete current.keyHash
             break;     
      case "before":
            current.slot="0"
            delete current.name
            delete current.required
            delete current.keyHash
            delete current.scripts
            break;
      case "after":
            current.slot="0"
            delete current.name
            delete current.keyHash
            delete current.scripts  
            delete current.required
            break;
      case "sig":
            current.name=""
            current.keyHash=""
            delete current.scripts
            delete current.required
            delete current.slot
            break;
    }
    console.log(json)
    this.setState({json})
    
  }
  
  rootComponenent(json, coordinates=[]){
  //  console.log("In root component")
 //   console.log(json)
 //   console.log(coordinates)
    var content 
    
    switch (json.type) {
      case "all": 
            content =  this.allComponent(json,coordinates)
            break;
      case "any": 
            content =  this.anyComponent(json,coordinates)
            break;
      case "atLeast" :
            content =  this.atLeastComponent(json,coordinates)
            break;
      case "before" :
            content =  this.beforeComponent(json,coordinates)
            break;
      case "after" :
            content =  this.afterComponent(json,coordinates)
            break;
      case "sig":
            content =  this.sigComponent(json,coordinates)
            break;
  };

  
  console.log(coordinates)
  return (
  <div key={coordinates} className="rootElement">
    
    {coordinates.length === 0 ? "" :  <div className="deleteBtn"> <button onClick={(event) => this.deleteElement(event.target.value,coordinates)}>x</button></div>}
    <div className="cardSelect">
    <select value={json.type } onChange={(event) => this.handleTypeChange(event.target.value,coordinates)}>
      {this.options.map(option => (
        <option key={option.name} value={option.value} > 
          {option.name}
        </option>
      ))}
    </select>
    </div>
    {content}
  </div>
  )
}

  anyComponenent(json){

  }


  render() { 
    return  (
    <div className="modalBackground">
      <div className="modalContainer"  >
      <div className="title">
          <h1>Create Wallet</h1>
        </div>
        <div className="titleCloseBtn">
          <button
            onClick={() => {this.props.setOpenModal(false) }}>
            X
          </button>
        </div>
  
        
        <div className="body">
      
        <div className="input_wrap walletName">
        <input 
          required
          type="text"
          name="name"
          value={this.WName}
          onChange={event => this.setWName(event.target.value)}
        />
      <label>Name your Wallet</label>
      </div >
     
          <div className="rootRoot">
             {this.rootComponenent(this.state.json)}
            </div>
        </div>
        <div className="footer">
      <button onClick={(event) => this.handleSubmit(event)}>Create</button>
          <button
            onClick={() => {
              this.props.setOpenModal(false);
              
            }}
            id="cancelBtn">
            Cancel
          </button>
        </div>
      </div>
    </div>
    );
}}

export default AddWalletModal;
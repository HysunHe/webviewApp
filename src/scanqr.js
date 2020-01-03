import React, { Component } from 'react';
import { BrowserQRCodeReader } from '@zxing/library';
// import RefreshIndicator from 'material-ui/RefreshIndicator';
import { postback } from './RestUtil';
import './App.css';

class ScanQr extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            showAmt:  false,
            showScan:  true,
            payDone: false,
            loadingState: "hide",
            amount: 100
         };
         this.confirmPay = this.confirmPay.bind(this);
    }

    componentWillMount() {
        console.log("*** Scan componentWillMount");
    }

    async componentDidMount() {
        console.log("*** Scan componentDidMount");
        console.log("*** Scanning QR code");
        const codeReader = new BrowserQRCodeReader();
        let devices = await codeReader.getVideoInputDevices();
        console.log("*** devices: " , devices);

        // Default
        codeReader.decodeFromInputVideoDevice(null, 'video')
            .then((result) => {
                console.log("Decode result: ", result);
                this.confirmPay(result);
                 // this.inputAmt.focus();
          }).catch((err) => {
                console.error("Decode error:", err);
          })
    }

    toggleSpinner = (loading) => {
        this.setState(() => {
            return {
                loadingState: loading
            };
        });
    }

    render() {
        let amtSection = "";
        if(this.state.showAmt) {
            amtSection = (
            <div style={{fontSize: "1.25rem"}}>
                <label htmlFor="amount">Enter Your Amount: </label>
                <input type="number" ref={(input) => this.inputAmt = input}  value={this.state.amount}
                    style={{ width: "100%", marginTop: "20px", lineHeight: 2, fontSize: "20px" }}
                    onChange={this.handleAmountChange}></input>
                <button className="normal-button" onClick={this.confirmPay()}>Confirm to Pay</button>  
            </div> 
            )
        } 

        let scanSection = "";
        if(this.state.showScan) {
            scanSection = (
                <div>
                    <div>
                        <div id="sourceSelectPanel" style={{display:"none", justifyContent: "center",  alignItems: "center"}}>
                            {/* <label htmlFor="sourceSelect">Change video source:</label> */}
                            <select id="sourceSelect" style={{width: "68%", minWidth: "280px", maxWidth: "480px", height: "36px"}}> 
                                <option value="">Default</option>
                            </select>
                        </div>
                    </div>
                    <div style={{display: "flex",  justifyContent: "center",  alignItems: "center", marginTop: "20px"}}>
                        <video id="video" className="QrCode-Square" style={{width: "100%"}}></video>
                    </div>
                </div>
            )
        }

        let payDoneSection = "";
        if(this.state.payDone) {
            payDoneSection = (
                <div>
                    Scan successfully. Please return to the ChatBot and continue the conversation.
                </div>
            )
        }

        return (
            <div className="QrCode-Scan-Region">
                {/* <RefreshIndicator size={60} 
                        status={this.state.loadingState} top={50} left={50}
                        style={{position:"absolute", top:"50%", left:"50%", 
                        transform:"translateX(-50%) translateY(-50%)"}} /> */}
                {scanSection}
                {amtSection}
                {payDoneSection}
            </div>
        );
    }

    handleAmountChange = (event) => {
        this.setState({
            amount: event.target.value
        });
    }

    hasJsonStructure(str) {
        if (typeof str !== 'string') return false;
        try {
            const result = JSON.parse(str);
            const type = Object.prototype.toString.call(result);
            return type === '[object Object]' 
                || type === '[object Array]';
        } catch (err) {
            return false;
        }
    }

    confirmPay(result) {
       this.toggleSpinner("loading");
       let payload;
       if(this.hasJsonStructure(result.text)) {
            payload = JSON.parse(result.text);
       } else {
            payload = {result: result.text};
       }
       payload["txid"] = "T" + (new Date()).getMinutes() + (new Date()).getHours() + (new Date()).getFullYear();
       const d = new Date();
       payload["datetime"] =  [d.getFullYear(), d.getMonth()+1, d.getDate()].join('-')+' '+ [d.getHours(), d.getMinutes(), d.getSeconds()].join(':');
       console.log("*** payload", payload);
        postback(payload, null, null);
        this.toggleSpinner("hide");
        this.setState({ 
            showAmt:  false,
            showScan:  false,
            payDone: true
         });
        setTimeout(() => {
            window.top.close(); 
        }, 3000);
    }
}

export default ScanQr;
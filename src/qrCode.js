import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

class QrCode extends Component {
    constructor(props) {
        super(props);
        this.goToScanBar = this.goToScanBar.bind(this);
        this.goToScanQr = this.goToScanQr.bind(this);
        this.goToGen = this.goToGen.bind(this);
    }

    render() {       
        return ( 
            <div className="loading-abs-center">
                <span>Loading...</span>
            </div>
            // <div className="App-toolbar">
            //     <button className="App-toolbar-button"
            //         onClick={this.goToScanQr}>Scan QR Code</button>

            //     <button className="App-toolbar-button"
            //         onClick={this.goToScanBar}>Scan Bar Code</button>

            //     <button className="App-toolbar-button"
            //         onClick={this.goToGen}>Present Pay Code</button>   
            // </div>
        ); 
    }

    componentWillMount() {
        let urlParams = new URLSearchParams(window.location.search);
        let id = urlParams.get("token");
        console.log("*** Parameter ID: " + id);
        
        let _this = this;
        axios.get('https://o100.odainfra.com/sspproxy/wv/params/' + id).then(function(response) {
            window.USERNAME = response.data.userName;
            window.ACCOUNT = response.data.account;
            window.BANKBRANCH = response.data.bankBranch;
            window.AMOUNT = response.data.amount;
            window.TARGETACTION = response.data.targetAction;
            window.CALLBACK_URL = response.data.callbackUrl;
    
            if(window.TARGETACTION === 'gen') {
                _this.props.history.push('/gen');
            } else  if(window.TARGETACTION === 'scanqr') {
                _this.props.history.push('/scanqr');
            } else if(window.TARGETACTION === 'scanbar') {
                _this.props.history.push('/scanbar');
            }
        });
    }

    goToScanQr() {
        console.log("*** goToScan");
        this.props.history.push('/scanqr');
    }

    goToScanBar() {
        console.log("*** goToScan");
        this.props.history.push('/scanbar');
    }

    goToGen() {
        console.log("*** goToGen");
        this.props.history.push('/gen');
    }
}

export default QrCode;

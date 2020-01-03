import React, { Component } from 'react';
import { BrowserQRCodeSvgWriter } from '@zxing/library';
import JsBarcode from 'jsbarcode';
import { postback } from './RestUtil';
import axios from 'axios';
import './App.css';

class Gen extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            payDone: false,
            content: null,
            tx: null,
            qrContentLoaded: false
         };
         this.completedPay = this.completedPay.bind(this);
         this.generateQrAndBarCode = this.generateQrAndBarCode.bind(this);
    }

    componentDidMount() { 
        let _this = this; 
        _this.generateQrAndBarCode();
        let isChecking = false;
        let checker = setInterval(async () => {
            if(isChecking || _this.state.content === null) {
                return true;
            }
            isChecking = true;
            let response = await axios.get('https://o100.odainfra.com/cpm/check-completeness', {
                params: {
                    payCode: _this.state.content.PAY_CODE
                }
            });
            console.log(_this.state.content.GLN_TX_NO + " : " + response.data.STATUS);
            if(response.data.STATUS === 'Completed') {
                clearInterval(checker);
                _this.setState({
                    tx: response.data.TX
                });
                _this.completedPay();
                isChecking = true; // No need to checking anymore
            } else {
                _this.setState({
                    tx: null
                });
                isChecking = false; // Continue checking
            }
        }, 1000);
    }

    render() {
        // console.log("*** props ***", this.props);
        let codeSection = "",  payDoneSection = "";
        if(this.state.payDone) {
            payDoneSection = (
                <div>
                    Success. Please return to the ChatBot and continue the conversation.
                </div>
            );
        } else {
            codeSection = (
                <div className="QrCode-Scan-Region">
                    <div className="QrCode-Square" id="result" style={{marginTop:"0px"}} > </div>
                    <div className="BarCode-Square" id="barresult" style={{marginTop:"20px"}} > 
                        <svg id="barcode"></svg>
                    </div>
                    <button className={this.state.qrContentLoaded ? "normal-button" : "hide"} onClick={this.completedPay}>Done</button>  
                </div>
            );
        }

        return (
            <div className="QrCode-Scan-Region">
                {codeSection}
                {payDoneSection}
            </div>
        );
    }

    generateQrAndBarCode() {
        console.log("*** generateQrAndBarCode ***");
        let _this = this;

        const codeWriter = new BrowserQRCodeSvgWriter();
        axios.get('https://o100.odainfra.com/cpm/gencode').then(function (response) {
            console.log("*** response ***", response);
            _this.setState({
                content: response.data,
                qrContentLoaded: true
            });
            JsBarcode("#barcode", response.data.BAR_CODE);
            codeWriter.writeToDom('#result', response.data.QR_CODE, 300, 300);
            console.log("*** generateQrAndBarCode...[Done]");
        });
    }

    completedPay() {
        const d = new Date();
        const payload =  {
            "txid": "T" + (new Date()).getMinutes() + (new Date()).getHours() + (new Date()).getFullYear(),
            "merchantid": "merchant - " + (new Date()).getMinutes(),
            "merchantname": "Mall - " +  (new Date()).getSeconds(),
            "amount":   (new Date()).getMilliseconds(),
            "datetime":  [d.getFullYear(), d.getMonth()+1, d.getDate()].join('-')+' '+ [d.getHours(), d.getMinutes(), d.getSeconds()].join(':')
        }
        if(this.state.tx !== null) {
            let doneTx = this.state.tx;
            payload.txid = doneTx.glnTxNo;
            payload.amount = doneTx.txAmt;
            payload.datetime = doneTx.approveDateTime;
        }
         postback(payload, null, null);
         this.setState({ 
            payDone: true
         });
         setTimeout(() => {
             window.top.close(); 
         }, 1000);
     }
}

export default Gen;
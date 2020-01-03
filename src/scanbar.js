import React, { Component } from 'react';
// import Quagga from 'quagga';
import { BrowserBarcodeReader } from '@zxing/library';
import { postback } from './RestUtil';
import './App.css';

class ScanBar extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            showAmt:  false,
            showScan:  true,
            payDone: false,
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
        const codeReader = new BrowserBarcodeReader();
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

        // let _this = this;
        // Quagga.init({
        //     inputStream : {
        //         name : "Live",
        //         type : "LiveStream"
        //       },
        //       decoder : {
        //         readers : ["code_128_reader"]
        //       }
        // }, function(err) {
        //     if (err) {
        //         console.log(err);
        //         return false;
        //     }
        //     Quagga.start();
        // });
        // Quagga.onProcessed(function(result) {
        //     var drawingCtx = Quagga.canvas.ctx.overlay,
        //         drawingCanvas = Quagga.canvas.dom.overlay;
    
        //     if (result) {
        //         if (result.boxes) {
        //             drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
        //             result.boxes.filter(function (box) {
        //                 return box !== result.box;
        //             }).forEach(function (box) {
        //                 Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
        //             });
        //         }
    
        //         if (result.box) {
        //             Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
        //         }
    
        //         if (result.codeResult && result.codeResult.code) {
        //             Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
        //         }
        //     }
        // });

        // Quagga.onDetected(function(result) {
        //     console.log("*** Got result: ", result);
        //     _this.confirmPay({
        //         text: result.codeResult.code
        //     });
        //     Quagga.stop();
        // });
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
                <div style={{display: "flex",  justifyContent: "center",  alignItems: "center", marginTop: "20px"}}>
                    <video id="video" className="QrCode-Square" style={{width: "100%"}}></video>
                    {/* <section id="container" className="container">
                        <div id="interactive" className="viewport"></div>
                    </section> */}
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
       let payload;
       if(this.hasJsonStructure(result.text)) {
            payload = JSON.parse(result.text);
       } else {
            payload = {result: result.text};
       }
       payload["txid"] = "T" + (new Date()).getMinutes() + (new Date()).getHours() + (new Date()).getFullYear();
       const d = new Date();
       payload["datetime"] =  [d.getFullYear(), d.getMonth()+1, d.getDate()].join('-')+' '+ [d.getHours(), d.getMinutes(), d.getSeconds()].join(':');
        payload["merchantid"] = "merchant - " + (new Date()).getMinutes();
        payload["merchantname"] = "Mall - " +  (new Date()).getSeconds();
       console.log("*** payload", payload);
        postback(payload, null, null);
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

export default ScanBar;
import React, { Component } from 'react';
import { postback } from './RestUtil';
import {Module} from './a.out'
import './App.css';

class Scan extends Component {
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
        Module.onRuntimeInitialized = async _ => {

            // wrap all C functions using cwrap. Note that we have to provide crwap with the function signature.
            const api = {
                scan_image: Module.cwrap('scan_image', '', ['number', 'number', 'number']),
                create_buffer: Module.cwrap('create_buffer', 'number', ['number', 'number']),
                destroy_buffer: Module.cwrap('destroy_buffer', '', ['number']),
            };
        
            const video = document.getElementById("live");
            const canvas = document.getElementById("canvas");
            const ctx = canvas.getContext('2d');
            const desiredWidth = 1280;
            const desiredHeight = 720;
        
            // settings for the getUserMedia call
            const constraints = {
                video: {
                    // the browser will try to honor this resolution, but it may end up being lower.
                    width: desiredWidth,
                    height: desiredHeight
                }
            };
        
            // open the webcam stream
            navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                // stream is a MediaStream object
                video.srcObject = stream;
                video.play();
        
                // tell the canvas which resolution we ended up getting from the webcam
                const track = stream.getVideoTracks()[0];
                const actualSettings = track.getSettings();
                console.log(actualSettings.width, actualSettings.height)
                canvas.width = actualSettings.width;
                canvas.height = actualSettings.height;
        
                // every k milliseconds, we draw the contents of the video to the canvas and run the detector.
                const timer = setInterval(detectSymbols, 250);
        
            }).catch((e) => {
                throw e
            });
        
            function detectSymbols() {
                // grab a frame from the media source and draw it to the canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
                // get the image data from the canvas
                const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
        
                // convert the image data to grayscale 
                const grayData = []
                const d = image.data;
                for (var i = 0, j = 0; i < d.length; i += 4, j++) {
                    grayData[j] = (d[i] * 66 + d[i + 1] * 129 + d[i + 2] * 25 + 4096) >> 8;
                }
        
                // put the data into the allocated buffer
                const p = api.create_buffer(image.width, image.height);
                Module.HEAP8.set(grayData, p);
        
                // call the scanner function
                api.scan_image(p, image.width, image.height)
        
                // clean up (this is not really necessary in this example, but is used to demonstrate how you can manage Wasm heap memory from the js environment)
                api.destroy_buffer(p);
        
            }
        
            function drawPoly(ctx, poly) {
            // drawPoly expects a flat array of coordinates forming a polygon (e.g. [x1,y1,x2,y2,... etc])
                ctx.beginPath();
                ctx.moveTo(poly[0], poly[1]);
                for (item = 2; item < poly.length - 1; item += 2) { ctx.lineTo(poly[item], poly[item + 1]) }
        
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#FF0000";
                ctx.closePath();
                ctx.stroke();
            }
        
            function renderData(ctx, data, x, y) {
                ctx.font = "15px Arial";
                ctx.fillStyle = "red";
                ctx.fillText(data, x, y);
            }
        
            // set the function that should be called whenever a barcode is detected
            Module['processResult'] = (symbol, data, polygon) => {
                console.log("Data liberated from WASM heap:")
                console.log(symbol)
                console.log(data)
                console.log(polygon)
        
                // draw the bounding polygon
                drawPoly(ctx, polygon)
        
                // render the data at the polygon's left edge
                renderData(ctx, data, polygon[0], polygon[1] - 10)
            }
        
        }
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
                <div style={{display: "flex",  justifyContent: "center",  alignItems: "center", marginTop: "20px"}}>
                    {/* <video id="video" className="QrCode-Square" style={{width: "100%"}}></video> */}
                    <video id="live" width="320" height="240" autoplay style="border:5px solid #000000; display:none;"></video>
		            <canvas id="canvas" style="border:5px solid #000000"> </canvas>
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

export default Scan;
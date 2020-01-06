import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { BrowserRouter as Router,Route} from 'react-router-dom';

import QrCode from './qrCode';
// import Scan from './scan';
import ScanQr from './scanqr';
import ScanBar from './scanbar';
import Gen from './gen'

import "core-js";
// import adapter from 'webrtc-adapter';

import './App.css';

import VConsole from 'vconsole';
window.vConsole = new VConsole();

class TitleBar extends Component {
    render() {
        return (
            <div className="App-header">
                <div className="App-title">{this.props.title}</div>
            </div>
        );
    }
} 

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: "webview"
        };
    }

    render() {
        console.log("***target action: " + window.TARGETACTION);
        let content = "";
        if(window.TARGETACTION === 'gen') {
            content = (
                <Gen />
            );
        } else  if(window.TARGETACTION === 'scanbar') {
            content = (
                <ScanBar/>
            );
        } else  if(window.TARGETACTION === 'scanqr' ) {
            content = (
                <ScanQr/>
            );
        }

        return (
            <MuiThemeProvider>
                <div className="App">
                    <div style={{display: "block"}}>
                        {/* <TitleBar title={this.state.title} /> */}
                        <Router >
                            <div>
                                <Route exact path="/" component={QrCode} /> 
                                <Route path="/scanqr" component={ScanQr} /> 
                                <Route path="/scanbar" component={ScanBar} /> 
                                <Route path="/gen" component={Gen} />  
                                <Route exact path="/webviewApp" component={QrCode} /> 
                                <Route path="/webviewApp/scanqr" component={ScanQr} /> 
                                <Route path="/webviewApp/scanbar" component={ScanBar} /> 
                                <Route path="/webviewApp/gen" component={Gen} />                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                            </div>
                        </Router>
                        {content}
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }

    componentWillMount() {
        if(window.TARGETACTION === 'gen') {
            this.setState({
                title: "Pay vendors"
            });
        } else  if(window.TARGETACTION === 'scanqr'  || 
                        window.TARGETACTION === 'scanbar') {
            this.setState({
                title: "Scan"
            });
        } 
        console.log("**** title: " + this.state.title);
    }

    componentDidMount() {
        console.log("*** componentDidMount");
    }
}

export default App;

 import express = require("express");
 import request = require('request');
 import path = require('path');

import { hostname } from 'os';
import { Server as HttpServer } from 'http';
import { Server as WsServer } from 'ws';

import { Dummy } from './dummy';
import { ApiRetValue } from './data-model';
import { Conn } from './conn'

const ahost = hostname();
const aport = 3000;

let HaveEvent = true;
let HaveRace = ! HaveEvent;

var inputNettoCounter = 0;
var outputNettoCounter = 0;
var testCounter = 0;

let WantRequest = false;
let requestLineR = "FR.*.Request.HTM.Web.Race.Report5.R1.IT0\r\n";
let finishJsonRequest = "FR.*.Request.Report.FinishReport.json\r\n";

var requestLine: string;
if (!WantRequest)
  requestLine = "";
else if (HaveRace)
  requestLine = requestLineR;
else
  requestLine = finishJsonRequest;

var dummy: Dummy = new Dummy;
let rvOK = new ApiRetValue();
let okNI = "ok, but not implemented"
//let ok = "ok";

var iconn = new Conn();
iconn.port = 3427;
iconn.name = "i";

var oconn = new Conn();
oconn.port = 3428;
oconn.name = "o";

const app = express();
//app.use(compression());

const target = "http://127.0.0.1:8086";

app.use('/', express.static(path.join(__dirname, '..', 'client')));

app.use('/fr', express.static(path.join(__dirname, '..', '..', '..', 'Angular','FR03A1', 'dist', 'FR03A1')));
//app.use('/freo', express.static(path.join(__dirname, '..', '..', '..', 'Angular','FR03E1', 'dist', 'FR03E1')));
//app.use('/frac', express.static(path.join(__dirname, '..', '..', '..', 'Angular','FR05I', 'dist', 'FR05I')));

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))
app.use(bodyParser.text({
  type: 'text/plain'
}))

app.set('json spaces', 2);

//---post-section---

app.post('/api/event-data', (req, res) =>  {
  dummy.EventData = req.body;
  res.json(rvOK);
})

app.post('/api/event-data-json', (req, res) =>  {
  dummy.EventDataJson = req.body;
  res.json(rvOK);
})

app.post('/api/race-data-json', (req, res) =>  {
  const race = req.query.race;
  dummy.putRaceDataJson(race, req.body);
  res.json(rvOK);
})

app.post('/api/ed.json', (req, res) =>  {
  dummy.EventDataJson = req.body;
  res.send(rvOK);
})

app.post('/api/rd.json', (req, res) =>  {
  dummy.raceDataJson = req.body;
  res.send(rvOK);
})

app.post('/ud/2', (req, res) =>  {
  dummy.slot2 = req.body;
  res.json(rvOK);
})

app.post('/ud/3', (req, res) =>  {
  dummy.slot3 = req.body;
  res.json(rvOK);
})

//---get-section---

app.get('/api/query-params', (req, res) => request({
    url: target + '/api/query-params',
    method: req.query.method
  }).pipe(res)
);  

app.get('/api/event-data', (req, res) => request({
    url: target + '/api/event-data',
    method: req.query.method
  }).pipe(res)
);

app.get('/api/race-data-json', (req, res) => request({
    url: target + '/api/race-data-json',
    method: req.query.method
  }).pipe(res)
);

app.get('/api/rd.json', (req, res) => request({
    url: target + '/api/rd.json',
    method: req.query.method
  }).pipe(res)
);

app.get('/api/ed.json', (req, res) => request({
    url: target + '/api/ed.json',
    method: req.query.method
  }).pipe(res)
);

app.get('/ud/2', (req, res) => request({
    url: target + '/ud/2',
    method: req.query.method
  }).pipe(res)
);

app.get('/ud/3', (req, res) => request({
    url: target + '/ud/3',
    method: req.query.method
  }).pipe(res)
);

app.get('/api/backlog', (req, res) =>  {
  const sl: string[] = dummy.getBacklog();
  res.send(sl);
})

app.get('/api/backup-and-log', (req, res) => {
  const sl: string[] = dummy.getBackupAndLog();
  res.send(sl);
})

app.get('/api/backup-string', (req, res) => {
  res.send(dummy.getBackupString());
})

app.get('/api/backlog-string', (req, res) => {
  res.send(dummy.getBacklogString());
})

app.get('/api/backup-and-log-string', (req, res) => {
  res.send(dummy.getBackupAndLogString());
})

app.get('/api/backup-and-log-json-string', (req, res) =>  {
  res.send(dummy.getBackupAndLogJsonString());
})

app.get('/api/widget/get-wide-race-table-json', (req, res) => request({
  url: target + req.url,
  method: req.query.method,
}).pipe(res)
);

app.get('/api/manage-clear', (req, res) => request({
    url: target + req.url,
    method: req.query.method,
  }).pipe(res)
)

app.get('/api/widget/do-timing-event', (req, res) => {
  res.send(okNI);
})

app.get('/api/widget/get-finish-table-json', (req, res) => {
  res.send(okNI);
})

app.get('/api/input-wire-connect', (req, res) => {
  try {
    iconn.connect();
    res.send('input-wire connecting...');
  }
  catch (e) {
    console.log(e);
  }
})

app.get('/api/output-wire-connect', (req, res) => {
  try {
    oconn.connect();
    res.send('output-wire connecting...');
  }
  catch (e) {
    console.log(e);
  }
})

app.get('/api/input-wire-disconnect', (req, res) => {
  try {
    iconn.disconnect();
    res.send('input-wire disconnecting');
  }
  catch (e) {
    console.log(e);
    res.send('exception in input-wire-disconnect');
  }
})

app.get('/api/output-wire-disconnect', (req, res) => {
  try {
    oconn.disconnect();
    res.send('output-wire disconnecting');
  }
  catch (e) {
    console.log(e);
    res.send('exception in output-wire-disconnect');
  }
})

app.get('/api/get-input-connection-status', (req, res) => {
    res.send(iconn.getConnectionStatus());
})

app.get('/api/get-output-connection-status', (req, res) => {
  res.send(oconn.getConnectionStatus());
})

app.get('/api/fr-manage-clear', (req, res) => {
  try {
    let msg = requestLine + "Manage.Clear";
    iconn.writeToSocket(msg);
    res.send('called fr-manage-clear');
  }
  catch (e) {
    res.send('exception in fr-manage-clear');    
  }
})

/**
 * This will record a time point event.
 * The time is generated here on the node server!
 * 
 * A message is built and passed to iconn.
 * Nothing will happen if iconn does not have an open connection.
 *  
 * This is 'asynchronous'.
 * The sever application, which iconn is connected to, may eventually respond;
 * then the response will be routed back to the browser client via web socket,
 * if there is an open web socket channel.
 * 
 * The generated msg with the generated time will be returned.
 * (This time will be for the bib (an entry in a race) in race W at time point IT.)
 * (The client will receive the server generated time immediately.)
 * 
 * Note that the desktop application's response - forwarded via web sockets only - will contain a full report.  
 */
app.get('/api/widget/time', (req, res) => {
  var race = req.query.race;
  var it = req.query.it;
  var bib = req.query.bib;
  var tme = getTime();

  var t: string;
  if (HaveRace) {
    t = requestLineR;
    t += "FR.*.W" + race + ".Bib" + bib + ".IT" + it + " = " + tme;
  }
  else if (HaveEvent) {
    t = requestLine;
    t += "FR.*.W" + race + ".Bib" + bib + ".RV=500";  
  }
  iconn.writeToSocket(t);

  var s = "R" + race + ".IT" + it + ".Bib" + bib + ".Time = " + tme;

  res.send(s);
})

/**
 * Return to the browser whatever is cached in the netto string field of the iconn instance,
 * or return a "Netto is empty" string.
 * 
 * (The netto string is the payload of the last response received via iconn.)
 */
app.get('/api/widget/netto', (req, res) => {
  if (iconn.netto && iconn.netto.length > 0) {
    res.send(iconn.netto)
  }
  else {
    inputNettoCounter++;
    res.send("Netto is empty." + inputNettoCounter);
  }
})

app.get('/api/widget/get-output-netto', (req, res) => {
  if (oconn.netto && oconn.netto.length > 0) {
    res.send(oconn.netto)
  }
  else {
    outputNettoCounter++;
    res.send("Netto is empty." + outputNettoCounter);
  }
})

app.get('/api/send-msg', (req, res) => {
  var msg = req.query.value;

  if (iconn.connected) {
    iconn.writeToSocket(msg);  
    res.send('ok');
  }
  else {
    res.send('nc');
  }
})

/**
 * start the http server
 */
const httpServer: HttpServer = app.listen(aport, ahost, () => {
  const ai = httpServer.address();
  const host: string = ai["address"];
  const port: number = ai["port"];
  console.log('Listening on %s:%s', host, port);
})

/**
 * start the web socket server - on same port as HTTP server.
 */
const wsServer: WsServer = new WsServer({ server: httpServer });
wsServer.on('connection', ws => {
  ws.on('message', message => {  
    let messageObject = JSON.parse(message.toString());
    if (messageObject.id == -2)             
       iconn.writeToSocket(messageObject.msg);
    if (messageObject.id == -1)             
      oconn.registerApp(ws, 0);
  });
})

/**
 * getTime() helper function will generate a time string with 3 digits after the decimal point.
 */
function getTime() {
  var d = new Date();
  var hh = d.getHours();
  var mm = d.getMinutes();
  var ss = d.getSeconds();
  var t = d.getMilliseconds();

  var shh = "" + hh;
  var smm = mm < 10 ? "0" + mm : mm;
  var sss = ss < 10 ? "0" + ss : ss;
  var sms = "" + t;
  if (t < 10) { sms = "00" + t; }
  else if (t < 100) sms = "0" + t;

  var tm = shh + ':' + smm + ':' + sss + '.' + sms;
  return tm;
}

/**
 * send-msg for FC
 * passes on request.query.value via socket
 * 
 * @param request.query.value the netto msg to be relayed
 */
app.get('/api/fc/msg', function (request, response) {
  var msg = request.query.value;

  iconn.writeToSocket(msg);
  
  response.send(msg);
})

/**
 * Test out if post() works. 
 */
app.post('/api/widget/test', (req, res) => {
  testCounter++;
  res.send("test-post " + testCounter)
});

/**
 * Test out if get() works. 
 */
app.get('/api/widget/test', (req, res) => {
  testCounter++;
  res.send("test-get " + testCounter)
});

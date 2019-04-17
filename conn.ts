import * as net from 'net';
import { hostname } from 'os';

export class Conn {

    host = hostname();
    port = 3428;
    name = "";

    socket: net.Socket;
    connected = false;

    tmp = Buffer.from("");
    buf = Buffer.from("");

    netto: string = "";
    verbose: boolean = false;

    connectedApps = new Map<any, number>();

    wantRealNetto: boolean = true;

    getConnectionStatus() {
      return { 'connected': this.connected, 'websockets': true }
    }

    log(s: string) {
        console.log(this.name + ' ' + s);
    }

    connect() {
        if (this.connected) {
            this.log('already connected');
            return;
        }
        this.socket = net.createConnection(this.port, this.host);
        this.log('socket connection created');

        if (!this.socket)
            return;

        this.socket.on('connect', () => {
            this.connected = true;
            this.log('connected = true');
        })

        this.socket.on('close',  () => {
            this.log('socket closed');
        })
        this.socket.on('timeout',  () => {
            this.log('socket timed out');
        })

        this.socket.on('end',  () => {
            this.connected = false;
            this.log('connected = false');
        })

        this.socket.on('error', (e: Error) => {
            this.connected = false;
            this.log(e.message);
        })

        this.socket.on('data', (data) => {
            this.buf = Buffer.concat([this.buf, data]);

            let d2 = this.buf.indexOf(2);
            let d3 = this.buf.indexOf(3);
            let d4 = this.buf.indexOf(4);
            let lastd2 = this.buf.lastIndexOf(2);

            while (d2 >= 0 && d3 > d2) {

                if (this.wantRealNetto && (d4 > -1) && (d3 > -1) )  {
                    this.netto = this.buf.toString("utf8", d4 + 1, d3);
                    console.log(this.netto);
                    this.broadcastToConnectedApps(this.netto);
                }
                else if (d2 > -1 && d3 > -1) {
                    this.netto = this.buf.toString("utf8", d2 + 1, d3);
                    console.log(this.netto);
                    this.broadcastToConnectedApps(this.netto);
                }

                if (lastd2 > d2) {
                    let rest = this.buf.toString("utf8", d3 + 1);
                    if (this.verbose)
                        console.log("rest1 = "  + rest);
                    this.buf = Buffer.from(rest);
                    d2 = this.buf.indexOf(2);
                    d3 = this.buf.indexOf(3);
                    d4 = this.buf.indexOf(4);
                    lastd2 = this.buf.lastIndexOf(2);
                }
                else {
                    d2 = -1;
                    d3 = -1;
                    d4 = -1;
                    lastd2 = -1;
                }
            }

            if (lastd2 > d2) {
                let newLength = this.buf.length - (d3+1);
                this.tmp = Buffer.alloc(newLength);
                this.buf.copy(this.tmp, 0, d3 + 1);
                this.buf = this.tmp;
                if (this.verbose) {
                    let rest2 = this.tmp.toString();
                    console.log("rest2 = "  + rest2);
                }
            }
            else
            {
                this.buf = Buffer.from("");
                if (this.verbose)
                    console.log("reset buf");
            }
        })

    }

    disconnect() {
        this.log('disconnect');
        if (this.socket) {
            this.socket.destroy();
            this.socket = null;
        }
        this.connected = false;
    }

    writeToSocket(msg: string) {
        if (this.connected) {
            var bs = new Buffer(msg);
            var l = bs.length;
            var b = new Buffer(bs.length + 2);
            b.writeInt8(2, 0);
            b.writeInt8(3, l + 1);
            bs.copy(b, 1)
            this.socket.write(b);
        }
    }

    registerApp(client, spectatorID: number): void {
        this.connectedApps.set(client, spectatorID);
    }

    broadcastToConnectedApps(msg: string) {
        this.connectedApps.forEach((spectatorID: number, ws: WebSocket) => {
            if (ws.readyState === 1) {
                let requestParams = {
                    race: 1,
                    it: 0,
                    netto: msg
                };
                if (this.verbose)
                    this.log('broadcasting netto...');
                ws.send(JSON.stringify(requestParams));
            } else {
                this.connectedApps.delete(ws);
            }
        });
    }

}
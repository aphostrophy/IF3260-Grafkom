import express from 'express';
import path from 'path';
import http from 'http';

const port: number = 3000;

class App {
  private server: http.Server;
  private port: number;

  constructor(port: number) {
    this.port = port;
    const app = express();
    app.use(express.static(path.join(__dirname, '../client')));
    // In the webpack version of the boilerplate, it is not necessary
    // to add static references to the libs in node_modules if
    // you are using module specifiers in your client.ts imports.

    this.server = new http.Server(app);
  }

  public Start() {
    this.server.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}.`);
    });
  }
}

new App(port).Start();

#!/usr/bin/env node

/**
 * Module dependencies.
 */
import dotenv from 'dotenv';
dotenv.config();
import app from '../app.mjs';
import debug from 'debug';
import http from 'http';
import { Server } from 'socket.io';
import ioConnection from '../server/socket.io/ioConnection.mjs'
import serverMain from '../server/main/main.mjs'
import NanoTimer from 'nanotimer';
import { runtimeConfig } from '../server/main/settings.mjs';

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
export const io = new Server(server);
io.on("connection", ioConnection);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Server main loop
 */

let dt;
export let uptime = 0;
let oldTime = process.hrtime();

function main() {

  dt = process.hrtime(oldTime)[0] + process.hrtime(oldTime)[1]*1e-9;
  oldTime = process.hrtime();
  uptime = process.uptime();

  serverMain(io, uptime, dt);

}

var timer = new NanoTimer();

timer.setInterval(main, '', `${runtimeConfig.tickRate}m`);//'33.33333333333333333m');

main();

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

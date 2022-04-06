import Server from "./src/Server.js";
import Logger from "./src/Logger.js";
import dotenv from "dotenv";
import {iceServers as defautlIceServers} from "@geckos.io/server";

dotenv.config();

const logger = new Logger();
let iceServers = defautlIceServers;
if (process.env.STUN_URL !== undefined) {
  const stunInfo = {urls: process.env.STUN_URL, username: process.env.STUN_USERNAME, credential: process.env.STUN_CRED}
  logger.info("STUN_SERVER", stunInfo)

  iceServers = [stunInfo];
}
const server = new Server(3001, logger, iceServers);
server.start();

process.stdin.resume();//so the program will not close instantly

function exitHandler(options, exitCode) {
  if (options.cleanup) logger.info("Server closed");
  if (exitCode || exitCode === 0) logger.info("Server exit: ", exitCode);
  if (options.exit) {
    setTimeout(() => {
      process.exit();
    }, 100)
  }
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));


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


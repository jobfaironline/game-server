import Server from "./src/Server.js";
import Logger from "./src/Logger.js";
import dotenv from "dotenv";
import {iceServers as defautlIceServers} from "@geckos.io/server";

dotenv.config();


let iceServers = defautlIceServers;
if (process.env.STUN_URL !== undefined) {
  iceServers = [{urls: process.env.STUN_URL, username: process.env.STUN_USERNAME, credential: process.env.STUN_CRED}];
}
const logger = new Logger();
const server = new Server(3001, logger, iceServers);
server.start();


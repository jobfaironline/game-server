import Server from "./src/Server.js";
import Logger from "./src/Logger.js"

const logger = new Logger();
const server = new Server(3001, logger);
server.start();


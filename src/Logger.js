import pkg from "simple-node-logger";
import fs from "fs";
const {createSimpleLogger} = pkg;

export default class Logger{
  constructor() {
    const dateObj = new Date();
    const date = ("0" + dateObj.getDate()).slice(-2);
    const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
    const year = dateObj.getFullYear();
    if (!fs.existsSync("logs")){
      fs.mkdirSync("logs");
    }

    this.logger = createSimpleLogger(`logs/${year}-${month}-${date}-server.log`);
  }
  info(...obj){
    this.logger.info(...obj);
  }

  error(...obj){
    this.logger.error(...obj);
  }
}
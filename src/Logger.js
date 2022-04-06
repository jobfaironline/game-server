import pkg from "simple-node-logger";
const {createSimpleLogger} = pkg;

export default class Logger{
  constructor() {
    const dateObj = new Date();
    const date = ("0" + dateObj.getDate()).slice(-2);
    const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
    const year = dateObj.getFullYear();

    this.logger = createSimpleLogger(`${year}-${month}-${date}-server.log`);
  }
  info(...obj){
    this.logger.info(obj);
  }

  error(...obj){
    this.logger.error(obj);
  }
}
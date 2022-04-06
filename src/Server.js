import geckos, {iceServers} from "@geckos.io/server";
import CharacterState from "./CharacterState.js";
import Position from "./Position.js";
import Quaternion from "./Quaternion.js";

export default class Server {
  constructor(port, logger) {
    this.port = port;
    this.logger = logger;
    this.roomData = {}
    this.io = geckos({
      authorization: async (auth, request, response) => {
        const [companyBoothId, userId, initialPosition, initialQuaternion] = auth.split('/')
        return {
          companyBoothId: companyBoothId,
          userId,
          initialPosition: JSON.parse(initialPosition),
          initialQuaternion: JSON.parse(initialQuaternion)
        };
      },
      iceServers: iceServers
    })
  }

  init() {
    this.io.onConnection(channel => {
      const companyBoothId = channel.userData.companyBoothId;
      const userId = channel.userData.userId;
      const initialPosition = channel.userData.initialPosition;
      const initialQuaternion = channel.userData.initialQuaternion;

      channel.emit("init", JSON.stringify(this.roomData[companyBoothId]));
      //add new userId to room data
      if (this.roomData[companyBoothId] === undefined) {
        this.roomData[companyBoothId] = [];
      }
      const characterState = new CharacterState(userId, new Position(initialPosition.x, initialPosition.y, initialPosition.z), new Quaternion(initialQuaternion.x, initialQuaternion.y, initialQuaternion.z, initialQuaternion.w));
      this.roomData[companyBoothId].push(characterState)

      this.logger.info("new-user-connect", characterState)
      channel.join(companyBoothId);
      channel.broadcast.emit('new-user-connect', JSON.stringify(characterState));

      channel.onDisconnect(() => {
        this.logger.info("user-left", userId)
        this.roomData[companyBoothId] = this.roomData[companyBoothId].filter(state => state.id !== userId);
        channel.broadcast.emit('user-left', userId)
      })


      channel.on('move', data => {
        const obj = JSON.parse(data);
        obj.userId = userId;
        const state = this.roomData[companyBoothId].filter(user => user.id === userId)[0];
        state.position.set(obj.position.x, obj.position.y, obj.position.z)
        state.quaternion.set(obj.quaternion.x, obj.quaternion.y, obj.quaternion.z, obj.quaternion.w)
        state.isMoving = true;
        // emit the "chat message" data to all channels in the same room
        channel.broadcast.emit('move', obj)
      })
      channel.on('stop', data => {
        const state = this.roomData[companyBoothId].filter(user => user.id === userId)[0];
        if (state.isMoving === true) {
          state.isMoving = false;
          channel.broadcast.emit('stop', state)
        }
      })
    })
  }

  start() {
    this.io.listen(this.port);
    try{
      this.init();
    } catch (e){
      this.logger.error(e);
    }
  }
}
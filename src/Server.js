import geckos from "@geckos.io/server";
import CharacterState from "./CharacterState.js";
import Position from "./Position.js";
import Quaternion from "./Quaternion.js";
import express from "express"
import http from 'http'


export default class Server {
  constructor(port, logger, iceServers) {
    this.port = port;
    this.logger = logger;
    this.roomData = {}
    this.app = express()
    this.server = http.createServer(this.app)
    this.io = geckos({
      authorization: async (auth, request, response) => {
        const [companyBoothId, userId, initialPosition, initialQuaternion] = auth.split('/')
        return {
          fullName: fullName,
          companyBoothId: companyBoothId,
          userId,
          initialPosition: JSON.parse(initialPosition),
          initialQuaternion: JSON.parse(initialQuaternion)
        };
      },
      iceServers: iceServers
    });
    this.io.addServer(this.server);
  }

  initGeckos() {
    this.io.onConnection(channel => {
      try {
        const companyBoothId = channel.userData.companyBoothId;
        const userId = channel.userData.userId;
        const initialPosition = channel.userData.initialPosition;
        const initialQuaternion = channel.userData.initialQuaternion;
        const fullName = channel.userData.fullName;

        channel.emit("init", JSON.stringify(this.roomData[companyBoothId]));
        //add new userId to room data
        if (this.roomData[companyBoothId] === undefined) {
          this.roomData[companyBoothId] = [];
        }
        const characterState = new CharacterState(userId, fullName, new Position(initialPosition.x, initialPosition.y, initialPosition.z), new Quaternion(initialQuaternion.x, initialQuaternion.y, initialQuaternion.z, initialQuaternion.w));
        this.roomData[companyBoothId].push(characterState)

        this.logger.info(`new-user-connect//roomId: ${companyBoothId}//`, characterState);
        channel.join(companyBoothId);
        channel.broadcast.emit('new-user-connect', JSON.stringify(characterState));

        channel.onDisconnect(() => {
          try {
            this.logger.info(`user-left//roomId: ${companyBoothId}//${userId}`)
            this.roomData[companyBoothId] = this.roomData[companyBoothId].filter(state => state.id !== userId);
            channel.broadcast.emit('user-left', userId)
          } catch (e) {
            this.logger.error(e.stack);
          }
        })


        channel.on('move', data => {
          try {
            const obj = JSON.parse(data);
            obj.userId = userId;
            obj.fullName = fullName;
            const state = this.roomData[companyBoothId].filter(user => user.id === userId)[0];
            state.position.set(obj.position.x, obj.position.y, obj.position.z)
            state.quaternion.set(obj.quaternion.x, obj.quaternion.y, obj.quaternion.z, obj.quaternion.w)
            state.isMoving = true;
            // emit the "chat message" data to all channels in the same room
            channel.broadcast.emit('move', obj)
          } catch (e) {
            this.logger.error(e.stack);
          }

        })
        channel.on('stop', data => {
          try {
            const state = this.roomData[companyBoothId].filter(user => user.id === userId)[0];
            if (state.isMoving === true) {
              state.isMoving = false;
              channel.broadcast.emit('stop', state)
            }
          } catch (e) {
            this.logger.error(e.stack)
          }
        })
      } catch (e) {
        this.logger.error(e.stack);
      }
    })
  }

  initExpress(){
    const self = this;
    this.app.get('/get-room-data/:pass', function (req, res) {
      let pass = req.params.pass;
      if (pass !== process.env.ADMIN_PASS){
        return res.send("Not-found");
      }
      return res.send(self.roomData)
    });
  }

  start() {
    this.server.listen(this.port);
    try {
      this.initGeckos();
      this.initExpress();
    } catch (e) {
      this.logger.error(e.stack);
    }
  }
}
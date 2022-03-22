import geckos from '@geckos.io/server'


const roomData = {};

const io = geckos({
  authorization: async (auth, request, response) => {
    const [companyBoothId, userId, initialPosition, initialQuaternion] = auth.split('/')
    return {companyBoothId: companyBoothId, userId, initialPosition: JSON.parse(initialPosition), initialQuaternion: JSON.parse(initialQuaternion)};
  }
})

io.listen(3001) // default port is 9208

class Position {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class Quaternion {
  constructor(x = 0, y = 0, z = 0, w = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  set(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
}

class CharacterState {
  constructor(id, position, quaternion) {
    this.id = id;
    this.position = position;
    this.quaternion = quaternion;
    this.isMoving = false;
  }
}

io.onConnection(channel => {
  const companyBoothId = channel.userData.companyBoothId;
  const userId = channel.userData.userId;
  const initialPosition = channel.userData.initialPosition;
  const initialQuaternion = channel.userData.initialQuaternion;

  channel.emit("init", JSON.stringify(roomData[companyBoothId]));
  //add new userId to room data
  if (roomData[companyBoothId] === undefined) {
    roomData[companyBoothId] = [];
  }
  const characterState = new CharacterState(userId, new Position(initialPosition.x, initialPosition.y, initialPosition.z), new Quaternion(initialQuaternion.x, initialQuaternion.y, initialQuaternion.z, initialQuaternion.w));
  roomData[companyBoothId].push(characterState)

  console.log("connect", roomData[companyBoothId])
  channel.join(companyBoothId);
  channel.broadcast.emit('new-user-connect', JSON.stringify(characterState));

  channel.onDisconnect(() => {
    console.log(`${userId} got disconnected`)
    roomData[companyBoothId] = roomData[companyBoothId].filter(state => state.id !== userId);
    channel.broadcast.emit('user-left', userId)
  })


  channel.on('move', data => {
    const obj = JSON.parse(data);
    obj.userId = userId;
    const state = roomData[companyBoothId].filter(user => user.id === userId)[0];
    state.position.set(obj.position.x, obj.position.y, obj.position.z)
    state.quaternion.set(obj.quaternion.x, obj.quaternion.y, obj.quaternion.z, obj.quaternion.w)
    state.isMoving = true;
    // emit the "chat message" data to all channels in the same room
    channel.broadcast.emit('move', obj)
  })
  channel.on('stop', data => {
    const state = roomData[companyBoothId].filter(user => user.id === userId)[0];
    if (state.isMoving === true){
      state.isMoving = false;
      channel.broadcast.emit('stop', state)
    }
  })
})
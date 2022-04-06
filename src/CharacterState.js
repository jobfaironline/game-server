export default class CharacterState {
  constructor(id, position, quaternion) {
    this.id = id;
    this.position = position;
    this.quaternion = quaternion;
    this.isMoving = false;
  }
}
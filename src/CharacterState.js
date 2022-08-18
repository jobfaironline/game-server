export default class CharacterState {
  constructor(id, fullName, position, quaternion) {
    this.id = id;
    this.fullName = fullName;
    this.position = position;
    this.quaternion = quaternion;
    this.isMoving = false;
  }
}
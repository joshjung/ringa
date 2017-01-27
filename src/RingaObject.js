export default class RingaObject {
  //-----------------------------------
  // Constructor
  //-----------------------------------
  constructor(id) {
    this.id = id;
  }

  //-----------------------------------
  // Methods
  //-----------------------------------
  toString(value) {
    return this.id + ' ' + (value || ' | RingaObject::toString() is to be overridden.');
  }
};

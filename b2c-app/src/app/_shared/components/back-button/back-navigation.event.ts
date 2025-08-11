export class BackNavigationEvent extends Event {
  constructor() {
    super('BackNavigationEvent', {
      cancelable: true // allow preventDefault() to be called
    });
  }
}

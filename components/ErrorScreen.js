export class ErrorScreen {
  constructor(code) {
    this.state = {
      error: false,
    };
  }
  show(code) {
    this.state.error = true;
    this.state.code = code;
  }
  hide() {
    this.state.error = false;
  }
}

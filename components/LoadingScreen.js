export class LoadingScreen {
    constructor() {
      this.state = {
        isLoading: false,
      };
    }
    show() {
      this.state.isLoading = true;
    }
    hide() {
      this.state.isLoading = false;
    }
  }
import { ErrorTemplate } from "../templates/ErrorTemplate";
import { Loading } from "../templates/Loading";
import { LoadingScreen } from "./LoadingScreen";
import { ErrorScreen } from "./ErrorScreen";

export let loadingScreen = new LoadingScreen();
export let errorScreen = new ErrorScreen();
export const App = {
  template: `<div>
            <loading id="loading" v-if="state.isLoading"></loading>
            <error-screen v-if="state2.error"></error-screen>
            <router-view/>
        </div>
    `,
  components: {
    loading: Loading,
    "error-screen": ErrorTemplate,
  },
  data() {
    return {
      state: loadingScreen.state,
      state2: errorScreen.state,
    };
  },
};

export const resultsCountComponent = {
  props: ["nbResults", "type"],
  computed: {
    styleSheet() {
      return {
        background: this.color,
      };
    },
    color() {
      switch (this.type) {
        case "siege":
          return "rgb(41,49,115)";
        case "bus":
          return "#00ac8c";
        case "antenne":
          return "#5770be";
      }
    },
    text() {
      switch (this.type) {
        case "siege":
          return "fixe";
        case "bus":
          return "itinérante";
        case "antenne":
          return "antenne";
      }
    },
  },
  template: `
          <span class="nb-result-per-type" :style="styleSheet">
              <b>{{ nbResults }}</b> {{ text }}<span v-if="nbResults>1">s</span>
          </span>
      `,
};

import { urlSearchParams } from "../src/app";

export const Slider = {
  template: `
          <div id="range-slider-group">
              <span for="customRange1" class="form-label" style="font-size:1.1em;">Rayon de recherche à vol d'oiseau : </span><br>
              <span id="input-thumb" ref="bubble">{{ radiusVal }} km</span>
              <input type="range" class="form-range" 
                  id="distance-slider" 
                  v-model="radiusVal" 
                  @change="emitRadius" 
                  min="minRadiusVal" max="50" step="0.2">
          </div><br>
      `,
  data() {
    return {
      radiusVal: "",
      minRadiusVal: 0,
      maxRadiusVal: 50,
    };
  },
  watch: {
    radiusVal() {
      let bubble = this.$refs.bubble;
      const val = this.radiusVal;
      const min = this.minRadiusVal;
      const max = this.maxRadiusVal;
      // style valeur affiché sur le slider
      const pctValue = Number(((val - min) * 100) / (max - min));
      bubble.style.left = `calc(${pctValue}% + (${5 - pctValue * 0.6}px))`;
    },
  },
  mounted() {
    // récupère la valeur du rayon dans l'URL si dispo sinon donne la valeur par défaut
    urlSearchParams.has("qr")
      ? (this.radiusVal = urlSearchParams.get("qr"))
      : (this.radiusVal = 10);
    this.emitRadius();
  },
  methods: {
    emitRadius() {
      if (urlSearchParams.has("qlatlng")) {
        // stocker rayon de recherche dans requête URL
        urlSearchParams.set("qr", this.radiusVal);
        window.history.pushState({}, "", url);
      }
      this.$emit("radiusVal", this.radiusVal);
    },
  },
};

export const SearchBar = {
  template: `
              <div id="search-bar-container">
                  <div id = "search-type-group">
                      <span id="search-type-text">Rechercher par :</span>
                      <div class="btn-group btn-group-toggle" id="search-type-radio" data-toggle="buttons">
                          <label class="search-type-btn btn btn-outline-primary active" aria-label="Rechercher une adresse" title="Rechercher une adresse">
                              <input type="radio" name="address" id="adresse-btn" @click="onChange($event)" checked>Adresse
                          </label>
                          <label class="search-type-btn btn btn-outline-primary" aria-label="Rechercher un département" title="Rechercher un département">
                              <input type="radio" name="dep" id="dep-btn" @click="onChange($event)">Département
                          </label>
                      </div>
                  </div>
                  <div class="input-group">
                          <input ref="input" class="form-control"
                                  id="search-field" type="search"
                                  :placeholder="placeholderTag" 
                                  v-model="inputAdress"
                                  @keyup="onKeypress($event)" 
                                  @keydown.down="onKeyDown"
                                  @keydown.up="onKeyUp"
                                  @keyup.enter="onEnter">
                          <button type="button" class="card-btn btn btn-outline-primary" id="btn-reinitialize" data-toggle="tooltip" title="Réinitialiser la recherche" @click="clearSearch">
                              <i class="las la-redo-alt"></i>
                          </button>
                  </div>
                  <div class="list-group" v-if="isOpen">
                      <div class="list-group-item" v-for="(suggestion, i) in suggestionsList"
                          @click="onEnter"
                          @keydown.esc="isOpen=false"
                          @mouseover="onMouseover(i)"
                          @mouseout="onMouseLeave"
                          :class="{ 'is-active': i === index }">
                          <div v-if="searchType === 'address'">
                              <span class="search-result-label">
                                  {{ suggestion.properties.label }}
                              </span><br>
                              <span class="search-result-context">
                                  {{ suggestion.properties.context }}
                              </span>
                              <span class="search-result-type">
                                  {{ suggestion.properties.type }}
                              </span>
                          </div>
                          <div v-else>
                              <span class="search-result-label">
                                  {{ suggestion.nom }}
                              </span>
                              <span class="search-result-type">
                                  {{ suggestion.code }}
                              </span>
                          </div>
                      </div>
                  </div>
              </div>`,
  data() {
    return {
      searchType: "address",
      inputAdress: "",
      isOpen: false,
      index: 0,
      suggestionsList: [],
      apiAdresse: "https://api-adresse.data.gouv.fr/search/?q=",
      apiAdmin: "https://geo.api.gouv.fr/departements?",
    };
  },
  computed: {
    placeholderTag() {
      if (this.searchType == "address") {
        return "Saisissez une adresse ...";
      } else {
        return "Saisissez un nom ou code de département ...";
      }
    },
  },
  watch: {
    inputAdress() {
      if (!this.inputAdress) {
        this.isOpen = !this.isOpen;
        this.index = 0;
        this.suggestionsList = [];
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        this.isOpen = false;
        this.index = -1;
      }
    });
  },
  destroyed() {
    document.removeEventListener("click", this.handleClickOutside);
    document.removeEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        this.isOpen = false;
        this.index = -1;
        this.handleClickOutside();
      }
    });
  },
  methods: {
    returnType(type) {
      switch (type) {
        case "housenumber":
          return (type = "Numéro");
        case "street":
          return (type = "Rue");
        case "locality":
          return (type = "Lieu-dit");
        case "municipality":
          return (type = "Commune");
      }
    },
    onChange(e) {
      this.searchType = e.target.name;
      this.inputAdress = "";
      this.$emit("searchType", this.searchType);
    },
    onKeypress(e) {
      this.isOpen = true;
      let val = this.inputAdress;

      if (val === "") {
        this.isOpen = false;
      }
      if (val != undefined && val != "") {
        if (this.searchType == "address") {
          fetch(`${this.apiAdresse}${val}&autocomplete=1`)
            .then((res) => res.json())
            .then((res) => {
              let suggestions = [];
              if (res && res.features) {
                let features = res.features;
                features.forEach((e) => {
                  e.properties.type = this.returnType(e.properties.type);
                  suggestions.push(e);
                });
              }
              this.suggestionsList = suggestions;
            })
            .catch((error) => console.error(error));
        } else if (this.searchType == "dep") {
          let field;
          let number = val.match(/\d+/);
          number ? (field = "code=") : (field = "nom=");
          fetch(`${this.apiAdmin}${field}${val}&autocomplete=1&limit=5`)
            .then((res) => res.json())
            .then((res) => {
              let suggestions = [];
              if (res) {
                res.forEach((e) => {
                  suggestions.push(e);
                });
              }
              this.suggestionsList = suggestions;
            })
            .catch((error) => console.error(error));
        }
      }
    },
    onKeyUp(e) {
      if (this.index > 0) {
        this.index = this.index - 1;
      }
    },
    onKeyDown(e) {
      if (this.index < this.suggestionsList.length) {
        this.index = this.index + 1;
      }
    },
    onMouseover(e) {
      this.index = e;
    },
    onMouseLeave() {
      this.index = -1;
    },
    onEnter() {
      this.isOpen = !this.isOpen;
      if (this.suggestionsList.length != 0) {
        suggestion = this.suggestionsList[this.index];
        if (this.searchType == "address") {
          this.inputAdress = suggestion.properties.label;
          // send data
          this.$emit("searchResult", {
            resultType: this.searchType,
            resultCoords: [
              suggestion.geometry.coordinates[1],
              suggestion.geometry.coordinates[0],
            ],
            resultLabel: suggestion.properties.label,
          });
        } else {
          this.inputAdress = suggestion.nom;
          this.$emit("searchResult", {
            resultType: this.searchType,
            resultCode: suggestion.code,
          });
        }
        this.suggestionsList = [];
        this.index = -1;
      }
    },
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.isOpen = false;
        this.index = -1;
      }
    },
    clearSearch() {
      this.inputAdress = "";
      document.getElementById("search-field").value = "";
      this.$emit("clearSearch");
    },
  },
};

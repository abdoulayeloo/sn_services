import { CardTemplate } from "../templates/CardTemplate";
import { SearchBar } from "../templates/searchBar";
import { shareLink } from "./ShareLink";
import { Slider } from "./Slider";
import { resultsCountComponent } from "./resultsCountComponent";

export const LeafletSidebar = {
  template: ` 
          <div id="sidebar" class="leaflet-sidebar collapsed">
              <!-- nav tabs -->
              <div class="leaflet-sidebar-tabs">
                  <!-- top aligned tabs -->
                  <ul role="tablist">
                      <li>
                          <a href="#home" role="tab" title="Accueil">
                              <i class="las la-home"></i>
                              <span class="tab-name">Accueil</span>
                          </a>
                      </li>
                      <li>
                          <a href="#search-tab" role="tab" title="Recherche">
                              <i class="las la-search"></i>
                              <span class="tab-name">Recherche</span>
                          </a>
                      </li>
                      <li>
                          <a href="#a-propos" role="tab" title="À propos">
                              <i class="las la-info-circle"></i>
                              <span class="tab-name">À propos</span>
                          </a>
                      </li>
                  </ul>
                  <!-- bottom aligned tabs -->
                  <!--<ul role="tablist">
                      <li><a href="#a-propos" role="tab"><i class="la la-question-circle"></i></a></li>
                      <li><a href="https://github.com/cget-carto/France-services" target="_blank"><i class="la la-github"></i></a></li>
                  </ul>-->
              </div>
              <!-- panel content -->
              <div class="leaflet-sidebar-content">
                  <div class="leaflet-sidebar-pane" id="home">
                      <div class="leaflet-sidebar-header">
                          <span>Accueil</span>
                          <span class="leaflet-sidebar-close">
                              <i class="las la-step-backward"></i>
                          </span>
                      </div>
                      <div class="panel-content">
                          <div class="header-logo">
                              <img src="img/logo_FranceServices-01.png" id="programme-logo">
                          </div>
                          <p>France services est un nouveau modèle d’accès aux services publics pour les Français. L’objectif est de permettre à chaque citoyen d’accéder aux services publics du quotidien dans un lieu unique : réaliser sa demande de carte grise, remplir sa déclaration de revenus pour les impôts sur internet ou encore effectuer sa demande d’APL. Des agents polyvalents et formés sont présents dans la France services la plus proche de chez vous pour vous accompagner dans ces démarches.</p>
                          <p>France services est un programme piloté par le <a href="https://www.cohesion-territoires.gouv.fr/" target="_blank">ministère de la Transition écologique et de la Cohésion des territoires</a> via l'Agence nationale de la cohésion des territoires (ANCT).</p>
                          <button type="button" class="card-btn btn btn-outline-primary btn-home-tab" @click="openSearchPanel">
                              <i class="las la-search"></i>
                              Trouver une France services
                          </button>
                          <button type="button" class="card-btn btn btn-outline-primary btn-home-tab" @click="window.open('https://agence-cohesion-territoires.gouv.fr/france-services-36')">
                              <i class="las la-question-circle"></i>
                              En savoir plus
                          </button>
                      </div>
                  </div>
                  <div class="leaflet-sidebar-pane" id="search-tab">
                      <div class="leaflet-sidebar-header">
                          <span>Recherche</span>
                          <span class="leaflet-sidebar-close">
                              <i class="las la-step-backward"></i>
                          </span>
                      </div>
                      <div>
                          <div id="search-inputs">
                              <search-group @searchResult="getSearchResult" @searchType="getSearchType" @clearSearch="clearSearch" ref="searchGroup"></search-group>
                              <hr/>
                              <slider @radiusVal="radiusVal" v-if="urlSearchParams.get('qtype')=='address'"></slider>
                          </div>
                          <div id="search-results-header" v-if="sourceData.length>0">
                              <span id="nb-results" v-if="urlSearchParams.get('qtype')!='click'">
                                  <b>{{ sourceData.length }}</b> résultat<span v-if="sourceData.length>1">s</span>
                              </span>
                              <button class="card-btn action btn btn-outline-primary btn"
                                      v-if="urlSearchParams.get('qtype')!='click'"
                                      style='float:right;margin-top:5px'
                                      @click="shareResults"
                                      @mouseleave="shareText='Partager'">
                                  <i class="las la-share"></i>
                                  {{ shareText }}
                              </button>
                          </div>
                          <div id="results" v-if="sourceData.length >0">
                              <div style="margin-bottom:15px" v-if="urlSearchParams.get('qtype')!='click'">
                                  <result-count :nbResults="nbResults.siege" 
                                              :type="'siege'" 
                                              v-if="nbResults.siege">
                                  </result-count>
                                  <result-count :nbResults="nbResults.bus" 
                                              :type="'bus'" 
                                              v-if="nbResults.bus">
                                  </result-count>
                                  <result-count :nbResults="nbResults.antenne"
                                              :type="'antenne'" 
                                              v-if="nbResults.antenne">
                                  </result-count>
                              </div>
                              <card v-if="show"
                                  v-for="(fs, index) in sourceData"
                                  :collapse="collapse"
                                  :fs="fs" :key="index"
                                  :cardToHover="cardToHover"
                                  @mouseover.native="$emit('hoverFeature',fs.id_fs)"
                                  @mouseout.native="$emit('clearHoveredFeature')">
                              </card>
                          </div>
                          <p style="text-align:center"v-if="Array.isArray(sourceData) & sourceData.length==0">
                              <br>Aucun résultat ... Veuillez ajuster le rayon de recherche
                          </p>
                      </div>
                  </div>
                  <div class="leaflet-sidebar-pane" id="a-propos">
                      <h2 class="leaflet-sidebar-header">
                          À propos
                          <span class="leaflet-sidebar-close">
                              <i class="las la-step-backward"></i>
                          </span>
                      </h2>
                      <a href="https://agence-cohesion-territoires.gouv.fr" target="_blank"><img src="img/LOGO-ANCT+Marianne.png" width="100%" style = 'padding-bottom: 5%;'></a>
                      <p>
                          <b>Source des données : </b>ANCT
                      </p>
                      <p>
                          <b>Réalisation :</b>
                          ANCT, <a href = 'https://cartotheque.anct.gouv.fr/cartes' target="_blank">Service cartographie</a>
                      </p>
                      <p><b>Technologies utilisées :</b> Leaflet, Bootstrap, VueJS, Turf</p>
                      <p><b>Géocodage : </b>API adresse (Base adresse nationale) et API Découpage administratif</p>
                      <p>Les données sources sont disponibles sur <a href="https://www.data.gouv.fr/fr/datasets/liste-des-structures-france-services/" target="_blank">data.gouv.fr</a>.</p>
                      <p>Le code source de cet outil est disponible sur <a href="https://github.com/anct-carto/france_services" target="_blank">Github</a>.</p>
                  </div>
              </div>
          </div>`,
  components: {
    "search-group": SearchBar,
    card: CardTemplate,
    slider: Slider,
    "result-count": resultsCountComponent,
  },
  props: ["sourceData", "cardToHover", "searchTypeFromMap"],
  data() {
    return {
      show: false,
      hoveredCard: "",
      searchType: "address",
      shareText: "Partager",
    };
  },
  computed: {
    map() {
      return this.$parent.map;
    },
    nbResults() {
      // compteur résultats par type de structure
      return {
        siege: this.countResultByType("Siège"),
        // bus: this.countResultByType("Bus"),
        antenne: this.countResultByType("Antenne"),
      };
    },
  },
  watch: {
    sourceData() {
      this.show = true;
      this.collapse = false;
    },
    cardToHover(card_id) {
      // styliser la card d'une structure survolée sur la carte
      hoveredCard = card_id;
    },
    searchTypeFromMap(value) {
      this.searchType = value;
    },
  },
  methods: {
    countResultByType(type) {
      let nb = this.sourceData.filter((e) => {
        return e.type == type;
      }).length;
      return nb;
    },
    getSearchResult(result) {
      // emit search result from child to parent (map)
      this.$emit("searchResult", result);
    },
    getSearchType(e) {
      this.searchType = e;
    },
    clearSearch() {
      this.$emit("clearMap");
    },
    shareResults() {
      // this.$emit('zoomOnResults');
      this.shareText = "Lien copié !";
      shareLink(url.search);
    },
    radiusVal(e) {
      this.$emit("bufferRadius", e);
    },
    openSearchPanel() {
      this.$emit("openSearchPanel");
    },
  },
};

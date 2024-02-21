import { CardControlBtn } from "../components/CardControlButton";
import { shareLink } from "../components/ShareLink";
import { urlSearchParams } from "../src/app";

export const CardTemplate = {
  template: `
      <div class="card result-card"
              aria-label="Cliquer pour afficher plus d'informations"
              title="Cliquer pour afficher plus d'informations"
              :id="fs.id_fs"
              @click="showInfo = !showInfo" 
              :class="getHoveredCard()">
          <div class="card-header" :class="getClass()">
              <div class="card-text">
                  <i :class="getFontIcon()"></i> 
                  <span class="card-header-left">{{ fs.lib_fs }}</span>
                  <span class="distance" v-if="fs.distance">
                      <i class = "las la-map-marker"></i>
                      {{ fs.distance }} km
                  </span>                      
              </div>
          </div>
          <div class="card-body"">
              <div class = "intro">
                  <p v-if="fs.itinerance=='oui'">
                      <i class="las la-exclamation-circle"></i> 
                      <ul>
                          <li>Cette France services est en itinérance</li>
                      </ul>
                  </p>
                  <p>
                      <i class = "las la-map-marker"></i>
                      <ul>
                          <li>
                              {{ fs.adresse }} 
                          </li>
                          <li v-if = "fs.complement_adresse.length">
                              {{ fs.complement_adresse }} 
                          </li>
                          <li>
                              {{ fs.code_postal }} {{ fs.lib_com }}
                          </li>
                      </ul>
                  </p>
              </div>
              <div class="corps" v-show="showInfo">
                  <p v-if = "fs.telephone">
                  <i class = "las la-phone"></i>
                  <ul>
                      <li @click="event.stopPropagation()">{{ fs.telephone }}</li>
                  </ul>
                  </p>
                  <p v-if = "fs.mail">
                  <i class = "las la-at card-icon" ></i>
                  <ul>
                      <li><a v-bind:href = "'mailto:' + fs.mail" target = "_blank">{{ fs.mail }}</a></li>
                  </ul>
                  </p>
                  <p>
                      <i class = "las la-clock"></i>
                      <ul>
                          <li>
                              <b>Lundi : </b>{{ fs.h_lundi }} 
                          </li>
                          <li>
                              <b>Mardi : </b>{{ fs.h_mardi }} 
                          </li>
                          <li>
                              <b>Mercredi : </b>{{ fs.h_mercredi }} 
                          </li>
                          <li>
                              <b>Jeudi : </b>{{ fs.h_jeudi }} 
                          </li>
                          <li>
                              <b>Vendredi : </b>{{ fs.h_vendredi }} 
                          </li>
                          <li>
                              <b>Samedi : </b>{{ fs.h_samedi }} 
                          </li>
                      </ul>
                  </p>
                  <p v-if="fs.site_web" @click="event.stopPropagation()">
                      <i class = "las la-desktop"></i>                    
                      <ul>
                          <li><a :href="fs.site_web" target="_blank" aria-label="">Voir le site internet</a></li>
                      </ul>
                  </p>
                  <p v-if="fs.prise_rdv && fs.prise_rdv == 'Oui'" @click="event.stopPropagation()">
                      <i class = "las la-calendar-check"></i>                    
                      <ul>
                          <li>Prise de rendez-vous possible</li>
                      </ul>
                  </p>
                  <p v-if="fs.commentaire" @click="event.stopPropagation()" class="card-body-commentaire">
                      <i class = "las la-info-circle"></i>                    
                      <ul>
                          <li>{{ fs.commentaire }}</li>
                      </ul>
                  </p>
                  <p v-if="fs.groupe">
                      <i class="las la-share-alt"></i>
                      Cette structure fait partie du réseau "{{ fs.groupe }}"
                  </p>
                  <div class="card-controls">
                      <control-btn :icon="'search-plus'" :text="'Zoom'" @click.native="zoomOnMap"></control-btn>
                      <control-btn :icon="'arrows-alt'" :text="'Centrer'" @click.native="flyOnMap"></control-btn>
                      <control-btn :icon="'route'" :text="'Itinéraire'" @click.native="getMapsRoute"></control-btn>
                      <control-btn :icon="'file-pdf'" :text="'Télécharger'" @click.native="getPdf"></control-btn>
                      <control-btn :icon="'clipboard'" :text="'Partager'" @click.native="copyLink" @mouseout.native="tooltipOff"></control-btn>
                      <span class="copied-tooltip" v-if="showTooltip">Lien copié!</span>
                  </div>
              </div>
          </div>
      </div>`,
  props: ["fs", "cardToHover", "collapse"],
  data() {
    return {
      showInfo: false,
      hoverStyle: "",
      clicked: false,
      showTooltip: false,
    };
  },
  components: {
    "control-btn": CardControlBtn,
  },
  mounted() {
    // control collapsing : if only one card is on side panel than collapse = true else false
    if (this.collapse == true || urlSearchParams.get("qtype") == "click") {
      this.showInfo = true;
    } else {
      this.showInfo = this.showInfo;
    }
  },
  methods: {
    getClass() {
      // utiisé pour couleur tooltip dans style.css
      return {
        "fs-siege": this.fs.type === "Siège",
        "fs-antenne": this.fs.type === "Antenne",
        "fs-bus": this.fs.type === "Bus",
      };
    },
    getFontIcon() {
      // utilisé pour renvoyer une maison ou un bus en header de la card
      return {
        "las la-home": this.fs.itinerance === "non",
        "las la-shuttle-van": this.fs.itinerance === "oui",
      };
    },
    getHoveredCard() {
      // si marqueur survolé sur la carte
      // créé un liseré rouge et un style différent sur la carte
      // dans le fichier style.css au moyen du nom de classe correspondant
      if (this.cardToHover === this.fs.id_fs) {
        return "hovered";
      } else {
        return "card";
      }
    },
    // boutons de controles
    zoomOnMap() {
      event.stopPropagation();
      map = this.$parent.map;
      map.flyTo([this.fs.latitude, this.fs.longitude], 16, {
        duration: 1,
      });
    },
    flyOnMap() {
      event.stopPropagation();
      map = this.$parent.map;
      map.panTo([this.fs.latitude, this.fs.longitude], {
        duration: 1,
      });
    },
    getMapsRoute() {
      let gmapsUrl = `https://www.google.com/maps/dir//${this.fs.latitude},${this.fs.longitude}/@${this.fs.latitude},${this.fs.longitude},17z/`;
      window.open(gmapsUrl, "_blank").focus();
    },
    getPdf() {
      this.$router.push({
        name: "fiche",
        params: { id_fs: this.fs.id_fs, fs: this.fs },
      });
    },
    copyLink() {
      event.stopPropagation();
      shareLink(`?qtype=click&id_fs=${this.fs.id_fs}`);
      this.showTooltip = true;
    },
    // affiche ou masque la tooltip "lien copié!" si clic sur le btn "partager"
    tooltipOff() {
      this.showTooltip = false;
    },
  },
};

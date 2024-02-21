import { urlSearchParams } from "../src/app";

window.jsPDF = window.jspdf.jsPDF;

export const FichePDF = {
  template: `
      <div class="container-sm" id="fiche-pdf">
      <div class="row">
              <div class="header-pdf-logos">
                  <img src="img/logo_rf.jpg" class="logo-rf">
                  <img src="img/logo_FranceServices_sans-marianne-01.jpg" class="logo-fs">
              </div>
              <div class="col-11 p-0">
                  <span style="font-size:.8em">Fiche d'information France services - données extraites le {{ date }}</span>
                  <h2 style='font-weight:bolder'><b>{{ fs.lib_fs }}</b></h2><br>
                  <div class = "intro">
                      <p v-if="fs.itinerance=='oui'">
                          <span>Attention : cette France services est en itinérance</span>
                      </p>
                      <p>
                          Immatriculation de véhicules, RSA, impôt, permis de conduire, accès aux services en ligne... Vous avez besoin d’aide pour vos démarches administratives ? Quel que soit l’endroit où vous vivez, en ville ou à la campagne, France services est un guichet unique qui donne accès dans un seul et même lieu aux principaux organismes de services publics : le ministère de l'Intérieur, le ministère de la Justice, les Finances publiques, Pôle emploi, l'Assurance retraite, l'Assurance maladie, la CAF, la MSA et la Poste.</p>
                      <p>
                          Retrouvez la France services la plus proche de chez vous sur <a href="france-services.gouv.fr" target="_blank">france-services.gouv.fr</a> 
                      </p>
                      <div class="row">
                          <div class="col-6">
                              <h5>
                                  <!--<i class = "las la-map-marker"></i>-->
                                  <b>Adresse</b>
                              </h5>
                              <div>
                                  <span>
                                      {{ fs.adresse }} <br>
                                  </span>
                                  <span v-if = "fs.complement_adresse.length">
                                      {{ fs.complement_adresse }}<br>
                                  </span>
                                  <span>
                                      {{ fs.code_postal }} {{ fs.lib_com }}
                                  </span>
                              </div><br>
                              <div>
                                  <p>
                                      <h5>
                                          <!--<i class = "las la-clock"></i>-->
                                          <b>Horaires d'ouverture</b>
                                      </h5>
                                      <ul style="list-style: none;display: inline-block;padding-left: 5px;">
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
                                  <h5>
                                      <!--<i class = "las la-phone"></i>-->
                                      <b>Contact</b>
                                  </h5>
                                  <span v-if = "fs.telephone"><b>Téléphone : </b>{{ fs.telephone }}</span><br>
                                  <span v-if = "fs.mail"><b>Courriel : </b><a v-bind:href = "'mailto:' + fs.mail" target = "_blank">{{ fs.mail }}</a></span>
                              </div><br>
                          </div>
                          <div class="col-6">
                              <div id="map-pdf"></div>
                          </div>
                      </div>
                  </div><br>
                  <div class="corps">
                      <div v-if="fs.commentaire">
                          <!--<i class = "las la-info-circle"></i>-->
                          <h5><b>Commentaire(s)</b></h5>
                          <span>{{ fs.commentaire }}</span>
                      </div>
                  </div>
               </div>
          </div>
      </div>`,
  computed: {
    fs() {
      return this.$route.params.fs;
    },
    tooltipType() {
      let type = this.fs.type;
      if (type === "Siège") {
        return "siege";
      } else if (type === "Antenne") {
        return "antenne";
      } else if (type === "Bus") {
        return "bus";
      }
    },
    date() {
      let todayDate = new Date(Date.now());
      return todayDate.toLocaleDateString();
    },
  },
  mounted() {
    let fs = this.fs;
    let coords = [fs.latitude, fs.longitude];
    let map = new L.map("map-pdf", {
      center: [
        urlSearchParams.get("lat") || 46.41322,
        urlSearchParams.get("lng") || 1.219482,
      ],
      zoom: urlSearchParams.get("z") || defaultZoomLevel,
      preferCanvas: true,
      zoomControl: false,
    }).setView(coords, 16);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '<a href="https://agence-cohesion-territoires.gouv.fr/" target="_blank">ANCT</a> | Fond cartographique &copy;<a href="https://stadiamaps.com/">Stadia Maps</a> &copy;<a href="https://openmaptiles.org/">OpenMapTiles</a> &copy;<a href="http://openstreetmap.org">OpenStreetMap</a>',
      }
    ).addTo(map);

    L.control.scale({ position: "bottomright", imperial: false }).addTo(map);

    new L.marker(coords, {
      icon: L.icon({
        iconUrl: "./img/picto_siege.png",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      }),
    }).addTo(map);

    setTimeout(() => {
      let router = this.$router;

      let pdf = new jsPDF("p", "mm", [210, 297]);
      pdf.setFont("Marianne-Regular");

      let htmlToPrint = this.$el;

      let outputFileName = "france-services-fiche-" + this.fs.id_fs + ".pdf";

      pdf.html(htmlToPrint, {
        margin: [5, 16, 0, 16],
        html2canvas: {
          scale: 0.25,
        },
        callback: function (pdf) {
          pdf.save(outputFileName);
          router.push({ path: "/" });
        },
      });
    }, 500);
  },
};

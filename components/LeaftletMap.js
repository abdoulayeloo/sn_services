import { urlSearchParams } from "../src/app.js";
import { loadingScreen } from "./App.js";
import { LeafletSidebar } from "./LeaftletSIdebar.js";
export const LeafletMap = {
  template: `
          <div>
            <sidebar ref="sidebar"
              :sourceData="resultList" 
              :cardToHover="hoveredMarker"
              :searchTypeFromMap="searchType"
              @hoverFeature="onMouseOver" 
              @clearHoveredFeature="hoveredLayer.clearLayers()"
              @bufferRadius="updateBuffer" 
              @searchResult="getSearchResult"
              @openSearchPanel="sidebar.open('search-tab')"
              @zoomOnResults="zoomOnResults"
              @clearMap="clearMap">
            </sidebar>
              <div id="mapid" ref="map">
              </div>
          </div>
      `,
  components: {
    sidebar: LeafletSidebar,
  },
  data() {
    return {
      config: {
        // config initiale
        map: {
          container: "mapid",
          tileLayer:
            "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          attribution:
            '<a href="https://cartotheque.anct.gouv.fr/cartes" target="_blank">ANCT</a> | Fond cartographique &copy;<a href="https://stadiamaps.com/">Stadia Maps</a> &copy;<a href="https://openmaptiles.org/">OpenMapTiles</a> &copy;<a href="http://openstreetmap.org">OpenStreetMap</a>',
          zoomPosition: "topright",
          scalePosition: "bottomright",
          initialView: {
            zoomControl: false,
            zoom: 5.5555,
            center: [46.41322, 1.219482],
            zoomSnap: 0.025,
            minZoom: 4.55,
            maxZoom: 18,
            preferCanvas: true,
          },
        },
        sidebar: {
          container: "sidebar",
          autopan: true,
          closeButton: true,
          position: "left",
        },
      },
      styles: {
        features: {
          default: {
            radius: 5.5,
            color: "white",
            weight: 1.2,
            fillOpacity: 1,
            className: "fs-marker",
          },
        },
        tooltip: {
          default: {
            radius: 5.5,
            color: "white",
            weight: 1.2,
            fillOpacity: 1,
            className: "fs-marker",
          },
          clicked: {
            direction: "top",
            opacity: 1,
            permanent: true,
          },
        },
      },
      // variables de communication utilisées avec les composants enfants
      hoveredMarker: "",
      searchType: "",
      addressCoords: null,
      addressLabel: null,
      depResult: null,
      searchRadius: 10,
      resultList: "",
    };
  },
  computed: {
    map() {
      let defaultZoomLevel = this.iframe ? 6 : 5.55;
      const map = new L.map(
        this.config.map.container,
        this.config.map.initialView,
        {
          center: [
            urlSearchParams.get("lat") || 46.41322,
            urlSearchParams.get("lng") || 1.219482,
          ],
          zoom: urlSearchParams.get("z") || defaultZoomLevel,
        }
      );
      L.tileLayer(this.config.map.tileLayer, {
        attribution: this.config.map.attribution,
      }).addTo(map);
      // zoom control, scale bar, fullscreen
      L.control.zoom({ position: this.config.map.zoomPosition }).addTo(map);
      L.control
        .scale({ position: this.config.map.scalePosition, imperial: false })
        .addTo(map);
      L.control
        .fullscreen({
          position: "topright",
          forcePseudoFullScreen: true,
          title: "Afficher la carte en plein écran",
        })
        .addTo(map);
      // on click remove previous clicked marker
      map.on("click", () => {
        event.stopPropagation();
        this.clearURLParams();
        this.clearMap();
      });
      // Get url parameters
      map.on("moveend", () => {
        // get map params
        this.setMapExtent();
        window.history.pushState({}, "", url);
      });

      return map;
    },
    sidebar() {
      const sidebar = window.L.control
        .sidebar(this.config.sidebar)
        .addTo(this.map);
      // prevent drag over the sidebar and the legend
      preventDrag(sidebar, this.map);
      return sidebar;
    },
    // CALQUES
    buffer() {
      // calque pour le rayon de recherche
      if (this.addressCoords) {
        return L.circle(this.addressCoords, {
          color: "red",
          fillColor: "rgba(0,0,0,1)",
          interactive: false,
        });
      }
    },
    fsLayer() {
      return L.layerGroup({ className: "fs-layer" }).addTo(this.map);
    },
    clickedMarkerLayer() {
      return L.layerGroup({ className: "clicked-marker-layer" }).addTo(
        this.map
      );
    },
    adressLayer() {
      return L.layerGroup({ className: "address-marker-layer" }).addTo(
        this.map
      );
    },
    maskLayer() {
      return L.layerGroup({ className: "buffer-layer" }).addTo(this.map);
    },
    hoveredLayer() {
      return L.layerGroup({ className: "buffer-layer" }).addTo(this.map);
    },
    isIframe() {
      // savoir s'il faut ouvrir l'onglet accueil ou recherche
      return window.location === window.parent.location ? true : false;
    },
  },
  watch: {
    // surveille l'objet renvoyé par la barre de recherche
    // et retrouve les résultats au moyen d'un géotraitement
    // calcul de la distance entre le couple XY de l'adresse et  toutes les FS
    // puis ne retient que les plus proches, seulement la valeur du slider rayon de recherche
    addressCoords() {
      let dataGeom = [];
      // reset everything : clear layers, previous clicked markers
      this.clearMap();

      // drop marker of searched address on map
      if (this.addressCoords) {
        L.marker(this.addressCoords)
          .bindTooltip(this.addressLabel, {
            permanent: true,
            direction: "top",
            className: "leaflet-tooltip-result",
          })
          .openTooltip()
          .addTo(this.adressLayer);
      }

      // convert data lat lng to featureCollection
      this.data.forEach((feature) =>
        dataGeom.push(
          turf.point([feature.latitude, feature.longitude], {
            id: feature.id_fs,
          })
        )
      );
      dataGeom = turf.featureCollection(dataGeom);
      // compute distance for each point
      dataGeom.features.forEach((feature) => {
        // !!!!! REVERSE [lat,lon] TO [lon,lat] FORMAT to compute correct distance !!!!!!!!!!!!
        lon_dest = feature.geometry.coordinates[1];
        lat_dest = feature.geometry.coordinates[0];

        Object.defineProperty(feature.properties, "distance", {
          value: turf.distance(
            [this.addressCoords[1], this.addressCoords[0]],
            [lon_dest, lat_dest],
            {
              units: "kilometers",
            }
          ),
          writable: true,
          enumerable: true,
          configurable: true,
        });
      });

      // sort by distance
      dataGeom.features.sort((a, b) => {
        if (a.properties.distance > b.properties.distance) {
          return 1;
        } else if (a.properties.distance < b.properties.distance) {
          return -1;
        } else if (a.properties.distance === b.properties.distance) {
          return 0;
        }
      });

      // send ids of found fs to data prop
      let dataGeomIds = dataGeom.features.map((e) => {
        return e.properties.id;
      });
      let closestPts = []; // closest points
      closestPts = this.data.filter((e) => {
        return dataGeomIds.includes(e.id_fs);
      });

      closestPts.forEach((e) => {
        dataGeom.features.forEach((d) => {
          if (d.properties.id === e.id_fs) {
            e.distance = Math.round(d.properties.distance * 10) / 10;
          }
        });
      });

      // if radius in url then take url radius
      urlSearchParams.has("radius")
        ? (searchRadius = urlSearchParams.get("radius"))
        : (searchRadius = this.searchRadius);

      // filtre avec la distance inférieure au rayon de recherche puis tri croissant
      this.resultList = closestPts
        .filter((e) => {
          return e.distance <= searchRadius;
        })
        .sort((a, b) => {
          if (a.distance > b.distance) {
            return 1;
          } else if (a.distance < b.distance) {
            return -1;
          } else if (a.distance === b.distance) {
            return 0;
          }
        });

      // create buffer (utilisé uniquement pour la visualisation)
      let radius = this.searchRadius * 1000;
      let searchPerimeterLayer = this.buffer.setRadius(radius);
      this.maskLayer.addLayer(searchPerimeterLayer);
      // pan map view to circle with offset from sidebar
      this.flyToBoundsWithOffset(searchPerimeterLayer);

      // setup url params
      urlSearchParams.set("qtype", "address");
      urlSearchParams.set("qlatlng", this.addressCoords);
      urlSearchParams.set("qlabel", this.addressLabel);
      urlSearchParams.set("qr", this.searchRadius);
      window.history.pushState({}, "", url);
    },
    // surveille l'objet renvoyé par la barre de recherche
    // et retrouve les résultats au moyen d'un filtre par insee dep
    depResult() {
      // clear address layers (buffer + pin address)
      this.clearMap();

      // filter data with matching departement code and send it to cards
      this.resultList = this.data
        .filter((e) => {
          return e.insee_dep == this.depResult;
        })
        .sort((a, b) => {
          let compare = 0;
          a.lib_fs > b.lib_fs ? (compare = 1) : (compare = 0);
          return compare;
        });
      // purge object from distance property (computed in 'address' search)
      this.resultList.forEach((e) => delete e.distance);

      // renvoie la géométrie du département recherché pour créer un masque
      let filteredFeature = this.geomDep.features.find(
        (e) => e.properties.insee_dep === this.depResult
      );
      L.mask(filteredFeature, {
        fillColor: "rgba(0,0,0,.25)",
        color: "red",
      }).addTo(this.maskLayer);

      // pan to dep borders
      this.flyToBoundsWithOffset(new L.GeoJSON(filteredFeature));

      // setup url params
      this.clearURLParams();
      urlSearchParams.set("qtype", "admin");
      urlSearchParams.set("qcode", this.depResult);
      urlSearchParams.set("qlabel", filteredFeature.properties.lib_dep);
      // window.history.pushState({},'',this.url);
    },
  },
  async mounted() {
    loadingScreen.show(); // pendant le chargement, active le chargement d'écran

    try {
      // ajoute une légende
      const legend = L.control({ position: "topright" });
      const map = this.map; // obligatoire pour la légende
      legend.onAdd = (map) => {
        let expand = false;
        var div = L.DomUtil.create("div", "leaflet-legend");
        div.title = "Légende";
        div.ariaLabel = "Légende";
        let content_default = "<i class='la la-list' aria-label='Légende'></i>";
        div.innerHTML += content_default;

        // div.addEventListener("click", () => {
        //   event.stopPropagation();
        //   if (expand === false) {
        //     expand = true;
        //     // here we can fill the legend with colors, strings and whatever
        //     div.innerHTML = `<span style="font-family:'Marianne-Bold'">Type de structure</span><br>`;
        //     div.innerHTML += `<span class="leaflet-legend-marker-siege"></span><span> Site principal</span><br>`;
        //     // div.innerHTML += `<span class="leaflet-legend-marker-bus"></span><span> Bus itinérant</span><br>`;
        //     // div.innerHTML += `<span class="leaflet-legend-marker-antenne"></span><span> Antenne</span><br>`;
        //   } else if (expand == true) {
        //     expand = false;
        //     div.innerHTML = content_default;
        //   }
        //   map.on("click", () => {
        //     if (expand === true) {
        //       expand = false;
        //       div.innerHTML = content_default;
        //     }
        //   });
        // });
        return div;
      };
      legend.addTo(this.map);

      this.geomDep = await this.loadGeom("data/geom_dep.geojson");
      this.data = await getData(dataUrl); // charge les données

      this.createFeatures(this.data); // représente les points sur la carte

      loadingScreen.hide(); // enlève le chargement d'écran
    } catch (error) {
      console.error(error);
      errorScreen.show();
    }
  },
  methods: {
    async loadGeom(file) {
      // fonction de chargement de fichier geojson ou json (utilisée dans plein de projets)
      const res = await fetch(file);
      const data = await res.json();
      return data;
    },
    createFeatures(fs_tab_fetched) {
      // check if app loaded in an iframe
      this.isIframe
        ? this.sidebar.open("home")
        : this.sidebar.open("search-tab");

      for (let i = 0; i < fs_tab_fetched.length; i++) {
        let e = fs_tab_fetched[i];

        // marqueur graphique ; (affiché sur la carte)
        // aspect visuel uniquement, ne gère aucune interaction
        let circle = L.circleMarker(
          [e.latitude, e.longitude],
          this.styles.features.default
        );
        circle.setStyle({ fillColor: this.getMarkerColor(e.type) });

        // marqueur de plus gros rayon invisible par dessus le marqueur affiché précédemment
        // utile survoler ou cliquer plus facilement (autrement le premier marqueur est trop petit)
        let circleAnchor = L.circleMarker([e.latitude, e.longitude], {
          radius: 20,
          // opacité à 0 pour ne pas l'afficher
          fillOpacity: 0,
          opacity: 0,
        })
          .on("mouseover", (e) => {
            const id = e.sourceTarget.content.id_fs; // 1. récupère l'id de la FS
            this.onMouseOver(id); // 2. générer un pin à partir de l'id (filtre le tableau oriiginal)
            // send hovered marker's ID to children cards
            if (this.resultList) {
              this.hoveredMarker = id;
            }
          })
          .on("mouseout", () => {
            this.onMouseOut();
            this.hoveredMarker = "";
          })
          .on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            this.displayInfo(e.sourceTarget.content); // au clic, récupère les infos de la structure
          });
        circleAnchor.content = e; // le contenu de ce marqueur invisible
        [circle, circleAnchor].forEach((layer) => this.fsLayer.addLayer(layer));
      }

      this.map.addLayer(this.fsLayer);

      this.getURLSearchParams();
    },
    flyToBoundsWithOffset(layer) {
      // emprise de la carte fixée sur le territoire résultat
      // cette fonction est utile pour faire décaler le centre de la carte sur le côté droit si le panneau est ouvert
      let offset = document
        .querySelector(".leaflet-sidebar-content")
        .getBoundingClientRect().width;
      this.map.flyToBounds(layer, {
        paddingTopLeft: [offset, 0],
        duration: 0.75,
      });
    },
    onMouseOver(id) {
      this.hoveredLayer.clearLayers();
      this.getMarkerToPin(id).addTo(this.hoveredLayer);
    },
    onMouseOut() {
      this.hoveredLayer.clearLayers();
    },
    displayInfo(fs) {
      // récupèr les infos relatives à une FS cliquée et envoie la vers la sidebar
      this.sidebar.open("search-tab");
      // send info of the one clicked point to children (cards)
      if (fs.distance) {
        delete fs.distance;
      }
      this.resultList = [fs];

      this.clickedMarkerLayer.clearLayers();
      let marker = this.getMarkerToPin(fs.id_fs);
      this.clickedMarkerLayer.addLayer(marker);

      // remove buffer and address marker
      this.maskLayer.clearLayers();
      this.adressLayer.clearLayers();

      // setup url params
      this.clearURLParams();
      this.setMapExtent();
      urlSearchParams.set("qtype", "click");
      urlSearchParams.set("id_fs", fs.id_fs);
      window.history.pushState({}, "", url);
    },
    getMarkerToPin(id) {
      // affiche un pin au dessus d'une structure survolée depuis la sidebar
      const featureToHover = this.data.find((e) => e.id_fs == id);
      const hoveredFeature = L.marker(
        [featureToHover.latitude, featureToHover.longitude],
        {
          className: "fs-marker",
          icon: L.icon({
            iconUrl: this.getIconCategory(featureToHover.type),
            iconSize: [40, 40],
            iconAnchor: [20, 40],
          }),
        }
      );

      const tooltipContent = `
                  <span class='leaflet-tooltip-header ${this.getTooltipCategory(
                    featureToHover.type
                  )}'>
                      ${featureToHover.lib_fs}
                  </span>
                  <span class='leaflet-tooltip-body'>
                      ${featureToHover.code_postal} ${featureToHover.lib_com}
                  </span>`;

      hoveredFeature.bindTooltip(tooltipContent, this.styles.tooltip.clicked);

      return hoveredFeature;
    },
    getSearchResult(e) {
      this.searchType = e.resultType;
      // get result infos emitted from search group
      if (e.resultType == "address") {
        this.addressCoords = e.resultCoords;
        this.addressLabel = e.resultLabel;
      } else {
        this.depResult = e.resultCode;
      }
    },
    updateBuffer(new_radius) {
      // actualise le rayon du buffer selon le rayon de recherche saisi
      // et renvoie les bons résultats en conséquence vers la sidebar
      this.searchRadius = new_radius;
      if (this.buffer) {
        this.buffer.setRadius(new_radius * 1000);
        this.resultList = this.data
          .filter((e) => {
            return e.distance <= new_radius;
          })
          .sort((a, b) => {
            if (a.distance > b.distance) {
              return 1;
            } else if (a.distance < b.distance) {
              return -1;
            } else if (a.distance === b.distance) {
              return 0;
            }
          });
        this.flyToBoundsWithOffset(this.buffer);
      }
    },
    zoomOnResults() {
      // fixe l'emprise de la carte sur la bbox des points sur la carte
      const bounds = this.resultList.map((e) => {
        return [e.latitude, e.longitude];
      });
      this.flyToBoundsWithOffset(bounds);
    },
    clearMap() {
      this.resultList = "";
      this.clickedMarkerLayer.clearLayers();
      this.maskLayer.clearLayers();
      this.adressLayer.clearLayers();
      // purge url params
      this.clearURLParams();
    },
    clearURLParams() {
      // réinitialise les paramètres de requête de la carte
      url.search = "";
      window.history.pushState({}, "", url);
    },
    getURLSearchParams() {
      // récupère les paramètres de requête de l'URL
      // et renvoie les données correspondantes sur la carte
      // directement au chargement de cette dernière
      let queryType = urlSearchParams.get("qtype");
      searchQuery = document.getElementById("search-field");
      searchQuery.value = urlSearchParams.get("qlabel") || "";

      if (queryType) {
        this.sidebar.open("search-tab");
      }
      switch (queryType) {
        case "address":
          this.addressCoords = urlSearchParams.get("qlatlng").split(",");
          this.addressLabel = urlSearchParams.get("qlabel");
          break;
        case "admin":
          this.depResult = urlSearchParams.get("qcode");
          break;
        case "click":
          let id = urlSearchParams.get("id_fs");
          let fs = this.data.find((e) => e.id_fs == id);
          this.displayInfo(fs);
          center = this.map.getCenter();
          this.map.setView([center.lat, fs.longitude]);
          break;
      }
    },
    // inscrire les paramètres d'emprise de la carte dans l'URL
    setMapExtent() {
      urlSearchParams.set("lat", this.map.getCenter().lat.toFixed(6));
      urlSearchParams.set("lng", this.map.getCenter().lng.toFixed(6));
      urlSearchParams.set("z", this.map.getZoom());
    },
    // styles
    getMarkerColor(type) {
      switch (type) {
        case "Siège":
          return "rgb(41,49,115)";
        case "Antenne":
          return "#5770be";
        case "Bus":
          return "#00ac8c";
      }
    },
    getIconCategory(type) {
      if (type === "Siège") {
        return "./img/picto_siege.png";
      } else if (type === "Antenne") {
        return "./img/picto_antenne.png";
      } else if (type === "Bus") {
        return "./img/picto_itinerante.png";
      }
    },
    getTooltipCategory(type) {
      if (type === "Siège") {
        return "siege";
      } else if (type === "Antenne") {
        return "antenne";
      } else if (type === "Bus") {
        return "bus";
      }
    },
  },
};

import { App } from "../components/App";
import { router } from "../components/PdfGenerate";

// préparation paramètres requête (recherche ou clic) enregistrés dans l'URL
// exemple : https://anct-carto.github.io/france_services/?qtype=address&qlatlng=48.850699%2C2.308628&qlabel=20+Avenue+de+S%C3%A9gur+75007+Paris&qr=10&lat=48.850744&lng=2.196202&z=11.625
export const url = new URL(window.location.href);
export const urlSearchParams = url.searchParams;
export const qtype = urlSearchParams.get("qtype");

// Chargement données globales ****************************************************************************

export const dataUrl = "http://localhost:5173/data/afa.csv";

// instance vue
new Vue({
  el: "#app",
  router: router,
  components: {
    app: App,
  },
});
import { fetchCsv } from "./fetchCsv";

export async function getData(path) {
  const sessionData = JSON.parse(sessionStorage.getItem("session_data1"));
  if (sessionData) {
    console.log("Chargement depuis local storage");
    return sessionData;
  } else {
    try {
      console.log("Chargement depuis data.gouv");
      let data = await fetchCsv(path);
      // s'assurer qu'il n'y a pas de coordonnées nulles sinon la page plante
      data = data.filter(
        (e) =>
          (e.latitude != 0) &
          (e.latitude != "") &
          (e.longitude != 0) &
          (e.longitude != "") &
          (e.id_fs != "")
      );
      // transformations avant utilisation pour obtenir les catégories de FS
      data.forEach((e) => {
        e.itinerance = e["itinerance"].toLowerCase();
        if (e.itinerance == "non" || e.itinerance == "") {
          if (e.format_fs == "Site principal") {
            e.type = "Siège";
          } else if (e.format_fs == "Antenne") {
            e.type = "Antenne";
          }
        } else {
          e.type = "Bus";
        }
      });
      sessionStorage.setItem("session_data1", JSON.stringify(data));
      return data;
    } catch (error) {
      console.error(error);
    }
  }
}

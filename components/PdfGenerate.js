import { VueRouter } from "../lib/vue-router.global";
import { FichePDF } from "./FichiePdf";
import { LeafletMap } from "./LeaftletMap";

export const router = new VueRouter({
  // mode:'history',
  routes: [
    {
      name: "carte",
      path: "/",
      component: LeafletMap,
    },
    {
      name: "fiche",
      path: "/fiche:id_fs",
      component: FichePDF,
      props: true,
    },
  ],
});

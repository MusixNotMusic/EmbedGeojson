import { createRouter, createWebHashHistory } from "vue-router";

const routes= [
  { path: "/", redirect: "/index" },
  {
    path: "/index",
    name: "index",
    redirect: "/GeoJsonIO",
    component: () => import("../components/Index.vue"),
    children: [
      {
        path: "/GeoJsonIO",
        name: "GeoJsonIO",
        component: () => import("../components/GeoJsonIO/GeoJsonIO.vue"),
      }
    ],
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  linkActiveClass: "active",
});

export default router;

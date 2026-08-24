import { createRouter, createWebHistory } from "vue-router";
import CompetitionsView from "../views/CompetitionsView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            redirect: "/competitions",
        },
        {
            path: "/competitions",
            name: "competitions",
            component: CompetitionsView,
        },
    ],
});

export default router;
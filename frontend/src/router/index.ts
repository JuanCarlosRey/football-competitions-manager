import { createRouter, createWebHistory } from "vue-router";
import CompetitionsView from "../views/CompetitionView.vue";
import OrganizationView from "../views/organization/OrganizationView.vue";
import OrganizationForm from "../views/organization/OrganizationForm.vue";

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
        {
            path: "/organizations",
            name: "organizations",
            component: OrganizationView,
        },
        {
            path: "/organizations/new",
            name: "organization-create",
            component: OrganizationForm,
        },
        {
            path: "/organizations/:id/edit",
            name: "organization-edit",
            component: OrganizationForm,
        },
    ],
});

export default router;
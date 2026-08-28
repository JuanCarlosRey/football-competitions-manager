import { createRouter, createWebHistory } from "vue-router";
import CompetitionsView from "../views/competition/CompetitionView.vue";
import CompetitionForm from "../views/competition/CompetitionForm.vue"
import OrganizationView from "../views/organization/OrganizationView.vue";
import OrganizationForm from "../views/organization/OrganizationForm.vue";
import SeasonView from "../views/season/SeasonView.vue";
import SeasonForm from "../views/season/SeasonForm.vue";

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
            path: "/competitions/new",
            name: "competition-create",
            component: () => CompetitionForm,
        },
        {
            path: "/competitions/:id/edit",
            name: "competition-edit",
            component: () => CompetitionForm,
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
                {
            path: "/seasons",
            name: "seasons",
            component: SeasonView,
        },
        {
            path: "/seasons/new",
            name: "season-create",
            component: SeasonForm,
        },
        {
            path: "/seasons/:id/edit",
            name: "season-edit",
            component: SeasonForm,
        },
    ],
});

export default router;
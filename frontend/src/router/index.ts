import { createRouter, createWebHistory } from "vue-router";
import CompetitionsView from "../views/competition/CompetitionView.vue";
import CompetitionForm from "../views/competition/CompetitionForm.vue"
import CompetitionDetail from "../views/competition/CompetitionDetail.vue";
import OrganizationView from "../views/organization/OrganizationView.vue";
import OrganizationForm from "../views/organization/OrganizationForm.vue";
import OrganizationDetail from "../views/organization/OrganizationDetail.vue";
import SeasonView from "../views/season/SeasonView.vue";
import SeasonForm from "../views/season/SeasonForm.vue";
import SeasonDetail from "../views/season/SeasonDetail.vue";
import TeamView from "../views/team/TeamView.vue";
import TeamForm from "../views/team/TeamForm.vue";
import TeamDetail from "../views/team/TeamDetail.vue";
import StadiumView from "../views/stadium/StadiumView.vue";
import StadiumForm from "../views/stadium/StadiumForm.vue";
import StadiumDetail from "../views/stadium/StadiumDetail.vue";
import MatchView from "../views/match/MatchView.vue";
import MatchForm from "../views/match/MatchForm.vue";
import MatchDetail from "../views/match/MatchDetail.vue";

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
            path: "/competitions/:id/info",
            name: "competition-info",
            component: CompetitionDetail,
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
            path: "/organizations/:id/info",
            name: "organization-info",
            component: OrganizationDetail,
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
        {
            path: "/seasons/:id/info",
            name: "season-info",
            component: SeasonDetail,
        },
        {
            path: "/teams",
            name: "teams",
            component: TeamView,
        },
        {
            path: "/teams/new",
            name: "team-create",
            component: TeamForm,
        },
        {
            path: "/teams/:id/edit",
            name: "team-edit",
            component: TeamForm,
        },
        {
            path: "/teams/:id/info",
            name: "team-info",
            component: TeamDetail,
        },
        {
            path: "/stadiums",
            name: "stadiums",
            component: StadiumView,
        },
        {
            path: "/stadiums/new",
            name: "stadium-create",
            component: StadiumForm,
        },
        {
            path: "/stadiums/:id/edit",
            name: "stadium-edit",
            component: StadiumForm,
        },
        {
            path: "/stadiums/:id/info",
            name: "stadium-info",
            component: StadiumDetail,
        },
        {
            path: "/matches",
            name: "matches",
            component: MatchView,
        },
        {
            path: "/matches/new",
            name: "match-create",
            component: MatchForm,
        },
        {
            path: "/matches/:id/edit",
            name: "match-edit",
            component: MatchForm,
        },
        {
            path: "/matches/:id/info",
            name: "match-info",
            component: MatchDetail,
        }
    ],
});

export default router;
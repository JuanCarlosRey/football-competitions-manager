import { defineStore } from "pinia";
import { ref } from "vue";
import type { Competition } from "../types/competition";
import { getCompetitions } from "../services/competition.service";

export const useCompetitionStore = defineStore("competition", () => {
    const competitions = ref<Competition[]>([]);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    async function fetchCompetitions() {
        loading.value = true;
        error.value = null;
        try {
            competitions.value = await getCompetitions();
        } catch (err) {
            console.error(err);
            error.value = "Error al cargar las competiciones";
        } finally {
            loading.value = false;
        }
    }

    return {
        competitions,
        loading,
        error,
        fetchCompetitions,
    };
});
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
    Competition,
    CreateCompetitionDTO,
    UpdateCompetitionDTO
} from '../types/competition';
import { competitionService } from '../services/competition.service';

export const useCompetitionStore = defineStore('competition', () => {
    const competitions = ref<Competition[]>([]);
    const currentCompetition = ref<Competition | null>(null);
    const isLoading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const totalCompetitions = computed(() => competitions.value.length);
    const getCompetitionByIdFromState = computed(() => {
        return (id: number) => competitions.value.find((comp) => comp.id === id);
    });

    async function fetchCompetitions() {
        isLoading.value = true;
        error.value = null;
        try {
            competitions.value = await competitionService.getAll();
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al cargar las competiciones';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchCompetitionById(id: number) {
        isLoading.value = true;
        error.value = null;
        try {
            currentCompetition.value = await competitionService.getById(id);
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || `Error al obtener la competición con ID ${id}`;
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function createCompetition(data: CreateCompetitionDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const newComp = await competitionService.create(data);
            competitions.value.push(newComp);
            return newComp;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al crear la competición';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function updateCompetition(id: number, data: UpdateCompetitionDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const updatedComp = await competitionService.update(id, data);
            const index = competitions.value.findIndex((comp) => comp.id === id);
            if (index !== -1) {
                competitions.value[index] = updatedComp;
            }
            if (currentCompetition.value?.id === id) {
                currentCompetition.value = updatedComp;
            }
            return updatedComp;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al actualizar la competición';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteCompetition(id: number) {
        isLoading.value = true;
        error.value = null;
        try {
            await competitionService.delete(id);
            competitions.value = competitions.value.filter((comp) => comp.id !== id);
            if (currentCompetition.value?.id === id) {
                currentCompetition.value = null;
            }
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al eliminar la competición';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    function clearError() {
        error.value = null;
    }

    return {
        competitions,
        currentCompetition,
        isLoading,
        error,
        totalCompetitions,
        getCompetitionByIdFromState,
        fetchCompetitions,
        fetchCompetitionById,
        createCompetition,
        updateCompetition,
        deleteCompetition,
        clearError,
    };
});
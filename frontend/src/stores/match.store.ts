import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
    Match,
    CreateMatchDTO,
    UpdateMatchDTO
} from '../types/match';
import { matchService } from '../services/match.service';

export const useMatchStore = defineStore('match', () => {
    const matches = ref<Match[]>([]);
    const currentMatch = ref<Match | null>(null);
    const isLoading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const totalMatches = computed(() => matches.value.length);
    const getMatchByIdFromState = computed(() => {
        return (id: number) => matches.value.find((match) => match.id === id);
    });

    async function fetchMatches() {
        isLoading.value = true;
        error.value = null;
        try {
            matches.value = await matchService.getAll();
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al cargar los partidos';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchMatchById(id: number) {
        isLoading.value = true;
        error.value = null;
        try {
            currentMatch.value = await matchService.getById(id);
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || `Error al obtener el partido con ID ${id}`;
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function createMatch(data: CreateMatchDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const newMatch = await matchService.create(data);
            matches.value.push(newMatch);
            return newMatch;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al crear el partido';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function updateMatch(id: number, data: UpdateMatchDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const updatedMatch = await matchService.update(id, data);
            const index = matches.value.findIndex((match) => match.id === id);
            if (index !== -1) {
                matches.value[index] = updatedMatch;
            }
            if (currentMatch.value?.id === id) {
                currentMatch.value = updatedMatch;
            }
            return updatedMatch;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al actualizar el partido';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteMatch(id: number) {
        isLoading.value = true;
        error.value = null;
        try {
            await matchService.delete(id);
            matches.value = matches.value.filter((match) => match.id !== id);
            if (currentMatch.value?.id === id) {
                currentMatch.value = null;
            }
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al eliminar el partido';
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
        matches,
        currentMatch,
        isLoading,
        error,
        totalMatches,
        getMatchByIdFromState,
        fetchMatches,
        fetchMatchById,
        createMatch,
        updateMatch,
        deleteMatch,
        clearError,
    };
});
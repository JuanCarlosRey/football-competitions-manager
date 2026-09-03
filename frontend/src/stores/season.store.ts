import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
    Season,
    CreateSeasonDTO,
    UpdateSeasonDTO
} from '../types/season';
import { seasonService } from '../services/season.service';

/**
 * Pinia store for managing seasons. This store provides state management for seasons, including fetching, creating, updating, and deleting seasons. It also handles loading states and error messages.
 */
export const useSeasonStore = defineStore('season', () => {
    const seasons = ref<Season[]>([]);
    const currentSeason = ref<Season | null>(null);
    const isLoading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const totalSeasons = computed(() => seasons.value.length);
    const getSeasonByIdFromState = computed(() => {
        return (id: number) => seasons.value.find((season) => season.id === id);
    });

    async function fetchSeasons() {
        isLoading.value = true;
        error.value = null;
        try {
            seasons.value = await seasonService.getAll();
            console.log(seasons.value)
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al cargar las temporadas';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchSeasonById(id: number) {
        isLoading.value = true;
        error.value = null;
        try {
            currentSeason.value = await seasonService.getById(id);
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || `Error al obtener la temporada con ID ${id}`;
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function createSeason(data: CreateSeasonDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const newSeason = await seasonService.create(data);
            seasons.value.push(newSeason);
            return newSeason;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al crear la temporada';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function updateSeason(id: number, data: UpdateSeasonDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const updatedSeason = await seasonService.update(id, data);
            const index = seasons.value.findIndex((season) => season.id === id);
            if (index !== -1) {
                seasons.value[index] = updatedSeason;
            }
            if (currentSeason.value?.id === id) {
                currentSeason.value = updatedSeason;
            }
            return updatedSeason;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al actualizar la temporada';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteSeason(id: number) {
        isLoading.value = true;
        error.value = null;
        try {
            await seasonService.delete(id);
            seasons.value = seasons.value.filter((season) => season.id !== id);
            if (currentSeason.value?.id === id) {
                currentSeason.value = null;
            }
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al eliminar la temporada';
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
        seasons,
        currentSeason,
        isLoading,
        error,
        totalSeasons,
        getSeasonByIdFromState,
        fetchSeasons,
        fetchSeasonById,
        createSeason,
        updateSeason,
        deleteSeason,
        clearError,
    };
});
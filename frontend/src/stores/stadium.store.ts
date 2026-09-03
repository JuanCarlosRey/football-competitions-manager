import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
    Stadium,
    CreateStadiumDTO,
    UpdateStadiumDTO
} from '../types/stadium';
import { stadiumService } from '../services/stadium.service';

/**
 * Pinia store for managing stadiums. This store provides state management for stadiums, including fetching, creating, updating, and deleting stadiums. It also handles loading states and error messages.
 */
export const useStadiumStore = defineStore('stadium', () => {
    const stadiums = ref<Stadium[]>([]);
    const currentStadium = ref<Stadium | null>(null);
    const isLoading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const totalStadiums = computed(() => stadiums.value.length);
    const getStadiumByIdFromState = computed(() => {
        return (id: number) => stadiums.value.find((stadium) => stadium.id === id);
    });

    async function fetchStadiums() {
        isLoading.value = true;
        error.value = null;
        try {
            stadiums.value = await stadiumService.getAll();
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al cargar los estadios';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchStadiumById(id: number) {
        isLoading.value = true;
        error.value = null;
        try {
            currentStadium.value = await stadiumService.getById(id);
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || `Error al obtener el estadio con ID ${id}`;
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function createStadium(data: CreateStadiumDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const newStadium = await stadiumService.create(data);
            stadiums.value.push(newStadium);
            return newStadium;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al crear el estadio';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function updateStadium(id: number, data: UpdateStadiumDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const updatedStadium = await stadiumService.update(id, data);
            const index = stadiums.value.findIndex((stadium) => stadium.id === id);
            if (index !== -1) {
                stadiums.value[index] = updatedStadium;
            }
            if (currentStadium.value?.id === id) {
                currentStadium.value = updatedStadium;
            }
            return updatedStadium;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al actualizar el estadio';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteStadium(id: number) {
        isLoading.value = true;
        error.value = null;
        try {
            await stadiumService.delete(id);
            stadiums.value = stadiums.value.filter((stadium) => stadium.id !== id);
            if (currentStadium.value?.id === id) {
                currentStadium.value = null;
            }
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al eliminar el estadio';
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
        stadiums,
        currentStadium,
        isLoading,
        error,
        totalStadiums,
        getStadiumByIdFromState,
        fetchStadiums,
        fetchStadiumById,
        createStadium,
        updateStadium,
        deleteStadium,
        clearError,
    };
});
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
    Player,
    CreatePlayerDTO,
    UpdatePlayerDTO
} from '../types/player';
import { playerService } from '../services/player.service';

/**
 * Pinia store for managing players. This store provides state management for players, including fetching, creating, updating, and deleting players. It also handles loading states and error messages.
 */
export const usePlayerStore = defineStore('player', () => {
    const players = ref<Player[]>([]);
    const currentPlayer = ref<Player | null>(null);
    const isLoading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const totalPlayers = computed(() => players.value.length);
    const getPlayerByIdFromState = computed(() => {
        return (id: number) => players.value.find((player) => player.id === id);
    });

    async function fetchPlayers() {
        isLoading.value = true;
        error.value = null;
        try {
            players.value = await playerService.getAll();
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al cargar los jugadores';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchPlayerById(id: number) {
        isLoading.value = true;
        error.value = null;
        try {
            currentPlayer.value = await playerService.getById(id);
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || `Error al obtener el jugador con ID ${id}`;
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function createPlayer(data: CreatePlayerDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const newPlayer = await playerService.create(data);
            players.value.push(newPlayer);
            return newPlayer;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al crear el jugador';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function updatePlayer(id: number, data: UpdatePlayerDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const updatedPlayer = await playerService.update(id, data);
            const index = players.value.findIndex((player) => player.id === id);
            if (index !== -1) {
                players.value[index] = updatedPlayer;
            }
            if (currentPlayer.value?.id === id) {
                currentPlayer.value = updatedPlayer;
            }
            return updatedPlayer;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al actualizar el jugador';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function deletePlayer(id: number) {
        isLoading.value = true;
        error.value = null;
        try {
            await playerService.delete(id);
            players.value = players.value.filter((player) => player.id !== id);
            if (currentPlayer.value?.id === id) {
                currentPlayer.value = null;
            }
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al eliminar el jugador';
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
        players,
        currentPlayer,
        isLoading,
        error,
        totalPlayers,
        getPlayerByIdFromState,
        fetchPlayers,
        fetchPlayerById,
        createPlayer,
        updatePlayer,
        deletePlayer,
        clearError,
    };
});
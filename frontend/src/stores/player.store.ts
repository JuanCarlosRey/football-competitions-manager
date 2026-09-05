import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
    Player,
    CreatePlayerDTO,
    UpdatePlayerDTO,
    PlayerCareerItem,
    TeamPlayerRelation,
    AddPlayerToTeamDTO,
    UpdatePlayerTeamDatesDTO,
} from '../types/player';
import { playerService } from '../services/player.service';

/**
 * Pinia store for managing players and team assignments.
 * Handles state for players, career histories, team rosters, loading states, and error handling.
 */
export const usePlayerStore = defineStore('player', () => {
    const players = ref<Player[]>([]);
    const currentPlayer = ref<Player | null>(null);
    const careerHistory = ref<PlayerCareerItem[]>([]);
    const teamPlayers = ref<TeamPlayerRelation[]>([]);
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

    async function fetchPlayerCareer(id: number) {
        isLoading.value = true;
        error.value = null;
        try {
            careerHistory.value = await playerService.getCareer(id);
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || `Error al obtener el historial del jugador con ID ${id}`;
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchPlayersByTeam(teamId: number) {
        isLoading.value = true;
        error.value = null;
        try {
            teamPlayers.value = await playerService.getPlayersByTeam(teamId);
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || `Error al obtener la plantilla del equipo ${teamId}`;
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function addPlayerToTeam(teamId: number, data: AddPlayerToTeamDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const newRelation = await playerService.addToTeam(teamId, data);
            teamPlayers.value.push(newRelation);
            return newRelation;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al vincular el jugador al equipo';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function updateTeamContract(teamId: number, playerId: number, data: UpdatePlayerTeamDatesDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const updatedRelation = await playerService.updateTeamContract(teamId, playerId, data);
            const index = teamPlayers.value.findIndex(
                (rel) => rel.teamId === teamId && rel.playerId === playerId
            );
            if (index !== -1) {
                teamPlayers.value[index] = updatedRelation;
            }
            return updatedRelation;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al actualizar el contrato del jugador';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function removePlayerFromTeam(teamId: number, playerId: number) {
        isLoading.value = true;
        error.value = null;
        try {
            await playerService.removeFromTeam(teamId, playerId);
            teamPlayers.value = teamPlayers.value.filter(
                (rel) => !(rel.teamId === teamId && rel.playerId === playerId)
            );
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al desvincular el jugador del equipo';
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
        careerHistory,
        teamPlayers,
        isLoading,
        error,
        totalPlayers,
        getPlayerByIdFromState,
        fetchPlayers,
        fetchPlayerById,
        createPlayer,
        updatePlayer,
        deletePlayer,
        fetchPlayerCareer,
        fetchPlayersByTeam,
        addPlayerToTeam,
        updateTeamContract,
        removePlayerFromTeam,
        clearError,
    };
});
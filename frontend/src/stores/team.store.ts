import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
    Team,
    CreateTeamDTO,
    UpdateTeamDTO
} from '../types/team';
import { teamService } from '../services/team.service';

/**
 * Pinia store for managing teams. This store provides state management for teams, including fetching, creating, updating, and deleting teams. It also handles loading states and error messages.
 */
export const useTeamStore = defineStore('team', () => {
    const teams = ref<Team[]>([]);
    const currentTeam = ref<Team | null>(null);
    const isLoading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const totalTeams = computed(() => teams.value.length);
    const getTeamByIdFromState = computed(() => {
        return (id: number) => teams.value.find((team) => team.id === id);
    });

    async function fetchTeams() {
        isLoading.value = true;
        error.value = null;
        try {
            teams.value = await teamService.getAll();
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al cargar los equipos';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchTeamById(id: number) {
        isLoading.value = true;
        error.value = null;
        try {
            currentTeam.value = await teamService.getById(id);
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || `Error al obtener el equipo con ID ${id}`;
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function createTeam(data: CreateTeamDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const newTeam = await teamService.create(data);
            teams.value.push(newTeam);
            return newTeam;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al crear el equipo';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function updateTeam(id: number, data: UpdateTeamDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const updatedTeam = await teamService.update(id, data);
            const index = teams.value.findIndex((team) => team.id === id);
            if (index !== -1) {
                teams.value[index] = updatedTeam;
            }
            if (currentTeam.value?.id === id) {
                currentTeam.value = updatedTeam;
            }
            return updatedTeam;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al actualizar el equipo';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteTeam(id: number) {
        isLoading.value = true;
        error.value = null;
        try {
            await teamService.delete(id);
            teams.value = teams.value.filter((team) => team.id !== id);
            if (currentTeam.value?.id === id) {
                currentTeam.value = null;
            }
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al eliminar el equipo';
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
        teams,
        currentTeam,
        isLoading,
        error,
        totalTeams,
        getTeamByIdFromState,
        fetchTeams,
        fetchTeamById,
        createTeam,
        updateTeam,
        deleteTeam,
        clearError,
    };
});
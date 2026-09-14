import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
    Match,
    CreateMatchDTO,
    UpdateMatchDTO
} from '../types/match';
import type {
    MatchLineup,
    AddTeamLineupDTO,
    UpdateLineupEntryDTO
} from '../types/match-lineup';
import type {
    MatchTeamStats,
    CreateMatchTeamStatsDTO,
    UpdateMatchTeamStatsDTO
} from '../types/match-team-stats';
import { matchService } from '../services/match.service';

/**
 * Pinia store for managing matches, match lineups, and match team statistics.
 */
export const useMatchStore = defineStore('match', () => {
    const matches = ref<Match[]>([]);
    const currentMatch = ref<Match | null>(null);
    const currentLineups = ref<MatchLineup[]>([]);
    const currentStats = ref<MatchTeamStats[]>([]);
    const isLoading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const totalMatches = computed(() => matches.value.length);

    const getMatchByIdFromState = computed(() => {
        return (id: number) => matches.value.find((match) => match.id === id);
    });

    const starters = computed(() => {
        return currentLineups.value.filter((lineup) => lineup.starter);
    });

    const substitutes = computed(() => {
        return currentLineups.value.filter((lineup) => !lineup.starter);
    });

    const getLineupsByTeam = computed(() => {
        return (teamId: number) => currentLineups.value.filter((lineup) => lineup.teamId === teamId);
    });

    const getStatsByTeam = computed(() => {
        return (teamId: number) => currentStats.value.find((stat) => stat.teamId === teamId);
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
                currentLineups.value = [];
                currentStats.value = [];
            }
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al eliminar el partido';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchLineups(matchId: number) {
        isLoading.value = true;
        error.value = null;
        try {
            currentLineups.value = await matchService.getLineups(matchId);
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al obtener las alineaciones del partido';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function addTeamLineup(matchId: number, data: AddTeamLineupDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const createdEntries = await matchService.addTeamLineup(matchId, data);
            currentLineups.value = [
                ...currentLineups.value.filter((lineup) => lineup.teamId !== data.teamId),
                ...createdEntries,
            ];
            return createdEntries;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al guardar la alineación';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function updateLineupEntry(matchId: number, lineupId: number, data: UpdateLineupEntryDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const updatedEntry = await matchService.updateLineupEntry(matchId, lineupId, data);
            const index = currentLineups.value.findIndex((lineup) => lineup.id === lineupId);
            if (index !== -1) {
                currentLineups.value[index] = updatedEntry;
            }
            return updatedEntry;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al actualizar la entrada de alineación';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function removeLineupEntry(matchId: number, lineupId: number) {
        isLoading.value = true;
        error.value = null;
        try {
            await matchService.removeLineupEntry(matchId, lineupId);
            currentLineups.value = currentLineups.value.filter((lineup) => lineup.id !== lineupId);
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al eliminar el jugador de la alineación';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchStats(matchId: number) {
        isLoading.value = true;
        error.value = null;
        try {
            currentStats.value = await matchService.getStats(matchId);
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al obtener las estadísticas del partido';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function addTeamStats(matchId: number, data: CreateMatchTeamStatsDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const newStats = await matchService.addTeamStats(matchId, data);
            const index = currentStats.value.findIndex((s) => s.teamId === data.teamId);
            if (index !== -1) {
                currentStats.value[index] = newStats;
            } else {
                currentStats.value.push(newStats);
            }
            return newStats;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al guardar las estadísticas del equipo';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function updateTeamStats(matchId: number, statId: number, data: UpdateMatchTeamStatsDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const updatedStats = await matchService.updateTeamStats(matchId, statId, data);
            const index = currentStats.value.findIndex((s) => s.id === statId);
            if (index !== -1) {
                currentStats.value[index] = updatedStats;
            }
            return updatedStats;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al actualizar las estadísticas del equipo';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function removeTeamStats(matchId: number, statId: number) {
        isLoading.value = true;
        error.value = null;
        try {
            await matchService.removeTeamStats(matchId, statId);
            currentStats.value = currentStats.value.filter((s) => s.id !== statId);
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al eliminar las estadísticas del equipo';
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
        currentLineups,
        currentStats,
        isLoading,
        error,
        totalMatches,
        getMatchByIdFromState,
        starters,
        substitutes,
        getLineupsByTeam,
        getStatsByTeam,
        fetchMatches,
        fetchMatchById,
        createMatch,
        updateMatch,
        deleteMatch,
        fetchLineups,
        addTeamLineup,
        updateLineupEntry,
        removeLineupEntry,
        fetchStats,
        addTeamStats,
        updateTeamStats,
        removeTeamStats,
        clearError,
    };
});
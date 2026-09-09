<template>
  <div class="form-container">
    <header class="header">
      <h1>{{ isEditing ? "Editar Alineación" : "Nueva Alineación" }}</h1>
      <button class="btn btn-secondary" @click="handleCancel">Cancelar</button>
    </header>
    <div v-if="error" class="alert alert-danger">
      <span>{{ error }}</span>
      <button class="btn-close" @click="error = null">✕</button>
    </div>
    <form @submit.prevent="handleSubmit" class="form-card">
      <div class="form-group">
        <label for="teamId">Equipo *</label>
        <select
          id="teamId"
          v-model.number="selectedTeamId"
          class="form-control"
          :disabled="isEditing"
          @change="onTeamChange"
          required
        >
          <option :value="null" disabled>Selecciona un equipo</option>
          <option v-if="currentMatch?.homeTeam" :value="currentMatch.homeTeam.id">
            {{ currentMatch.homeTeam.name }} (Local)
          </option>
          <option v-if="currentMatch?.awayTeam" :value="currentMatch.awayTeam.id">
            {{ currentMatch.awayTeam.name }} (Visitante)
          </option>
        </select>
      </div>
      <div v-if="selectedTeamId" class="players-section">
        <div class="players-header">
          <h3>Convocatoria y Posiciones</h3>
          <span
            class="badge"
            :class="startersCount === 11 ? 'badge-success' : 'badge-warning'"
          >
            Titulares: {{ startersCount }}/11
          </span>
        </div>
        <p class="section-help">
          Marca los jugadores que formarán parte de la convocatoria, especifica su dorsal,
          posición y si salen de inicio.
        </p>
        <div v-if="playerStore.isLoading" class="loading-state">
          <span class="spinner-sm dark"></span> Cargando plantilla de jugadores...
        </div>
        <div v-else-if="teamPlayers.length === 0" class="empty-state">
          No hay jugadores registrados en la plantilla de este equipo.
        </div>
        <div v-else class="players-list">
          <div
            v-for="player in teamPlayers"
            :key="player.id"
            class="player-item-card"
            :class="{ selected: isPlayerSelected(player.id) }"
          >
            <div class="player-toggle">
              <input
                type="checkbox"
                :id="`player-${player.id}`"
                :checked="isPlayerSelected(player.id)"
                @change="togglePlayerSelection(player)"
                class="checkbox-control"
              />
              <label :for="`player-${player.id}`" class="player-name">
                {{ player.firstName }} {{ player.lastName }}
              </label>
            </div>
            <div v-if="isPlayerSelected(player.id)" class="player-fields">
              <div class="field-group">
                <label>Rol</label>
                <select
                  v-model="getPlayerEntry(player.id)!.starter"
                  class="form-control form-control-sm"
                >
                  <option :value="true">Titular</option>
                  <option :value="false">Suplente</option>
                </select>
              </div>
              <div class="field-group">
                <label>Dorsal</label>
                <input
                  type="number"
                  v-model.number="getPlayerEntry(player.id)!.shirtNumber"
                  class="form-control form-control-sm shirt-input"
                  min="1"
                  max="99"
                  placeholder="#"
                />
              </div>
              <div class="field-group">
                <label>Posición</label>
                <select
                  v-model="getPlayerEntry(player.id)!.position"
                  class="form-control form-control-sm"
                >
                  <option value="GOALKEEPER">Portero</option>
                  <option value="DEFENDER">Defensa</option>
                  <option value="MIDFIELDER">Centrocampista</option>
                  <option value="FORWARD">Delantero</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="handleCancel"
          :disabled="isSubmitting"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isSubmitting || !selectedTeamId"
        >
          <span v-if="isSubmitting" class="spinner-sm"></span>
          <span>{{ isEditing ? "Guardar Cambios" : "Guardar Alineación" }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 750px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.form-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-control {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
  background-color: #ffffff;
}

.form-control-sm {
  padding: 0.375rem 0.5rem;
  font-size: 0.875rem;
}

.form-control:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.players-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.players-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.players-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #1f2937;
}

.section-help {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.badge {
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-warning {
  background-color: #fef3c7;
  color: #92400e;
}

.badge-success {
  background-color: #d1fae5;
  color: #065f46;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 480px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.player-item-card {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: background-color 0.15s, border-color 0.15s;
}

.player-item-card.selected {
  background-color: #f0fdf4;
  border-color: #86efac;
}

.player-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.checkbox-control {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
}

.player-name {
  font-weight: 600;
  color: #1f2937;
  cursor: pointer;
}

.player-fields {
  display: grid;
  grid-template-columns: 1fr 80px 1fr;
  gap: 0.75rem;
  background-color: #ffffff;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

@media (max-width: 540px) {
  .player-fields {
    grid-template-columns: 1fr;
  }
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-group label {
  font-size: 0.75rem;
  color: #4b5563;
  font-weight: 500;
}

.shirt-input {
  text-align: center;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 1.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}
.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}
.btn-secondary:hover:not(:disabled) {
  background-color: #d1d5db;
}

.alert {
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-danger {
  background-color: #fee2e2;
  color: #991b1b;
}

.btn-close {
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  font-size: 1rem;
}

.spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-sm.dark {
  border-color: #374151;
  border-top-color: transparent;
  display: inline-block;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMatchStore } from "../../stores/match.store";
import { usePlayerStore } from "../../stores/player.store";
import type { LineupPlayerInput } from "../../types/match-lineup";
import type { Player } from "../../types/player";

const route = useRoute();
const router = useRouter();

const matchStore = useMatchStore();
const playerStore = usePlayerStore();

const matchId = computed(() => {
  const id = route.params.id;
  return id ? Number(id) : null;
});

const currentMatch = computed(() => matchStore.currentMatch);

const selectedTeamId = ref<number | null>(null);
const isEditing = ref<boolean>(false);
const error = ref<string | null>(null);

const selectedPlayers = reactive<Map<number, LineupPlayerInput>>(new Map());

const isSubmitting = computed(() => {
  return matchStore.isLoading || playerStore.isLoading;
});

const teamPlayers = computed(() => {
  if (!selectedTeamId.value) return [];
  const matchDateRaw = currentMatch.value?.dateTime;
  const matchDate = matchDateRaw ? new Date(matchDateRaw) : null;
  return playerStore.teamPlayers
    .filter((teamPlayer) => {
      if (!teamPlayer.player) return false;
      if (!matchDate) return true;
      const startDateRaw = teamPlayer.startDate;
      if (startDateRaw) {
        const startDate = new Date(startDateRaw);
        if (startDate > matchDate) {
          return false;
        }
      }
      const endDateRaw = teamPlayer.endDate;
      if (endDateRaw) {
        const endDate = new Date(endDateRaw);
        if (endDate < matchDate) {
          return false;
        }
      }
      return true;
    })
    .map((teamPlayer) => teamPlayer.player)
    .filter((player): player is Player => player !== undefined);
});

const startersCount = computed(() => {
  let count = 0;
  selectedPlayers.forEach((entry) => {
    if (entry.starter) count++;
  });
  return count;
});

onMounted(async () => {
  if (!matchId.value) {
    error.value = "ID de partido no proporcionado.";
    return;
  }
  await Promise.all([
    matchStore.fetchMatchById(matchId.value),
    matchStore.fetchLineups(matchId.value),
  ]);
  const queryTeamId = route.query.teamId ? Number(route.query.teamId) : null;
  if (queryTeamId) {
    selectedTeamId.value = queryTeamId;
    await onTeamChange();
  }
});

const onTeamChange = async () => {
  if (!selectedTeamId.value) return;
  if (playerStore.fetchPlayersByTeam) {
    await playerStore.fetchPlayersByTeam(selectedTeamId.value);
  } else {
    await playerStore.fetchPlayers();
  }
  selectedPlayers.clear();
  const existingLineups = matchStore.getLineupsByTeam(selectedTeamId.value);
  if (existingLineups && existingLineups.length > 0) {
    isEditing.value = true;
    existingLineups.forEach((entry) => {
      selectedPlayers.set(entry.playerId, {
        playerId: entry.playerId,
        starter: entry.starter,
        shirtNumber: entry.shirtNumber ?? undefined,
        position: entry.position ?? "MIDFIELDER",
      });
    });
  } else {
    isEditing.value = false;
  }
};

const isPlayerSelected = (playerId: number): boolean => {
  return selectedPlayers.has(playerId);
};

const getPlayerEntry = (playerId: number): LineupPlayerInput | undefined => {
  return selectedPlayers.get(playerId);
};

const togglePlayerSelection = (player: Player) => {
  if (selectedPlayers.has(player.id)) {
    selectedPlayers.delete(player.id);
  } else {
    selectedPlayers.set(player.id, {
      playerId: player.id,
      starter: startersCount.value < 11,
      position: player.position ?? "NOT SPECIFIED",
    });
  }
};

const handleSubmit = async () => {
  error.value = null;
  if (!matchId.value || !selectedTeamId.value) {
    error.value = "Selecciona un partido y un equipo válido.";
    return;
  }
  if (selectedPlayers.size === 0) {
    error.value = "Debes seleccionar al menos un jugador para la alineación.";
    return;
  }
  try {
    console.log(isEditing.value);
    if (!isEditing.value) {
      const playersPayload: LineupPlayerInput[] = Array.from(selectedPlayers.values());
      await matchStore.addTeamLineup(matchId.value, {
        teamId: selectedTeamId.value,
        players: playersPayload,
      });
    } else {
      const existingLineups = matchStore.getLineupsByTeam(selectedTeamId.value);
      const existingPlayerMap = new Map<number, number>();
      existingLineups.forEach((lineup) => {
        existingPlayerMap.set(lineup.playerId, lineup.id);
      });
      const updatePromises: Promise<unknown>[] = [];
      const removePromises: Promise<unknown>[] = [];
      const newPlayersToAdd: LineupPlayerInput[] = [];
      selectedPlayers.forEach((entryData, playerId) => {
        const lineupId = existingPlayerMap.get(playerId);
        if (lineupId !== undefined) {
          updatePromises.push(
            matchStore.updateLineupEntry(matchId.value!, lineupId, {
              starter: entryData.starter,
              shirtNumber: entryData.shirtNumber,
              position: entryData.position,
            })
          );
        } else {
          newPlayersToAdd.push(entryData);
        }
      });
      existingLineups.forEach((lineup) => {
        if (!selectedPlayers.has(lineup.playerId)) {
          removePromises.push(matchStore.removeLineupEntry(matchId.value!, lineup.id));
        }
      });
      await Promise.all([...updatePromises, ...removePromises]);
      if (newPlayersToAdd.length > 0) {
        await matchStore.addTeamLineup(matchId.value, {
          teamId: selectedTeamId.value,
          players: newPlayersToAdd,
        });
      }
    }
    router.push(`/matches/${matchId.value}/info`);
  } catch {
    error.value = matchStore.error || "Error al guardar la alineación.";
  }
};

const handleCancel = () => {
  if (matchId.value) {
    router.push(`/matches/${matchId.value}/info`);
  } else {
    router.push("/matches");
  }
};
</script>

<template>
  <div class="form-container">
    <header class="header">
      <h1>
        {{
          isEditing
            ? "Editar Estadísticas de Jugador"
            : "Registrar Estadísticas de Jugador"
        }}
      </h1>
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
      <div v-if="selectedTeamId" class="form-group">
        <label for="playerId">Jugador *</label>
        <select
          id="playerId"
          v-model.number="selectedPlayerId"
          class="form-control"
          :disabled="isEditing"
          @change="onPlayerChange"
          required
        >
          <option :value="null" disabled>Selecciona un jugador</option>
          <option
            v-for="lineup in teamLineups"
            :key="lineup.playerId"
            :value="lineup.playerId"
          >
            #{{ lineup.shirtNumber }} -
            {{
              `${lineup.player?.firstName || ""} ${
                lineup.player?.lastName || ""
              }`.trim() || lineup.playerId
            }}
            <template v-if="lineup.starter"> (Titular)</template>
            <template v-else> (Suplente)</template>
          </option>
        </select>
      </div>
      <div v-if="selectedPlayerId" class="stats-section">
        <div class="stats-header">
          <h3>Métricas Individuales</h3>
        </div>
        <p class="section-help">
          Ingresa el rendimiento estadístico registrado por el jugador durante el partido.
        </p>
        <div class="stats-grid">
          <div class="field-card">
            <label for="goals">Goles Marcados</label>
            <input
              id="goals"
              type="number"
              v-model.number="form.goals"
              class="form-control"
              min="0"
              placeholder="Ej. 1"
            />
          </div>
          <div class="field-card">
            <label for="assists">Asistencias</label>
            <input
              id="assists"
              type="number"
              v-model.number="form.assists"
              class="form-control"
              min="0"
              placeholder="Ej. 1"
            />
          </div>
          <div class="field-card">
            <label for="goalsConceded">Goles Encajados</label>
            <input
              id="goalsConceded"
              type="number"
              v-model.number="form.goalsConceded"
              class="form-control"
              min="0"
              placeholder="Ej. 0"
            />
          </div>
          <div class="field-card">
            <label for="yellowCards">Tarjetas Amarillas</label>
            <input
              id="yellowCards"
              type="number"
              v-model.number="form.yellowCards"
              class="form-control"
              min="0"
              max="2"
              placeholder="Ej. 1"
            />
          </div>
          <div class="field-card">
            <label for="redCards">Tarjetas Rojas</label>
            <input
              id="redCards"
              type="number"
              v-model.number="form.redCards"
              class="form-control"
              min="0"
              max="1"
              placeholder="Ej. 0"
            />
          </div>
          <div class="field-card">
            <label for="rating">Valoración (0 - 10)</label>
            <input
              id="rating"
              type="number"
              v-model.number="form.rating"
              class="form-control"
              min="0"
              max="10"
              step="0.1"
              placeholder="Ej. 7.5"
            />
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
          :disabled="isSubmitting || !selectedPlayerId"
        >
          <span v-if="isSubmitting" class="spinner-sm"></span>
          <span>{{ isEditing ? "Guardar Cambios" : "Guardar Estadísticas" }}</span>
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
  width: 100%;
  box-sizing: border-box;
}

.form-control:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.stats-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stats-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #1f2937;
}

.section-help {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.field-card {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  background-color: #f9fafb;
  padding: 0.875rem;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.field-card label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #4b5563;
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
import type {
  CreateMatchPlayerStatsDTO,
  UpdateMatchPlayerStatsDTO,
} from "../../types/match-player-stats";

const route = useRoute();
const router = useRouter();
const matchStore = useMatchStore();

const matchId = computed(() => {
  const id = route.params.id;
  return id ? Number(id) : null;
});

const currentMatch = computed(() => matchStore.currentMatch);

const selectedTeamId = ref<number | null>(null);
const selectedPlayerId = ref<number | null>(null);
const existingStatId = ref<number | null>(null);
const isEditing = ref<boolean>(false);
const error = ref<string | null>(null);

const form = reactive<CreateMatchPlayerStatsDTO>({
  playerId: 0,
  goals: 0,
  goalsConceded: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  rating: null,
});

const isSubmitting = computed(() => matchStore.isLoading);

const teamLineups = computed(() => {
  if (!selectedTeamId.value) return [];
  return matchStore.getLineupsByTeam(selectedTeamId.value);
});

onMounted(async () => {
  if (!matchId.value) {
    error.value = "ID de partido no proporcionado.";
    return;
  }
  await Promise.all([
    matchStore.fetchMatchById(matchId.value),
    matchStore.fetchLineups(matchId.value),
    matchStore.fetchPlayerStats(matchId.value),
  ]);
  const queryTeamId = route.query.teamId ? Number(route.query.teamId) : null;
  const queryPlayerId = route.query.playerId ? Number(route.query.playerId) : null;
  if (queryTeamId) {
    selectedTeamId.value = queryTeamId;
    if (queryPlayerId) {
      selectedPlayerId.value = queryPlayerId;
      onPlayerChange();
    }
  }
});

const resetForm = () => {
  form.goals = 0;
  form.goalsConceded = 0;
  form.assists = 0;
  form.yellowCards = 0;
  form.redCards = 0;
  form.rating = null;
  existingStatId.value = null;
};

const onTeamChange = () => {
  selectedPlayerId.value = null;
  isEditing.value = false;
  resetForm();
};

const onPlayerChange = () => {
  resetForm();
  if (!selectedPlayerId.value) return;
  form.playerId = selectedPlayerId.value;
  const existingStats = matchStore.getPlayerStatsByPlayer(selectedPlayerId.value);
  if (existingStats) {
    isEditing.value = true;
    existingStatId.value = existingStats.id;
    form.goals = existingStats.goals ?? 0;
    form.goalsConceded = existingStats.goalsConceded ?? 0;
    form.assists = existingStats.assists ?? 0;
    form.yellowCards = existingStats.yellowCards ?? 0;
    form.redCards = existingStats.redCards ?? 0;
    form.rating = existingStats.rating ?? null;
  } else {
    isEditing.value = false;
  }
};

const handleSubmit = async () => {
  error.value = null;
  if (!matchId.value || !selectedPlayerId.value) {
    error.value = "Selecciona un partido y un jugador válido.";
    return;
  }
  try {
    if (!isEditing.value) {
      await matchStore.addPlayerStats(matchId.value, {
        ...form,
        playerId: selectedPlayerId.value,
      });
    } else if (existingStatId.value) {
      const updatePayload: UpdateMatchPlayerStatsDTO = {
        goals: form.goals,
        goalsConceded: form.goalsConceded,
        assists: form.assists,
        yellowCards: form.yellowCards,
        redCards: form.redCards,
        rating: form.rating,
      };
      await matchStore.updatePlayerStats(
        matchId.value,
        existingStatId.value,
        updatePayload
      );
    }
    router.push(`/matches/${matchId.value}/info`);
  } catch {
    error.value = matchStore.error || "Error al guardar las estadísticas del jugador.";
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

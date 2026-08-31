<template>
  <div class="form-container">
    <header class="header">
      <h1>{{ isEditing ? "Editar Partido" : "Nuevo Partido" }}</h1>
      <button class="btn btn-secondary" @click="handleCancel">Cancelar</button>
    </header>
    <div v-if="error" class="alert alert-danger">
      <span>{{ error }}</span>
      <button class="btn-close" @click="error = null">✕</button>
    </div>
    <form @submit.prevent="handleSubmit" class="form-card">
      <div class="form-group">
        <label for="dateTime">Fecha y Hora *</label>
        <input
          id="dateTime"
          v-model="formData.dateTime"
          type="datetime-local"
          class="form-control"
          required
        />
      </div>
      <div class="form-group">
        <label for="status">Estado *</label>
        <select id="status" v-model="formData.status" class="form-control" required>
          <option value="SCHEDULED">Programado (SCHEDULED)</option>
          <option value="LIVE">En curso (LIVE)</option>
          <option value="FINISHED">Finalizado (FINISHED)</option>
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="homeTeamId">Equipo Local *</label>
          <select
            id="homeTeamId"
            v-model.number="formData.homeTeamId"
            class="form-control"
            required
          >
            <option :value="null" disabled>Selecciona un equipo local</option>
            <option v-for="team in teamStore.teams" :key="team.id" :value="team.id">
              {{ team.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="awayTeamId">Equipo Visitante *</label>
          <select
            id="awayTeamId"
            v-model.number="formData.awayTeamId"
            class="form-control"
            required
          >
            <option :value="null" disabled>Selecciona un equipo visitante</option>
            <option v-for="team in teamStore.teams" :key="team.id" :value="team.id">
              {{ team.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="stadiumId">Estadio *</label>
          <select
            id="stadiumId"
            v-model.number="formData.stadiumId"
            class="form-control"
            required
          >
            <option :value="null" disabled>Selecciona un estadio</option>
            <option
              v-for="stadium in stadiumStore.stadiums"
              :key="stadium.id"
              :value="stadium.id"
            >
              {{ stadium.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="seasonId">Temporada *</label>
          <select
            id="seasonId"
            v-model.number="formData.seasonId"
            class="form-control"
            required
          >
            <option :value="null" disabled>Selecciona una temporada</option>
            <option
              v-for="season in seasonStore.seasons"
              :key="season.id"
              :value="season.id"
            >
              {{ season.startDate.slice(0, 4) }}/{{ season.endDate.slice(0, 4) }} ({{ season.competition?.name || `Competición #${season.competitionId}` }})
            </option>
          </select>
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
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-sm"></span>
          <span>{{ isEditing ? "Guardar Cambios" : "Crear Partido" }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 600px;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }
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

.form-control:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
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
import { useTeamStore } from "../../stores/team.store";
import { useStadiumStore } from "../../stores/stadium.store";
import { useSeasonStore } from "../../stores/season.store";
import type { MatchStatus } from "../../types/match";

const route = useRoute();
const router = useRouter();

const matchStore = useMatchStore();
const teamStore = useTeamStore();
const stadiumStore = useStadiumStore();
const seasonStore = useSeasonStore();

const matchId = computed(() => {
  const id = route.params.id;
  return id ? Number(id) : null;
});

const isEditing = computed(() => !!matchId.value);
const error = ref<string | null>(null);

const isSubmitting = computed(() => {
  return (
    matchStore.isLoading ||
    teamStore.isLoading ||
    stadiumStore.isLoading ||
    seasonStore.isLoading
  );
});

const formData = reactive<{
  dateTime: string;
  status: MatchStatus;
  homeTeamId: number | null;
  awayTeamId: number | null;
  stadiumId: number | null;
  seasonId: number | null;
}>({
  dateTime: "",
  status: "SCHEDULED",
  homeTeamId: null,
  awayTeamId: null,
  stadiumId: null,
  seasonId: null,
});

const formatISOToDatetimeLocal = (isoString: string): string => {
  const date = new Date(isoString);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

onMounted(async () => {
  await Promise.all([
    teamStore.fetchTeams(),
    stadiumStore.fetchStadiums(),
    seasonStore.fetchSeasons(),
  ]);

  if (isEditing.value && matchId.value) {
    await matchStore.fetchMatchById(matchId.value);
    const match = matchStore.currentMatch;
    if (match) {
      formData.dateTime = formatISOToDatetimeLocal(match.dateTime);
      formData.status = match.status;
      formData.homeTeamId = match.homeTeamId;
      formData.awayTeamId = match.awayTeamId;
      formData.stadiumId = match.stadiumId;
      formData.seasonId = match.seasonId;
    } else {
      error.value = "No se encontró el partido especificado";
    }
  }
});

const handleSubmit = async () => {
  error.value = null;

  if (
    !formData.dateTime ||
    !formData.status ||
    !formData.homeTeamId ||
    !formData.awayTeamId ||
    !formData.stadiumId ||
    !formData.seasonId
  ) {
    error.value = "Por favor, completa todos los campos requeridos.";
    return;
  }

  if (formData.homeTeamId === formData.awayTeamId) {
    error.value = "El equipo local y el equipo visitante no pueden ser el mismo.";
    return;
  }

  try {
    const payload = {
      dateTime: new Date(formData.dateTime).toISOString(),
      status: formData.status,
      homeTeamId: Number(formData.homeTeamId),
      awayTeamId: Number(formData.awayTeamId),
      stadiumId: Number(formData.stadiumId),
      seasonId: Number(formData.seasonId),
    };

    if (isEditing.value && matchId.value) {
      await matchStore.updateMatch(matchId.value, payload);
    } else {
      await matchStore.createMatch(payload);
    }
    router.push("/matches");
  } catch {
    error.value = matchStore.error || "Ocurrió un error al guardar el partido.";
  }
};

const handleCancel = () => {
  router.push("/matches");
};
</script>

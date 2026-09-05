<template>
  <div class="transfer-container">
    <header class="header">
      <h1>Traspaso de Jugador</h1>
      <button class="btn btn-secondary" @click="handleCancel">Cancelar</button>
    </header>
    <div v-if="playerStore.error || customError" class="alert alert-danger">
      <span>{{ customError || playerStore.error }}</span>
      <button class="btn-close" @click="clearErrors">✕</button>
    </div>
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando información requerida...</p>
    </div>
    <form v-else @submit.prevent="handleTransfer" class="form-card">
      <div class="player-summary" v-if="playerStore.currentPlayer">
        <h2>
          {{ playerStore.currentPlayer.firstName }}
          {{ playerStore.currentPlayer.lastName }}
        </h2>
        <div class="summary-details">
          <span><strong>Posición:</strong> {{ playerStore.currentPlayer.position }}</span>
          <span><strong>Media:</strong> {{ playerStore.currentPlayer.overall }}</span>
          <span
            ><strong>Nacionalidad:</strong>
            {{ playerStore.currentPlayer.nationality }}</span
          >
        </div>
      </div>
      <div class="form-group">
        <label for="newTeamId">Nuevo Equipo Destino *</label>
        <select id="newTeamId" v-model="targetTeamId" class="form-control" required>
          <option :value="null" disabled>Selecciona el nuevo equipo</option>
          <option v-for="team in teamStore.teams" :key="team.id" :value="team.id">
            {{ team.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="startDate">Fecha de Traspaso / Inicio *</label>
        <input
          id="startDate"
          v-model="startDate"
          type="date"
          class="form-control"
          required
        />
      </div>
      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="handleCancel"
          :disabled="playerStore.isLoading"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="playerStore.isLoading || !targetTeamId"
        >
          <span v-if="playerStore.isLoading" class="spinner-sm"></span>
          <span>Confirmar Traspaso</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePlayerStore } from "../../stores/player.store";
import { useTeamStore } from "../../stores/team.store";

const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();
const teamStore = useTeamStore();

const playerId = Number(route.params.id);

const targetTeamId = ref<number | null>(null);
const startDate = ref<string>(new Date().toISOString().split("T")[0]);

const loading = ref(true);
const customError = ref<string | null>(null);

onMounted(async () => {
  try {
    loading.value = true;
    playerStore.clearError();
    await Promise.all([playerStore.fetchPlayerById(playerId), teamStore.fetchTeams()]);
  } catch {
    customError.value = "Error al cargar los datos del traspaso.";
  } finally {
    loading.value = false;
  }
});

const clearErrors = () => {
  customError.value = null;
  playerStore.clearError();
};

const handleTransfer = async () => {
  clearErrors();
  if (!targetTeamId.value) {
    customError.value = "Debes seleccionar un equipo de destino.";
    return;
  }
  try {
    const newStartDate = new Date(startDate.value);
    const previousEndDate = new Date(newStartDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);
    if (playerStore.currentPlayer?.currentTeam) {
      const currentTeamId =
        typeof playerStore.currentPlayer.currentTeam === "object"
          ? playerStore.currentPlayer.currentTeam.id
          : Number(playerStore.currentPlayer.currentTeam);
      await playerStore.updateTeamContract(
        currentTeamId,
        playerId,
        {
          endDate: previousEndDate.toISOString(),
        }
      );
    }
    await playerStore.addPlayerToTeam(targetTeamId.value, {
      playerId,
      startDate: newStartDate.toISOString(),
    });
    await playerStore.fetchPlayers();
    router.push(`/players/${playerId}/info`);
  } catch {
    // El mensaje de error ya lo gestiona playerStore
  }
};

const handleCancel = () => {
  router.push(`/players/${playerId}/info`);
};
</script>

<style scoped>
.transfer-container {
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

.player-summary {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  padding: 1rem;
  border-radius: 6px;
}

.player-summary h2 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #111827;
}

.summary-details {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #4b5563;
  flex-wrap: wrap;
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

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
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

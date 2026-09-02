<template>
  <div class="season-container">
    <header class="header">
      <div class="header-title">
        <button class="btn btn-secondary btn-sm" @click="handleBack">← Volver</button>
        <h1>
          {{ getSeasonTitle() }}
        </h1>
      </div>
      <div v-if="seasonStore.currentSeason" class="actions">
        <button class="btn btn-secondary" @click="handleEdit">Editar</button>
        <button class="btn btn-danger" @click="confirmDelete">Eliminar</button>
      </div>
    </header>
    <div v-if="seasonStore.error" class="alert alert-danger">
      <span>{{ seasonStore.error }}</span>
      <button class="btn-close" @click="seasonStore.clearError()">✕</button>
    </div>
    <div v-if="seasonStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando detalles de la temporada...</p>
    </div>
    <div
      v-else-if="!seasonStore.isLoading && !seasonStore.currentSeason"
      class="empty-state"
    >
      <p>No se encontró la información de esta temporada.</p>
    </div>
    <div v-else-if="seasonStore.currentSeason" class="detail-content">
      <div class="info-card">
        <h2>Información General</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">ID</span>
            <span class="value">{{ seasonStore.currentSeason.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">Fecha Inicio</span>
            <span class="value font-bold">{{
              formatDate(seasonStore.currentSeason.startDate)
            }}</span>
          </div>
          <div class="info-item">
            <span class="label">Fecha Fin</span>
            <span class="value font-bold">{{
              formatDate(seasonStore.currentSeason.endDate)
            }}</span>
          </div>
          <div class="info-item">
            <span class="label">Competición</span>
            <span class="value competition-name">
              {{
                seasonStore.currentSeason.competition?.name ||
                `ID Competición: ${seasonStore.currentSeason.competitionId}`
              }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">Total Partidos</span>
            <span class="value">
              <span class="badge">
                {{ seasonStore.currentSeason.matches?.length || 0 }} partidos
              </span>
            </span>
          </div>
        </div>
      </div>
      <div class="table-container">
        <div class="table-header">
          <h2>Partidos de la Temporada</h2>
        </div>
        <div
          v-if="
            !seasonStore.currentSeason.matches ||
            seasonStore.currentSeason.matches.length === 0
          "
          class="empty-state"
        >
          <p>Esta temporada no tiene partidos registrados.</p>
        </div>
        <table v-else class="season-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Encuentro</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="match in seasonStore.currentSeason.matches" :key="match.id">
              <td>{{ match.id }}</td>
              <td>{{ formatDate(match.dateTime) }}</td>
              <td class="font-bold">
                {{ match.homeTeam?.name || `Equipo ${match.homeTeamId}` }} vs
                {{ match.awayTeam?.name || `Equipo ${match.awayTeamId}` }}
              </td>
              <td>
                <span class="badge">
                  {{ match.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.season-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-card h2,
.table-header h2 {
  font-size: 1.25rem;
  color: #111827;
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item .label {
  font-size: 0.875rem;
  color: #6b7280;
}

.info-item .value {
  font-size: 1rem;
  color: #1f2937;
}

.competition-name {
  color: #4b5563;
  font-weight: 500;
}

.table-container {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  padding: 1.5rem 1.5rem 0.5rem 1.5rem;
}

.season-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.season-table th,
.season-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.season-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.font-bold {
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}
.btn-secondary:hover {
  background-color: #d1d5db;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}
.btn-danger:hover {
  background-color: #dc2626;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.badge {
  background-color: #e0e7ff;
  color: #3730a3;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
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

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
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
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSeasonStore } from "../../stores/season.store";

const seasonStore = useSeasonStore();
const route = useRoute();
const router = useRouter();

const seasonId = Number(route.params.id);

onMounted(() => {
  if (seasonId) {
    seasonStore.fetchSeasonById(seasonId);
  }
});

const handleBack = () => {
  router.push("/seasons");
};

const handleEdit = () => {
  router.push(`/seasons/${seasonId}/edit`);
};

const confirmDelete = async () => {
  if (confirm(`¿Estás seguro de que deseas eliminar la temporada con ID ${seasonId}?`)) {
    try {
      await seasonStore.deleteSeason(seasonId);
      router.push("/seasons");
    } catch {
      // El mensaje de error ya se captura e imprime automáticamente en la store
    }
  }
};

const formatDate = (dateString: string | Date): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

const getSeasonTitle = (): string => {
  if (!seasonStore.currentSeason) return "Detalle de Temporada";
  const start = seasonStore.currentSeason.startDate
    ? new Date(seasonStore.currentSeason.startDate).getFullYear()
    : "";
  const end = seasonStore.currentSeason.endDate
    ? new Date(seasonStore.currentSeason.endDate).getFullYear()
    : "";
  return start && end
    ? `Temporada ${start}/${end}`
    : `Temporada #${seasonStore.currentSeason.id}`;
};
</script>
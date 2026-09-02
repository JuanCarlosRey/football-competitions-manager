<template>
  <div class="match-container">
    <header class="header">
      <h1>Partidos</h1>
      <button class="btn btn-primary" @click="handleCreate">+ Nuevo Partido</button>
    </header>
    <div v-if="matchStore.error" class="alert alert-danger">
      <span>{{ matchStore.error }}</span>
      <button class="btn-close" @click="matchStore.clearError()">✕</button>
    </div>
    <div v-if="matchStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando partidos...</p>
    </div>
    <div
      v-else-if="!matchStore.isLoading && matchStore.matches.length === 0"
      class="empty-state"
    >
      <p>No hay partidos registrados.</p>
    </div>
    <div v-else class="table-container">
      <table class="match-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha y Hora</th>
            <th>Local vs Visitante</th>
            <th>Estado</th>
            <th>Estadio</th>
            <th>Temporada</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="match in matchStore.matches" :key="match.id">
            <td>{{ match.id }}</td>
            <td class="font-bold">{{ formatDate(match.dateTime) }}</td>
            <td>
              <div class="teams-matchup">
                <span class="team-name">{{
                  match.homeTeam?.name || `Equipo ${match.homeTeamId}`
                }}</span>
                <span class="vs">vs</span>
                <span class="team-name">{{
                  match.awayTeam?.name || `Equipo ${match.awayTeamId}`
                }}</span>
              </div>
            </td>
            <td>
              <span :class="['badge', getStatusBadgeClass(match.status)]">
                {{ formatStatus(match.status) }}
              </span>
            </td>
            <td>
              <span class="stadium-name">{{
                match.stadium?.name || `Estadio #${match.stadiumId}`
              }}</span>
            </td>
            <td>
              <span class="season-year"
                >{{ match.season?.startDate?.slice(0, 4) }}/{{
                  match.season?.endDate?.slice(0, 4)
                }}
              </span>
            </td>
            <td class="text-right actions">
              <!-- Botón para ver la información detallada -->
              <button class="btn btn-sm btn-info" @click="handleView(match.id)">
                Ver
              </button>
              <button class="btn btn-sm btn-secondary" @click="handleEdit(match.id)">
                Editar
              </button>
              <button class="btn btn-sm btn-danger" @click="confirmDelete(match.id)">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.match-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-container {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.match-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.match-table th,
.match-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

.match-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.font-bold {
  font-weight: 600;
}

.teams-matchup {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.vs {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 700;
  text-transform: uppercase;
}

.team-name {
  color: #111827;
}

.stadium-name,
.season-year {
  color: #4b5563;
  font-weight: 500;
}

.text-right {
  text-align: right;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}
.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-info {
  background-color: #0ea5e9;
  color: white;
}
.btn-info:hover {
  background-color: #0284c7;
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
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-scheduled {
  background-color: #e0e7ff;
  color: #3730a3;
}

.badge-live {
  background-color: #fef3c7;
  color: #92400e;
}

.badge-finished {
  background-color: #d1fae5;
  color: #065f46;
}

.badge-default {
  background-color: #f3f4f6;
  color: #374151;
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
import { useRouter } from "vue-router";
import { useMatchStore } from "../../stores/match.store";
import type { MatchStatus } from "../../types/match";

const matchStore = useMatchStore();
const router = useRouter();

onMounted(() => {
  matchStore.fetchMatches();
});

const handleCreate = () => {
  router.push("/matches/new");
};

const handleView = (id: number) => {
  router.push(`/matches/${id}/info`);
};

const handleEdit = (id: number) => {
  router.push(`/matches/${id}/edit`);
};

const confirmDelete = async (id: number) => {
  if (confirm(`¿Estás seguro de que deseas eliminar el partido con ID ${id}?`)) {
    try {
      await matchStore.deleteMatch(id);
    } catch {
      // El mensaje de error ya se captura e imprime automáticamente en la store
    }
  }
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  } catch {
    return dateString;
  }
};

const formatStatus = (status: MatchStatus): string => {
  const statusLabels: Record<MatchStatus, string> = {
    SCHEDULED: "Programado",
    LIVE: "En vivo",
    FINISHED: "Finalizado",
  };
  return statusLabels[status] || status;
};

const getStatusBadgeClass = (status: MatchStatus): string => {
  const statusClasses: Record<MatchStatus, string> = {
    SCHEDULED: "badge-scheduled",
    LIVE: "badge-live",
    FINISHED: "badge-finished",
  };
  return statusClasses[status] || "badge-default";
};
</script>
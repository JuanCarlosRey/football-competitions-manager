<template>
  <div class="match-container">
    <header class="header">
      <div class="header-title">
        <button class="btn btn-secondary btn-sm" @click="handleBack">← Volver</button>
        <h1>Partido #{{ matchId }}</h1>
      </div>
      <div v-if="matchStore.currentMatch" class="actions">
        <button class="btn btn-secondary" @click="handleEdit">Editar</button>
        <button class="btn btn-danger" @click="confirmDelete">Eliminar</button>
      </div>
    </header>
    <div v-if="matchStore.error" class="alert alert-danger">
      <span>{{ matchStore.error }}</span>
      <button class="btn-close" @click="matchStore.clearError()">✕</button>
    </div>
    <div v-if="matchStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando detalles del partido...</p>
    </div>
    <div
      v-else-if="!matchStore.isLoading && !matchStore.currentMatch"
      class="empty-state"
    >
      <p>No se encontró la información de este partido.</p>
    </div>
    <div v-else-if="matchStore.currentMatch" class="detail-content">
      <div class="scoreboard-card">
        <div class="status-header">
          <span :class="['badge', getStatusBadgeClass(matchStore.currentMatch.status)]">
            {{ formatStatus(matchStore.currentMatch.status) }}
          </span>
          <span class="match-date">{{
            formatDate(matchStore.currentMatch.dateTime)
          }}</span>
        </div>
        <div class="matchup-container">
          <div class="team home-team">
            <span class="team-title">{{
              matchStore.currentMatch.homeTeam?.name ||
              `Equipo ${matchStore.currentMatch.homeTeamId}`
            }}</span>
            <span class="team-label">Local</span>
          </div>
          <div class="score-display">
            <template
              v-if="
                matchStore.currentMatch.status === 'FINISHED' ||
                matchStore.currentMatch.status === 'LIVE'
              "
            >
              <!-- <span class="score">{{ matchStore.currentMatch.homeScore ?? 0 }}</span>
              <span class="score-divider">-</span>
              <span class="score">{{ matchStore.currentMatch.awayScore ?? 0 }}</span> -->
            </template>
            <template v-else>
              <span class="vs-big">VS</span>
            </template>
          </div>
          <div class="team away-team">
            <span class="team-title">{{
              matchStore.currentMatch.awayTeam?.name ||
              `Equipo ${matchStore.currentMatch.awayTeamId}`
            }}</span>
            <span class="team-label">Visitante</span>
          </div>
        </div>
      </div>
      <div class="info-card">
        <h2>Detalles del Evento</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">ID del Partido</span>
            <span class="value">{{ matchStore.currentMatch.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">Estadio / Sede</span>
            <span class="value font-bold">
              {{
                matchStore.currentMatch.stadium?.name ||
                `Estadio #${matchStore.currentMatch.stadiumId}`
              }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">Temporada</span>
            <span class="value">
              {{ matchStore.currentMatch.season?.startDate?.slice(0, 4) }}/{{
                matchStore.currentMatch.season?.endDate?.slice(0, 4)
              }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">Competición</span>
            <span class="value">
              {{ matchStore.currentMatch.season?.competition?.name || "-" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.match-container {
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

/* Tarjeta Marcador / Scoreboard */
.scoreboard-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 2rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 1rem;
}

.match-date {
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: capitalize;
}

.matchup-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
}

.team-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  text-align: center;
}

.team-label {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  font-weight: 600;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.5rem;
}

.score {
  font-size: 2.25rem;
  font-weight: 800;
  color: #1d4ed8;
}

.score-divider {
  font-size: 1.5rem;
  color: #9ca3af;
}

.vs-big {
  font-size: 1.5rem;
  font-weight: 800;
  color: #9ca3af;
}

.info-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-card h2 {
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
import { useRoute, useRouter } from "vue-router";
import { useMatchStore } from "../../stores/match.store";
import type { MatchStatus } from "../../types/match";

const matchStore = useMatchStore();
const route = useRoute();
const router = useRouter();

const matchId = Number(route.params.id);

onMounted(() => {
  if (matchId) {
    matchStore.fetchMatchById(matchId);
  }
});

const handleBack = () => {
  router.push("/matches");
};

const handleEdit = () => {
  router.push(`/matches/${matchId}/edit`);
};

const confirmDelete = async () => {
  if (confirm(`¿Estás seguro de que deseas eliminar el partido con ID ${matchId}?`)) {
    try {
      await matchStore.deleteMatch(matchId);
      router.push("/matches");
    } catch {
      // El mensaje de error se gestiona en la store
    }
  }
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "full",
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

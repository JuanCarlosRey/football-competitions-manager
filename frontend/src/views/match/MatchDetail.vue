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
      <!-- Marcador / Scoreboard -->
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
            <span class="vs-big">VS</span>
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

      <!-- Pestanias compartidas de Equipo -->
      <div class="team-tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTeamTab === 'home' }"
          @click="activeTeamTab = 'home'"
        >
          {{ matchStore.currentMatch.homeTeam?.name || "Local" }}
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTeamTab === 'away' }"
          @click="activeTeamTab = 'away'"
        >
          {{ matchStore.currentMatch.awayTeam?.name || "Visitante" }}
        </button>
      </div>

      <!-- Estadísticas Generales del Equipo -->
      <div class="stats-card">
        <div class="card-header">
          <h2>Estadísticas del Equipo</h2>
          <div class="header-actions" v-if="activeTeamId">
            <button
              class="btn btn-primary btn-sm"
              @click="handleManageStats(activeTeamId)"
            >
              {{ activeTeamStats ? "Editar Estadísticas" : "+ Registrar Estadísticas" }}
            </button>
          </div>
        </div>
        <div class="stats-content">
          <div v-if="!activeTeamStats" class="empty-state-box">
            <p>No hay estadísticas de equipo registradas para este partido.</p>
            <button
              v-if="activeTeamId"
              class="btn btn-secondary btn-sm"
              @click="handleManageStats(activeTeamId)"
            >
              Registrar Estadísticas
            </button>
          </div>
          <div v-else class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Posesión</span>
              <span class="stat-value">{{ activeTeamStats.possession ?? 0 }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Tiros Totales</span>
              <span class="stat-value">{{ activeTeamStats.shots ?? 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Tiros a Puerta</span>
              <span class="stat-value">{{ activeTeamStats.shotsOnTarget ?? 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Córners</span>
              <span class="stat-value">{{ activeTeamStats.corners ?? 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Faltas</span>
              <span class="stat-value">{{ activeTeamStats.fouls ?? 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Tarjetas Amarillas</span>
              <span class="stat-value">{{ activeTeamStats.yellowCards ?? 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Tarjetas Rojas</span>
              <span class="stat-value">{{ activeTeamStats.redCards ?? 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas Individuales de Jugadores -->
      <div class="player-stats-card">
        <div class="card-header">
          <h2>Estadísticas de Jugadores</h2>
          <button
            v-if="activeTeamId"
            class="btn btn-primary btn-sm"
            @click="handleManagePlayerStats(activeTeamId)"
          >
            + Registrar / Editar Jugador
          </button>
        </div>

        <div v-if="activeTeamPlayerStats.length === 0" class="empty-state-box">
          <p>No hay estadísticas de jugadores registradas para este equipo.</p>
          <button
            v-if="activeTeamId"
            class="btn btn-secondary btn-sm"
            @click="handleManagePlayerStats(activeTeamId)"
          >
            Registrar Estadísticas de Jugador
          </button>
        </div>

        <div v-else class="table-wrapper">
          <table class="player-stats-table">
            <thead>
              <tr>
                <th>Jugador</th>
                <th class="text-center">Goles</th>
                <th class="text-center">Asist.</th>
                <th class="text-center">Goles Enc.</th>
                <th class="text-center">T. Amarilla</th>
                <th class="text-center">T. Roja</th>
                <th class="text-center">Valoración</th>
                <th class="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stat in activeTeamPlayerStats" :key="stat.id">
                <td class="font-bold">
                  {{ getPlayerName(stat) }}
                </td>
                <td class="text-center">{{ stat.goals ?? 0 }}</td>
                <td class="text-center">{{ stat.assists ?? 0 }}</td>
                <td class="text-center">{{ stat.goalsConceded ?? 0 }}</td>
                <td class="text-center">
                  <span v-if="stat.yellowCards" class="badge-card card-yellow">
                    {{ stat.yellowCards }}
                  </span>
                  <span v-else>0</span>
                </td>
                <td class="text-center">
                  <span v-if="stat.redCards" class="badge-card card-red">
                    {{ stat.redCards }}
                  </span>
                  <span v-else>0</span>
                </td>
                <td class="text-center font-bold highlight-rating">
                  {{ stat.rating != null ? stat.rating.toFixed(1) : "-" }}
                </td>
                <td class="text-right">
                  <button
                    class="btn btn-link btn-sm"
                    @click="handleEditPlayerStat(stat.playerId)"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Alineaciones -->
      <div class="lineups-card">
        <div class="lineups-header">
          <h2>Alineaciones</h2>
          <button
            v-if="activeTeamId"
            class="btn btn-primary btn-sm"
            @click="handleManageLineup(activeTeamId)"
          >
            {{
              activeTeamLineup.length > 0 ? "Editar Alineación" : "+ Añadir Alineación"
            }}
          </button>
        </div>
        <div class="lineup-content">
          <div v-if="activeTeamLineup.length === 0" class="empty-lineup">
            <p>No se ha registrado alineación para este equipo.</p>
            <button
              v-if="activeTeamId"
              class="btn btn-secondary btn-sm"
              @click="handleManageLineup(activeTeamId)"
            >
              Crear Alineación Ahora
            </button>
          </div>
          <div v-else class="lineup-tables-grid">
            <div class="lineup-section">
              <h3 class="section-subtitle">Titulares ({{ startersList.length }})</h3>
              <div class="table-wrapper">
                <table class="lineup-table">
                  <thead>
                    <tr>
                      <th class="col-num">#</th>
                      <th>Jugador</th>
                      <th>Posición</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="player in startersList" :key="player.id">
                      <td class="col-num font-bold">{{ player.shirtNumber ?? "-" }}</td>
                      <td>
                        {{ player.player?.firstName }} {{ player.player?.lastName }}
                      </td>
                      <td>
                        <span class="position-badge">{{
                          formatPosition(player.position ?? undefined)
                        }}</span>
                      </td>
                    </tr>
                    <tr v-if="startersList.length === 0">
                      <td colspan="3" class="text-muted text-center">
                        Sin titulares definidos
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="lineup-section">
              <h3 class="section-subtitle">Suplentes ({{ substitutesList.length }})</h3>
              <div class="table-wrapper">
                <table class="lineup-table">
                  <thead>
                    <tr>
                      <th class="col-num">#</th>
                      <th>Jugador</th>
                      <th>Posición</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="player in substitutesList" :key="player.id">
                      <td class="col-num font-bold">{{ player.shirtNumber ?? "-" }}</td>
                      <td>
                        {{ player.player?.firstName }} {{ player.player?.lastName }}
                      </td>
                      <td>
                        <span class="position-badge">{{
                          formatPosition(player.position ?? undefined)
                        }}</span>
                      </td>
                    </tr>
                    <tr v-if="substitutesList.length === 0">
                      <td colspan="3" class="text-muted text-center">
                        Sin suplentes definidos
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detalles del Evento -->
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

.vs-big {
  font-size: 1.5rem;
  font-weight: 800;
  color: #9ca3af;
}

/* Pestanias compartidas de Equipo */
.team-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.tab-btn {
  padding: 0.625rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

/* Tarjetas de Contenido General */
.stats-card,
.player-stats-card,
.lineups-card,
.info-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header,
.lineups-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h2,
.lineups-header h2,
.info-card h2 {
  font-size: 1.25rem;
  color: #111827;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.875rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.empty-state-box,
.empty-lineup {
  text-align: center;
  padding: 2rem 1rem;
  background-color: #f9fafb;
  border-radius: 6px;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

/* Tabla de Estadísticas de Jugadores */
.player-stats-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.player-stats-table th,
.player-stats-table td {
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

.player-stats-table th {
  background-color: #f9fafb;
  color: #4b5563;
  font-weight: 600;
  text-align: left;
}

.badge-card {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-weight: 700;
  font-size: 0.75rem;
}

.card-yellow {
  background-color: #fef08a;
  color: #854d0e;
}

.card-red {
  background-color: #fca5a5;
  color: #991b1b;
}

.highlight-rating {
  color: #2563eb;
}

/* Estilos de Alineaciones */
.lineup-tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.section-subtitle {
  font-size: 1rem;
  color: #374151;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.375rem;
}

.table-wrapper {
  overflow-x: auto;
}

.lineup-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.lineup-table th,
.lineup-table td {
  padding: 0.5rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

.lineup-table th {
  background-color: #f9fafb;
  color: #4b5563;
  font-weight: 600;
}

.col-num {
  width: 40px;
  text-align: center;
}

.position-badge {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border-radius: 4px;
  font-size: 0.75rem;
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

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-muted {
  color: #9ca3af;
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

.btn-primary {
  background-color: #2563eb;
  color: white;
}
.btn-primary:hover {
  background-color: #1d4ed8;
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

.btn-link {
  background: none;
  color: #2563eb;
  padding: 0;
  text-decoration: underline;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
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
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMatchStore } from "../../stores/match.store";
import type { MatchStatus } from "../../types/match";
import type { MatchLineup } from "../../types/match-lineup";
import type { MatchPlayerStats } from "../../types/match-player-stats";

const matchStore = useMatchStore();
const route = useRoute();
const router = useRouter();

const matchId = Number(route.params.id);
const activeTeamTab = ref<"home" | "away">("home");

onMounted(async () => {
  if (matchId) {
    await Promise.all([
      matchStore.fetchMatchById(matchId),
      matchStore.fetchLineups(matchId),
      matchStore.fetchStats(matchId),
      matchStore.fetchPlayerStats(matchId),
    ]);
  }
});

const handleBack = () => {
  router.push("/matches");
};

const handleEdit = () => {
  router.push(`/matches/${matchId}/edit`);
};

const handleManageLineup = (teamId: number) => {
  router.push({
    path: `/matches/${matchId}/lineup`,
    query: { teamId },
  });
};

const handleManageStats = (teamId: number) => {
  router.push({
    path: `/matches/${matchId}/stats`,
    query: { teamId },
  });
};

const handleManagePlayerStats = (teamId: number) => {
  router.push({
    path: `/matches/${matchId}/player-stats`,
    query: { teamId },
  });
};

const handleEditPlayerStat = (playerId: number) => {
  if (!activeTeamId.value) return;
  router.push({
    path: `/matches/${matchId}/player-stats`,
    query: { teamId: activeTeamId.value, playerId },
  });
};

const confirmDelete = async () => {
  if (confirm(`¿Estás seguro de que deseas eliminar el partido con ID ${matchId}?`)) {
    try {
      await matchStore.deleteMatch(matchId);
      router.push("/matches");
    } catch {
      // Manejado por la store
    }
  }
};

const activeTeamId = computed(() => {
  if (!matchStore.currentMatch) return null;
  return activeTeamTab.value === "home"
    ? matchStore.currentMatch.homeTeamId
    : matchStore.currentMatch.awayTeamId;
});

const activeTeamLineup = computed<MatchLineup[]>(() => {
  if (!activeTeamId.value) return [];
  return matchStore.getLineupsByTeam(activeTeamId.value);
});

const activeTeamStats = computed(() => {
  if (!activeTeamId.value) return null;
  return matchStore.getStatsByTeam(activeTeamId.value);
});

const activeTeamPlayerStats = computed<MatchPlayerStats[]>(() => {
  if (!activeTeamId.value) return [];
  return matchStore.getPlayerStatsByTeam(activeTeamId.value);
});

const startersList = computed(() => {
  return activeTeamLineup.value.filter((p) => p.starter);
});

const substitutesList = computed(() => {
  return activeTeamLineup.value.filter((p) => !p.starter);
});

const getPlayerName = (stat: MatchPlayerStats): string => {
  if (stat.player) {
    return `${stat.player.firstName} ${stat.player.lastName}`;
  }
  const lineup = activeTeamLineup.value.find((l) => l.playerId === stat.playerId);
  if (lineup?.player) {
    return `${lineup.player.firstName} ${lineup.player.lastName}`;
  }
  return `Jugador #${stat.playerId}`;
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

const formatPosition = (pos?: string): string => {
  if (!pos) return "-";
  const posMap: Record<string, string> = {
    GOALKEEPER: "Portero",
    DEFENDER: "Defensa",
    MIDFIELDER: "Centrocampista",
    FORWARD: "Delantero",
  };
  return posMap[pos] || pos;
};
</script>

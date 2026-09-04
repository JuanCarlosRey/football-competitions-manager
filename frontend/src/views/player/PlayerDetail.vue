<template>
  <div class="player-container">
    <header class="header">
      <div class="header-title">
        <button class="btn btn-secondary btn-sm" @click="handleBack">← Volver</button>
        <h1>
          {{ getPlayerName() }}
        </h1>
      </div>
      <div v-if="playerStore.currentPlayer" class="actions">
        <button class="btn btn-secondary" @click="handleEdit">Editar</button>
        <button class="btn btn-danger" @click="confirmDelete">Eliminar</button>
      </div>
    </header>
    <div v-if="playerStore.error" class="alert alert-danger">
      <span>{{ playerStore.error }}</span>
      <button class="btn-close" @click="playerStore.clearError()">✕</button>
    </div>
    <div v-if="playerStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando detalles del jugador...</p>
    </div>
    <div
      v-else-if="!playerStore.isLoading && !playerStore.currentPlayer"
      class="empty-state"
    >
      <p>No se encontró la información de este jugador.</p>
    </div>
    <div v-else-if="playerStore.currentPlayer" class="detail-content">
      <div class="info-card">
        <h2>Información Personal y Deportiva</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">ID</span>
            <span class="value">{{ playerStore.currentPlayer.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">Nombre Completo</span>
            <span class="value font-bold">
              {{ playerStore.currentPlayer.firstName }}
              {{ playerStore.currentPlayer.lastName }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">Nacionalidad</span>
            <span class="value">{{ playerStore.currentPlayer.nationality }}</span>
          </div>
          <div class="info-item">
            <span class="label">Fecha de Nacimiento</span>
            <span class="value">
              {{ formatDate(playerStore.currentPlayer.birthDate) }}
              <small class="text-muted"
                >({{ calculateAge(playerStore.currentPlayer.birthDate) }} años)</small
              >
            </span>
          </div>
          <div class="info-item">
            <span class="label">Posición</span>
            <span class="value">
              <span class="badge position-badge">{{
                playerStore.currentPlayer.position
              }}</span>
            </span>
          </div>
          <div class="info-item">
            <span class="label">Valoración (Overall)</span>
            <span class="value font-bold">
              <span class="badge overall-badge">{{
                playerStore.currentPlayer.overall
              }}</span>
            </span>
          </div>
          <div class="info-item">
            <span class="label">Pie Preferido</span>
            <span class="value">{{
              translateFoot(playerStore.currentPlayer.preferredFoot)
            }}</span>
          </div>
          <div class="info-item">
            <span class="label">Altura / Peso</span>
            <span class="value">
              {{ playerStore.currentPlayer.height }} m /
              {{ playerStore.currentPlayer.weight }} kg
            </span>
          </div>
          <div class="info-item">
            <span class="label">Valor de Mercado</span>
            <span class="value font-bold text-success">
              {{ formatCurrency(playerStore.currentPlayer.marketValue) }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">Salario Anual</span>
            <span class="value font-bold">
              {{ formatCurrency(playerStore.currentPlayer.annualSalary) }}
            </span>
          </div>
        </div>
      </div>
      <div class="table-container">
        <div class="table-header">
          <h2>Historial de Partidos</h2>
        </div>
        <!-- <div
          v-if="
            !playerStore.currentPlayer.playerStats ||
            playerStore.currentPlayer.playerStats.length === 0
          "
          class="empty-state"
        > -->
        <p>Este jugador no tiene registros de estadísticas en partidos.</p>
        <!-- </div> -->
        <!-- <table v-else class="player-table">
          <thead>
            <tr>
              <th>Partido ID</th>
              <th>Minutos Jugados</th>
              <th>Goles</th>
              <th>Asistencias</th>
              <th>Tarjetas</th>
              <th>Valoración</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stat in playerStore.currentPlayer.playerStats" :key="stat.id">
              <td>#{{ stat.matchId }}</td>
              <td>{{ stat.minutesPlayed }}'</td>
              <td class="font-bold">{{ stat.goals }}</td>
              <td>{{ stat.assists }}</td>
              <td>
                <span v-if="stat.yellowCards" class="card-badge yellow"
                  >{{ stat.yellowCards }} 🟨</span
                >
                <span v-if="stat.redCards" class="card-badge red"
                  >{{ stat.redCards }} 🟥</span
                >
                <span v-if="!stat.yellowCards && !stat.redCards">-</span>
              </td>
              <td>
                <span class="badge">{{ stat.rating ?? "-" }}</span>
              </td>
            </tr>
          </tbody>
        </table> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-container {
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
  gap: 1.25rem;
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

.text-muted {
  color: #9ca3af;
  font-size: 0.875rem;
}

.text-success {
  color: #16a34a;
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

.player-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.player-table th,
.player-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.player-table th {
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

.position-badge {
  background-color: #dbeafe;
  color: #1e40af;
}

.overall-badge {
  background-color: #dcfce7;
  color: #166534;
  font-size: 0.875rem;
}

.card-badge {
  font-size: 0.875rem;
  margin-right: 0.25rem;
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
import { usePlayerStore } from "../../stores/player.store";
import type { PreferredFoot } from "../../types/player";

const playerStore = usePlayerStore();
const route = useRoute();
const router = useRouter();

const playerId = Number(route.params.id);

onMounted(() => {
  if (playerId) {
    playerStore.fetchPlayerById(playerId);
  }
});

const handleBack = () => {
  router.push("/players");
};

const handleEdit = () => {
  router.push(`/players/${playerId}/edit`);
};

const confirmDelete = async () => {
  if (confirm(`¿Estás seguro de que deseas eliminar al jugador con ID ${playerId}?`)) {
    try {
      await playerStore.deletePlayer(playerId);
      router.push("/players");
    } catch {
      // El mensaje de error ya se captura e imprime automáticamente en la store
    }
  }
};

const formatDate = (dateString: string | Date): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

const calculateAge = (birthDate: string | Date): number => {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const translateFoot = (foot: PreferredFoot): string => {
  const footMap: Record<PreferredFoot, string> = {
    RIGHT: "Derecho",
    LEFT: "Izquierdo",
    BOTH: "Ambidextro",
  };
  return footMap[foot] || foot;
};

const getPlayerName = (): string => {
  if (!playerStore.currentPlayer) return "Detalle del Jugador";
  return `${playerStore.currentPlayer.firstName} ${playerStore.currentPlayer.lastName}`;
};
</script>

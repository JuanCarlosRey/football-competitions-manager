<template>
  <div class="player-container">
    <header class="header">
      <h1>Jugadores</h1>
      <button class="btn btn-primary" @click="handleCreate">+ Nuevo Jugador</button>
    </header>

    <div v-if="playerStore.error" class="alert alert-danger">
      <span>{{ playerStore.error }}</span>
      <button class="btn-close" @click="playerStore.clearError()">✕</button>
    </div>

    <div v-if="playerStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando jugadores...</p>
    </div>

    <div
      v-else-if="!playerStore.isLoading && playerStore.players.length === 0"
      class="empty-state"
    >
      <p>No hay jugadores registrados.</p>
    </div>

    <div v-else class="table-container">
      <table class="player-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Posición</th>
            <th>Nacionalidad</th>
            <th>Media</th>
            <th>F. Nacimiento</th>
            <th>Pie</th>
            <th>Valor de Mercado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in playerStore.players" :key="player.id">
            <td>{{ player.id }}</td>
            <td class="font-bold">{{ player.firstName }} {{ player.lastName }}</td>
            <td>
              <span class="badge position-badge">{{ player.position }}</span>
            </td>
            <td>{{ player.nationality }}</td>
            <td>
              <span class="badge overall-badge" :class="getOverallClass(player.overall)">
                {{ player.overall }}
              </span>
            </td>
            <td>{{ formatDate(player.birthDate) }}</td>
            <td>
              <span class="badge foot-badge">{{ player.preferredFoot }}</span>
            </td>
            <td>{{ formatCurrency(player.marketValue) }}</td>
            <td class="text-right actions">
              <button class="btn btn-sm btn-info" @click="handleView(player.id)">
                Ver
              </button>
              <button class="btn btn-sm btn-secondary" @click="handleEdit(player.id)">
                Editar
              </button>
              <button class="btn btn-sm btn-danger" @click="confirmDelete(player.id)">
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
.player-container {
  max-width: 1200px;
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
  overflow-x: auto;
}

.player-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.player-table th,
.player-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.player-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.font-bold {
  font-weight: 600;
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

.position-badge {
  background-color: #e0e7ff;
  color: #3730a3;
}

.foot-badge {
  background-color: #f3f4f6;
  color: #4b5563;
}

.overall-badge {
  color: white;
}

.overall-high {
  background-color: #10b981;
}

.overall-medium {
  background-color: #f59e0b;
}

.overall-low {
  background-color: #6b7280;
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
import { usePlayerStore } from "../../stores/player.store";

const playerStore = usePlayerStore();
const router = useRouter();

onMounted(() => {
  playerStore.fetchPlayers();
});

const handleCreate = () => {
  router.push("/players/new");
};

const handleView = (id: number) => {
  router.push(`/players/${id}/info`);
};

const handleEdit = (id: number) => {
  router.push(`/players/${id}/edit`);
};

const confirmDelete = async (id: number) => {
  if (confirm(`¿Estás seguro de que deseas eliminar al jugador con ID ${id}?`)) {
    try {
      await playerStore.deletePlayer(id);
    } catch {
      // El error es capturado por la store de Pinia
    }
  }
};

const formatDate = (dateString: string | Date): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

const formatCurrency = (amount?: number | null): string => {
  if (amount === undefined || amount === null) return "-";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getOverallClass = (overall: number): string => {
  if (overall >= 85) return "overall-high";
  if (overall >= 75) return "overall-medium";
  return "overall-low";
};
</script>

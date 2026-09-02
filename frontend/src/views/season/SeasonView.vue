<template>
  <div class="season-container">
    <header class="header">
      <h1>Temporadas</h1>
      <button class="btn btn-primary" @click="handleCreate">+ Nueva Temporada</button>
    </header>
    <div v-if="seasonStore.error" class="alert alert-danger">
      <span>{{ seasonStore.error }}</span>
      <button class="btn-close" @click="seasonStore.clearError()">✕</button>
    </div>
    <div v-if="seasonStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando temporadas...</p>
    </div>
    <div
      v-else-if="!seasonStore.isLoading && seasonStore.seasons.length === 0"
      class="empty-state"
    >
      <p>No hay temporadas registradas.</p>
    </div>
    <div v-else class="table-container">
      <table class="season-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Competición</th>
            <th>Partidos</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="season in seasonStore.seasons" :key="season.id">
            <td>{{ season.id }}</td>
            <td class="font-bold">{{ formatDate(season.startDate) }}</td>
            <td class="font-bold">{{ formatDate(season.endDate) }}</td>
            <td>
              <span class="competition-name">
                {{
                  season.competition?.name || `ID Competición: ${season.competitionId}`
                }}
              </span>
            </td>
            <td>
              <span class="badge"> {{ season.matches?.length || 0 }} partidos </span>
            </td>
            <td class="text-right actions">
              <!-- Botón para ver la información detallada -->
              <button class="btn btn-sm btn-info" @click="handleView(season.id)">
                Ver
              </button>
              <button class="btn btn-sm btn-secondary" @click="handleEdit(season.id)">
                Editar
              </button>
              <button class="btn btn-sm btn-danger" @click="confirmDelete(season.id)">
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

.table-container {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.season-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.season-table th,
.season-table td {
  padding: 1rem;
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

.competition-name {
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
import { useRouter } from "vue-router";
import { useSeasonStore } from "../../stores/season.store";

const seasonStore = useSeasonStore();
const router = useRouter();

onMounted(() => {
  seasonStore.fetchSeasons();
});

const handleCreate = () => {
  router.push("/seasons/new");
};

const handleView = (id: number) => {
  router.push(`/seasons/${id}/info`);
};

const handleEdit = (id: number) => {
  router.push(`/seasons/${id}/edit`);
};

const confirmDelete = async (id: number) => {
  if (confirm(`¿Estás seguro de que deseas eliminar la temporada con ID ${id}?`)) {
    try {
      await seasonStore.deleteSeason(id);
    } catch {
      // El mensaje de error ya se captura e imprime automáticamente en la store
    }
  }
};

const formatDate = (dateString: string | Date): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};
</script>
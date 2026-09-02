<template>
  <div class="stadium-container">
    <header class="header">
      <div class="header-title">
        <button class="btn btn-secondary btn-sm" @click="handleBack">← Volver</button>
        <h1>{{ stadiumStore.currentStadium?.name || 'Detalle del Estadio' }}</h1>
      </div>
      <div v-if="stadiumStore.currentStadium" class="actions">
        <button class="btn btn-secondary" @click="handleEdit">Editar</button>
        <button class="btn btn-danger" @click="confirmDelete">Eliminar</button>
      </div>
    </header>
    <div v-if="stadiumStore.error" class="alert alert-danger">
      <span>{{ stadiumStore.error }}</span>
      <button class="btn-close" @click="stadiumStore.clearError()">✕</button>
    </div>
    <div v-if="stadiumStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando detalles del estadio...</p>
    </div>
    <div
      v-else-if="!stadiumStore.isLoading && !stadiumStore.currentStadium"
      class="empty-state"
    >
      <p>No se encontró la información de este estadio.</p>
    </div>
    <div v-else-if="stadiumStore.currentStadium" class="detail-content">
      <div class="info-card">
        <h2>Información General</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">ID</span>
            <span class="value">{{ stadiumStore.currentStadium.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">Nombre</span>
            <span class="value font-bold">{{ stadiumStore.currentStadium.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Capacidad</span>
            <span class="value">
              <span class="badge">
                {{ stadiumStore.currentStadium.capacity?.toLocaleString() }} espectadores
              </span>
            </span>
          </div>
          <div class="info-item span-full">
            <span class="label">Dirección</span>
            <span class="value address-text">{{ stadiumStore.currentStadium.address }}</span>
          </div>
        </div>
      </div>
      <div v-if="stadiumStore.currentStadium.matches && stadiumStore.currentStadium.matches.length > 0" class="table-container">
        <div class="table-header">
          <h2>Próximos Partidos en este Estadio</h2>
        </div>
        <table class="stadium-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Encuentro</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="match in stadiumStore.currentStadium.matches" :key="match.id">
              <td>{{ match.id }}</td>
              <td>{{ formatDate(match.dateTime) }}</td>
              <td class="font-bold">
                {{ match.homeTeam?.name || `Equipo ${match.homeTeamId}` }} vs {{ match.awayTeam?.name || `Equipo ${match.awayTeamId}` }}
              </td>
              <td>
                <span class="badge">{{ match.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stadium-container {
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

.span-full {
  grid-column: 1 / -1;
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

.address-text {
  color: #4b5563;
  font-weight: 500;
}

.teams-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.team-chip {
  background-color: #f3f4f6;
  color: #1f2937;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  border: 1px solid #e5e7eb;
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

.stadium-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.stadium-table th,
.stadium-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.stadium-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
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
  font-weight: 600;
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
import { useStadiumStore } from "../../stores/stadium.store";

const stadiumStore = useStadiumStore();
const route = useRoute();
const router = useRouter();

const stadiumId = Number(route.params.id);

onMounted(() => {
  if (stadiumId) {
    stadiumStore.fetchStadiumById(stadiumId);
  }
});

const handleBack = () => {
  router.push("/stadiums");
};

const handleEdit = () => {
  router.push(`/stadiums/${stadiumId}/edit`);
};

const confirmDelete = async () => {
  if (confirm(`¿Estás seguro de que deseas eliminar el estadio con ID ${stadiumId}?`)) {
    try {
      await stadiumStore.deleteStadium(stadiumId);
      router.push("/stadiums");
    } catch {
      // El mensaje de error se captura en la store
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
</script>
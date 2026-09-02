<template>
  <div class="team-container">
    <header class="header">
      <h1>Equipos</h1>
      <button class="btn btn-primary" @click="handleCreate">+ Nuevo Equipo</button>
    </header>
    <div v-if="teamStore.error" class="alert alert-danger">
      <span>{{ teamStore.error }}</span>
      <button class="btn-close" @click="teamStore.clearError()">✕</button>
    </div>
    <div v-if="teamStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando equipos...</p>
    </div>
    <div
      v-else-if="!teamStore.isLoading && teamStore.teams.length === 0"
      class="empty-state"
    >
      <p>No hay equipos registrados.</p>
    </div>
    <div v-else class="table-container">
      <table class="team-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Escudo</th>
            <th>Nombre</th>
            <th>Abreviatura</th>
            <th>Presidente</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="team in teamStore.teams" :key="team.id">
            <td>{{ team.id }}</td>
            <td>
              <div class="crest-container">
                <img
                  v-if="team.crest"
                  :src="team.crest"
                  :alt="`Escudo de ${team.name}`"
                  class="crest-img"
                />
                <span v-else class="crest-placeholder">-</span>
              </div>
            </td>
            <td class="font-bold">{{ team.name }}</td>
            <td>
              <span class="badge">{{ team.abbreviation }}</span>
            </td>
            <td>
              <span class="president-name">{{ team.president || "-" }}</span>
            </td>
            <td class="text-right actions">
              <button class="btn btn-sm btn-info" @click="handleView(team.id)">
                Ver
              </button>
              <button class="btn btn-sm btn-secondary" @click="handleEdit(team.id)">
                Editar
              </button>
              <button class="btn btn-sm btn-danger" @click="confirmDelete(team.id)">
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
.team-container {
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

.team-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.team-table th,
.team-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

.team-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.font-bold {
  font-weight: 600;
}

.crest-container {
  display: flex;
  align-items: center;
  width: 36px;
  height: 36px;
}

.crest-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.crest-placeholder {
  color: #9ca3af;
}

.president-name {
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
import { useRouter } from "vue-router";
import { useTeamStore } from "../../stores/team.store";

const teamStore = useTeamStore();
const router = useRouter();

onMounted(() => {
  teamStore.fetchTeams();
});

const handleCreate = () => {
  router.push("/teams/new");
};

const handleView = (id: number) => {
  router.push(`/teams/${id}/info`);
};

const handleEdit = (id: number) => {
  router.push(`/teams/${id}/edit`);
};

const confirmDelete = async (id: number) => {
  if (confirm(`¿Estás seguro de que deseas eliminar el equipo con ID ${id}?`)) {
    try {
      await teamStore.deleteTeam(id);
    } catch {
      // El mensaje de error ya se captura e imprime automáticamente en la store
    }
  }
};
</script>

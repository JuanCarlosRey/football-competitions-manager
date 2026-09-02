<template>
  <div class="team-container">
    <header class="header">
      <div class="header-title">
        <button class="btn btn-secondary btn-sm" @click="handleBack">← Volver</button>
        <h1>{{ teamStore.currentTeam?.name || "Detalle del Equipo" }}</h1>
      </div>
      <div v-if="teamStore.currentTeam" class="actions">
        <button class="btn btn-secondary" @click="handleEdit">Editar</button>
        <button class="btn btn-danger" @click="confirmDelete">Eliminar</button>
      </div>
    </header>
    <div v-if="teamStore.error" class="alert alert-danger">
      <span>{{ teamStore.error }}</span>
      <button class="btn-close" @click="teamStore.clearError()">✕</button>
    </div>
    <div v-if="teamStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando detalles del equipo...</p>
    </div>
    <div v-else-if="!teamStore.isLoading && !teamStore.currentTeam" class="empty-state">
      <p>No se encontró la información de este equipo.</p>
    </div>
    <div v-else-if="teamStore.currentTeam" class="detail-content">
      <div class="info-card team-hero">
        <div class="crest-large-container">
          <img
            v-if="teamStore.currentTeam.crest"
            :src="teamStore.currentTeam.crest"
            :alt="`Escudo de ${teamStore.currentTeam.name}`"
            class="crest-large"
          />
          <div v-else class="crest-placeholder-large">
            {{ teamStore.currentTeam.abbreviation || "?" }}
          </div>
        </div>
        <div class="team-header-info">
          <div class="title-row">
            <h2>{{ teamStore.currentTeam.name }}</h2>
            <span class="badge">{{ teamStore.currentTeam.abbreviation }}</span>
          </div>
          <p class="president-text">
            <strong>Presidente:</strong>
            {{ teamStore.currentTeam.president || "No especificado" }}
          </p>
        </div>
      </div>
      <div class="info-card">
        <h2>Detalles Generales</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">ID</span>
            <span class="value">{{ teamStore.currentTeam.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">Nombre</span>
            <span class="value font-bold">{{ teamStore.currentTeam.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Abreviatura</span>
            <span class="value">
              <span class="badge">{{ teamStore.currentTeam.abbreviation }}</span>
            </span>
          </div>
          <div class="info-item">
            <span class="label">Presidente</span>
            <span class="value">{{ teamStore.currentTeam.president || "-" }}</span>
          </div>
        </div>
      </div>
      <div
        v-if="
          teamStore.currentTeam.homeMatches &&
          teamStore.currentTeam.homeMatches.length > 0
        "
        class="table-container"
      >
        <div class="table-header">
          <h2>Partidos del Equipo</h2>
        </div>
        <table class="team-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Encuentro</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="match in teamStore.currentTeam.homeMatches" :key="match.id">
              <td>{{ match.id }}</td>
              <td>{{ formatDate(match.dateTime) }}</td>
              <td class="font-bold">
                {{ match.homeTeam?.name || `Equipo ${match.homeTeamId}` }} vs
                {{ match.awayTeam?.name || `Equipo ${match.awayTeamId}` }}
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

.team-hero {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.crest-large-container {
  width: 96px;
  height: 96px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.crest-large {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.crest-placeholder-large {
  width: 100%;
  height: 100%;
  background-color: #e5e7eb;
  color: #4b5563;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.team-header-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-row h2 {
  font-size: 1.5rem;
  margin: 0;
  color: #111827;
}

.president-text,
.stadium-text {
  color: #4b5563;
  margin: 0;
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

.font-bold {
  font-weight: 600;
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

.team-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.team-table th,
.team-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.team-table th {
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

.badge-number {
  background-color: #f3f4f6;
  color: #1f2937;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.875rem;
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
import { useTeamStore } from "../../stores/team.store";

const teamStore = useTeamStore();
const route = useRoute();
const router = useRouter();

const teamId = Number(route.params.id);

onMounted(() => {
  if (teamId) {
    teamStore.fetchTeamById(teamId);
  }
});

const handleBack = () => {
  router.push("/teams");
};

const handleEdit = () => {
  router.push(`/teams/${teamId}/edit`);
};

const confirmDelete = async () => {
  if (confirm(`¿Estás seguro de que deseas eliminar el equipo con ID ${teamId}?`)) {
    try {
      await teamStore.deleteTeam(teamId);
      router.push("/teams");
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

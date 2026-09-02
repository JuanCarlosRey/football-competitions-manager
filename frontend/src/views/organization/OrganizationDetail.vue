<template>
  <div class="organization-container">
    <header class="header">
      <div class="header-title">
        <button class="btn btn-secondary btn-sm" @click="handleBack">← Volver</button>
        <h1>
          {{ orgStore.currentOrganization ? orgStore.currentOrganization.name : 'Detalle de Organización' }}
        </h1>
      </div>
      <div v-if="orgStore.currentOrganization" class="actions">
        <button class="btn btn-secondary" @click="handleEdit">Editar</button>
        <button class="btn btn-danger" @click="confirmDelete">Eliminar</button>
      </div>
    </header>
    <div v-if="orgStore.error" class="alert alert-danger">
      <span>{{ orgStore.error }}</span>
      <button class="btn-close" @click="orgStore.clearError()">✕</button>
    </div>
    <div v-if="orgStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando detalles de la organización...</p>
    </div>
    <div
      v-else-if="!orgStore.isLoading && !orgStore.currentOrganization"
      class="empty-state"
    >
      <p>No se encontró la información de esta organización.</p>
    </div>
    <div v-else-if="orgStore.currentOrganization" class="detail-content">
      <div class="info-card">
        <h2>Información General</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">ID</span>
            <span class="value">{{ orgStore.currentOrganization.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">Nombre</span>
            <span class="value font-bold">{{ orgStore.currentOrganization.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Total Competiciones</span>
            <span class="value">
              <span class="badge">
                {{ orgStore.currentOrganization.competitions?.length || 0 }} competiciones
              </span>
            </span>
          </div>
        </div>
      </div>
      <div class="table-container">
        <div class="table-header">
          <h2>Competiciones Asociadas</h2>
        </div>
        <div
          v-if="!orgStore.currentOrganization.competitions || orgStore.currentOrganization.competitions.length === 0"
          class="empty-state"
        >
          <p>Esta organización no tiene competiciones registradas.</p>
        </div>
        <table v-else class="org-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre de la Competición</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="comp in orgStore.currentOrganization.competitions" :key="comp.id">
              <td>{{ comp.id }}</td>
              <td class="font-bold">{{ comp.name }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.organization-container {
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

.table-container {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  padding: 1.5rem 1.5rem 0.5rem 1.5rem;
}

.org-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.org-table th,
.org-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.org-table th {
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
import { useOrganizationStore } from "../../stores/organization.store";

const orgStore = useOrganizationStore();
const route = useRoute();
const router = useRouter();

const orgId = Number(route.params.id);

onMounted(() => {
  if (orgId) {
    orgStore.fetchOrganizationById(orgId);
  }
});

const handleBack = () => {
  router.push("/organizations");
};

const handleEdit = () => {
  router.push(`/organizations/${orgId}/edit`);
};

const confirmDelete = async () => {
  const name = orgStore.currentOrganization?.name || "";
  if (confirm(`¿Estás seguro de que deseas eliminar la organización "${name}"?`)) {
    try {
      await orgStore.deleteOrganization(orgId);
      router.push("/organizations");
    } catch {
      // El mensaje de error ya se captura e imprime automáticamente en el store
    }
  }
};
</script>
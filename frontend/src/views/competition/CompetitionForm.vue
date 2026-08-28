<template>
  <div class="form-container">
    <header class="header">
      <h1>{{ isEditMode ? "Editar Competición" : "Nueva Competición" }}</h1>
      <button class="btn btn-secondary" @click="handleCancel">Cancelar</button>
    </header>
    <div v-if="competitionStore.error" class="alert alert-danger">
      <span>{{ competitionStore.error }}</span>
      <button class="btn-close" @click="competitionStore.clearError()">✕</button>
    </div>
    <div v-if="isLoadingData" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando información...</p>
    </div>
    <form v-else class="form-card" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">Nombre de la Competición *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="form-control"
          placeholder="Ej: Champions League"
          required
        />
      </div>
      <div class="form-group">
        <label for="organizationId">Organización *</label>
        <select
          id="organizationId"
          v-model.number="form.organizationId"
          class="form-control"
          required
        >
          <option :value="null" disabled>Selecciona una organización</option>
          <option
            v-for="org in organizationStore.organizations"
            :key="org.id"
            :value="org.id"
          >
            {{ org.name }}
          </option>
        </select>
      </div>
      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="competitionStore.isLoading"
          @click="handleCancel"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="competitionStore.isLoading"
        >
          <span v-if="competitionStore.isLoading" class="spinner-sm"></span>
          <span>{{ isEditMode ? "Guardar Cambios" : "Crear Competición" }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.form-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.form-control {
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #2563eb;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}
.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}
.btn-secondary:hover:not(:disabled) {
  background-color: #d1d5db;
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

.loading-state {
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

.spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCompetitionStore } from "../../stores/competition.store";
import { useOrganizationStore } from "../../stores/organization.store";

const route = useRoute();
const router = useRouter();

const competitionStore = useCompetitionStore();
const organizationStore = useOrganizationStore();

const competitionId = computed(() => {
  const idParam = route.params.id;
  return idParam ? Number(idParam) : null;
});

const isEditMode = computed(
  () => competitionId.value !== null && !isNaN(competitionId.value)
);
const isLoadingData = ref<boolean>(false);

const form = reactive<{
  name: string;
  organizationId: number | null;
}>({
  name: "",
  organizationId: null,
});

onMounted(async () => {
  isLoadingData.value = true;
  competitionStore.clearError();
  try {
    await organizationStore.fetchOrganizations();
    if (isEditMode.value && competitionId.value) {
      await competitionStore.fetchCompetitionById(competitionId.value);
      if (competitionStore.currentCompetition) {
        form.name = competitionStore.currentCompetition.name;
        form.organizationId = competitionStore.currentCompetition.organizationId;
      }
    }
  } catch {
    // Los errores son capturados y expuestos por las stores
  } finally {
    isLoadingData.value = false;
  }
});

const handleSubmit = async () => {
  if (!form.name || form.organizationId === null) return;
  try {
    if (isEditMode.value && competitionId.value) {
      await competitionStore.updateCompetition(competitionId.value, {
        name: form.name,
        organizationId: form.organizationId,
      });
    } else {
      await competitionStore.createCompetition({
        name: form.name,
        organizationId: form.organizationId,
      });
    }
    router.push("/competitions");
  } catch {
    // El error queda reflejado en competitionStore.error
  }
};

const handleCancel = () => {
  router.push("/competitions");
};
</script>

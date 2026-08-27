<template>
  <div class="form-container">
    <header class="header">
      <h2>{{ isEditMode ? "Editar Organización" : "Nueva Organización" }}</h2>
    </header>
    <div v-if="orgStore.error" class="alert alert-danger">
      <span>{{ orgStore.error }}</span>
      <button type="button" class="btn-close" @click="orgStore.clearError()">✕</button>
    </div>
    <div v-if="orgStore.isLoading && isEditMode && !formData.name" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando información...</p>
    </div>
    <form v-else @submit.prevent="handleSubmit" class="card-form">
      <div class="form-group">
        <label for="name">Nombre de la Organización *</label>
        <input
          id="name"
          v-model.trim="formData.name"
          type="text"
          placeholder="Ej. UEFA, FIFA, CONMEBOL..."
          :class="{ 'input-error': validationError }"
          :disabled="orgStore.isLoading"
        />
        <span v-if="validationError" class="error-message">
          {{ validationError }}
        </span>
      </div>
      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="orgStore.isLoading"
          @click="handleCancel"
        >
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary" :disabled="orgStore.isLoading">
          <span v-if="orgStore.isLoading" class="btn-spinner"></span>
          {{ isEditMode ? "Guardar Cambios" : "Crear Organización" }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.header {
  margin-bottom: 1.5rem;
}

.card-form {
  background: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #2563eb;
}

input.input-error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Botones */
.btn {
  padding: 0.65rem 1.25rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Alert & Feedback */
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
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.spinner,
.btn-spinner {
  border: 2px solid #f3f3f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner {
  width: 24px;
  height: 24px;
  border-top: 2px solid #2563eb;
  margin: 0 auto 0.5rem auto;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border-top: 2px solid white;
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
import { useOrganizationStore } from "../stores/organization.store";

const route = useRoute();
const router = useRouter();
const orgStore = useOrganizationStore();

const formData = ref({
  name: "",
});
const validationError = ref<string | null>(null);

const orgId = computed(() => {
  const idParam = route.params.id;
  return idParam ? Number(idParam) : null;
});

const isEditMode = computed(() => orgId.value !== null && !isNaN(orgId.value));

onMounted(async () => {
  if (isEditMode.value && orgId.value) {
    let org = orgStore.getOrganizationByIdFromState(orgId.value);
    if (!org) {
      await orgStore.fetchOrganizationById(orgId.value);
      org = orgStore.currentOrganization || undefined;
    }

    if (org) {
      formData.value.name = org.name;
    } else {
      router.push("/organizations");
    }
  }
});

const validateForm = (): boolean => {
  validationError.value = null;
  if (!formData.value.name) {
    validationError.value = "El nombre es obligatorio.";
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    if (isEditMode.value && orgId.value) {
      await orgStore.updateOrganization(orgId.value, { name: formData.value.name });
    } else {
      await orgStore.createOrganization({ name: formData.value.name });
    }
    router.push("/organizations");
  } catch {
    // El error global ya se gestiona en el store
  }
};

const handleCancel = () => {
  orgStore.clearError();
  router.push("/organizations");
};
</script>
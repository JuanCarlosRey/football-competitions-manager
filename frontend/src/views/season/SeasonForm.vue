<template>
  <div class="form-container">
    <header class="header">
      <h1>{{ isEditing ? "Editar Temporada" : "Nueva Temporada" }}</h1>
      <button class="btn btn-secondary" @click="handleCancel">Cancelar</button>
    </header>
    <div v-if="error" class="alert alert-danger">
      <span>{{ error }}</span>
      <button class="btn-close" @click="error = null">✕</button>
    </div>
    <form @submit.prevent="handleSubmit" class="form-card">
      <div class="form-group">
        <label for="startDate">Fecha de Inicio *</label>
        <input
          id="startDate"
          v-model="formData.startDate"
          type="date"
          class="form-control"
          required
        />
      </div>
      <div class="form-group">
        <label for="endDate">Fecha de Fin *</label>
        <input
          id="endDate"
          v-model="formData.endDate"
          type="date"
          class="form-control"
          required
        />
      </div>
      <div class="form-group">
        <label for="competitionId">Competición *</label>
        <select
          id="competitionId"
          v-model.number="formData.competitionId"
          class="form-control"
          required
        >
          <option value="" disabled>Selecciona una competición</option>
          <option
            v-for="comp in competitionStore.competitions"
            :key="comp.id"
            :value="comp.id"
          >
            {{ comp.name }}
          </option>
        </select>
      </div>
      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="handleCancel"
          :disabled="seasonStore.isLoading"
        >
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary" :disabled="seasonStore.isLoading">
          <span v-if="seasonStore.isLoading" class="spinner-sm"></span>
          <span>{{ isEditing ? "Guardar Cambios" : "Crear Temporada" }}</span>
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
  font-size: 0.875rem;
}

.form-control {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
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

.spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
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
import { useSeasonStore } from "../../stores/season.store";
import { useCompetitionStore } from "../../stores/competition.store";

const route = useRoute();
const router = useRouter();
const seasonStore = useSeasonStore();
const competitionStore = useCompetitionStore();

const seasonId = computed(() => {
  const id = route.params.id;
  return id ? Number(id) : null;
});

const isEditing = computed(() => !!seasonId.value);
const error = ref<string | null>(null);

const formData = reactive({
  startDate: "",
  endDate: "",
  competitionId: "" as number | "",
});

const formatToInputDate = (dateValue: string | Date): string => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  return date.toISOString().split("T")[0];
};

onMounted(async () => {
  await competitionStore.fetchCompetitions();
  if (isEditing.value && seasonId.value) {
    await seasonStore.fetchSeasonById(seasonId.value);
    const season = seasonStore.currentSeason;
    if (season) {
      formData.startDate = formatToInputDate(season.startDate);
      formData.endDate = formatToInputDate(season.endDate);
      formData.competitionId = season.competitionId;
    } else {
      error.value = "No se encontró la temporada especificada";
    }
  }
});

const handleSubmit = async () => {
  error.value = null;
  if (!formData.startDate || !formData.endDate || !formData.competitionId) {
    error.value = "Por favor, completa todos los campos requeridos.";
    return;
  }
  if (new Date(formData.startDate) > new Date(formData.endDate)) {
    error.value = "La fecha de inicio no puede ser posterior a la fecha de fin.";
    return;
  }
  try {
    const payload = {
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      competitionId: Number(formData.competitionId),
    };
    if (isEditing.value && seasonId.value) {
      await seasonStore.updateSeason(seasonId.value, payload);
    } else {
      await seasonStore.createSeason(payload);
    }
    router.push("/seasons");
  } catch {
    error.value = seasonStore.error || "Ocurrió un error al guardar la temporada.";
  }
};

const handleCancel = () => {
  router.push("/seasons");
};
</script>

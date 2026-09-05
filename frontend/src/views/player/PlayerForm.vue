<template>
  <div class="form-container">
    <header class="header">
      <h1>{{ isEditing ? "Editar Jugador" : "Nuevo Jugador" }}</h1>
      <button class="btn btn-secondary" @click="handleCancel">Cancelar</button>
    </header>
    <div v-if="error" class="alert alert-danger">
      <span>{{ error }}</span>
      <button class="btn-close" @click="error = null">✕</button>
    </div>
    <form @submit.prevent="handleSubmit" class="form-card">
      <div v-if="!isEditing" class="form-row">
        <div class="form-group full-width">
          <label for="teamId">Equipo Inicial (Opcional)</label>
          <select id="teamId" v-model="formData.teamId" class="form-control">
            <option :value="null">-- Agente Libre / Sin Equipo --</option>
            <option v-for="team in teamStore.teams" :key="team.id" :value="team.id">
              {{ team.name }}
            </option>
          </select>
          <small class="text-muted">
            Si deseas asignar un equipo al crear al jugador. Para cambiarlo
            posteriormente, utiliza la opción de Traspaso.
          </small>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="firstName">Nombre *</label>
          <input
            id="firstName"
            v-model="formData.firstName"
            type="text"
            class="form-control"
            placeholder="Ej. Lamine"
            required
          />
        </div>
        <div class="form-group">
          <label for="lastName">Apellido *</label>
          <input
            id="lastName"
            v-model="formData.lastName"
            type="text"
            class="form-control"
            placeholder="Ej. Yamal"
            required
          />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="birthDate">Fecha de Nacimiento *</label>
          <input
            id="birthDate"
            v-model="formData.birthDate"
            type="date"
            class="form-control"
            required
          />
        </div>
        <div class="form-group">
          <label for="nationality">Nacionalidad *</label>
          <input
            id="nationality"
            v-model="formData.nationality"
            type="text"
            class="form-control"
            placeholder="Ej. España"
            required
          />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="position">Posición *</label>
          <input
            id="position"
            v-model="formData.position"
            type="text"
            class="form-control"
            placeholder="Ej. RW, ST, CB"
            required
          />
        </div>
        <div class="form-group">
          <label for="preferredFoot">Pie Preferido *</label>
          <select
            id="preferredFoot"
            v-model="formData.preferredFoot"
            class="form-control"
            required
          >
            <option value="" disabled>Selecciona un pie</option>
            <option value="RIGHT">Derecho (RIGHT)</option>
            <option value="LEFT">Izquierdo (LEFT)</option>
            <option value="BOTH">Ambidextro (BOTH)</option>
          </select>
        </div>
      </div>
      <div class="form-row form-row-3">
        <div class="form-group">
          <label for="overall">Media (40-109) *</label>
          <input
            id="overall"
            v-model.number="formData.overall"
            type="number"
            min="40"
            max="109"
            class="form-control"
            required
          />
        </div>
        <div class="form-group">
          <label for="height">Altura (m) *</label>
          <input
            id="height"
            v-model.number="formData.height"
            type="number"
            step="0.01"
            min="1.00"
            max="2.50"
            class="form-control"
            placeholder="Ej. 1.80"
            required
          />
        </div>
        <div class="form-group">
          <label for="weight">Peso (kg) *</label>
          <input
            id="weight"
            v-model.number="formData.weight"
            type="number"
            step="0.1"
            min="30"
            max="150"
            class="form-control"
            placeholder="Ej. 68.0"
            required
          />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="marketValue">Valor de Mercado (€)</label>
          <input
            id="marketValue"
            v-model.number="formData.marketValue"
            type="number"
            min="0"
            class="form-control"
            placeholder="Ej. 150000000"
          />
        </div>
        <div class="form-group">
          <label for="annualSalary">Salario Anual (€)</label>
          <input
            id="annualSalary"
            v-model.number="formData.annualSalary"
            type="number"
            min="0"
            class="form-control"
            placeholder="Ej. 15000000"
          />
        </div>
      </div>
      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="handleCancel"
          :disabled="playerStore.isLoading"
        >
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary" :disabled="playerStore.isLoading">
          <span v-if="playerStore.isLoading" class="spinner-sm"></span>
          <span>{{ isEditing ? "Guardar Cambios" : "Crear Jugador" }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 700px;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-row-3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.full-width {
  grid-column: 1 / -1;
}

@media (max-width: 640px) {
  .form-row,
  .form-row-3 {
    grid-template-columns: 1fr;
  }
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

.text-muted {
  font-size: 0.75rem;
  color: #6b7280;
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
import { usePlayerStore } from "../../stores/player.store";
import { useTeamStore } from "../../stores/team.store";
import type { PreferredFoot } from "../../types/player";

const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();
const teamStore = useTeamStore();

const playerId = computed(() => {
  const id = route.params.id;
  return id ? Number(id) : null;
});

const isEditing = computed(() => !!playerId.value);
const error = ref<string | null>(null);

const formData = reactive({
  teamId: null as number | null,
  firstName: "",
  lastName: "",
  birthDate: "",
  position: "",
  nationality: "",
  overall: 70 as number | "",
  height: "" as number | "",
  weight: "" as number | "",
  preferredFoot: "" as PreferredFoot | "",
  marketValue: null as number | null,
  annualSalary: null as number | null,
});

const formatToInputDate = (dateValue: string | Date): string => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  return date.toISOString().split("T")[0];
};

onMounted(async () => {
  if (!isEditing.value) {
    await teamStore.fetchTeams();
  } else if (playerId.value) {
    await playerStore.fetchPlayerById(playerId.value);
    const player = playerStore.currentPlayer;
    if (player) {
      formData.firstName = player.firstName;
      formData.lastName = player.lastName;
      formData.birthDate = formatToInputDate(player.birthDate);
      formData.position = player.position;
      formData.nationality = player.nationality;
      formData.overall = player.overall;
      formData.height = player.height;
      formData.weight = player.weight;
      formData.preferredFoot = player.preferredFoot;
      formData.marketValue = player.marketValue ?? null;
      formData.annualSalary = player.annualSalary ?? null;
    } else {
      error.value = "No se encontró el jugador especificado";
    }
  }
});

const handleSubmit = async () => {
  error.value = null;
  if (
    !formData.firstName ||
    !formData.lastName ||
    !formData.birthDate ||
    !formData.position ||
    !formData.nationality ||
    formData.overall === "" ||
    formData.height === "" ||
    formData.weight === "" ||
    !formData.preferredFoot
  ) {
    error.value = "Por favor, completa todos los campos requeridos.";
    return;
  }
  if (Number(formData.overall) < 40 || Number(formData.overall) > 109) {
    error.value = "La valoración media debe estar entre 40 y 109.";
    return;
  }
  try {
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      birthDate: new Date(formData.birthDate).toISOString(),
      position: formData.position,
      nationality: formData.nationality,
      overall: Number(formData.overall),
      height: Number(formData.height),
      weight: Number(formData.weight),
      preferredFoot: formData.preferredFoot as PreferredFoot,
      marketValue: formData.marketValue !== null ? Number(formData.marketValue) : null,
      annualSalary: formData.annualSalary !== null ? Number(formData.annualSalary) : null,
      ...(formData.teamId ? { teamId: formData.teamId } : {}),
    };
    if (isEditing.value && playerId.value) {
      await playerStore.updatePlayer(playerId.value, payload);
    } else {
      await playerStore.createPlayer(payload);
    }
    router.push("/players");
  } catch {
    error.value = playerStore.error || "Ocurrió un error al guardar el jugador.";
  }
};

const handleCancel = () => {
  router.push("/players");
};
</script>



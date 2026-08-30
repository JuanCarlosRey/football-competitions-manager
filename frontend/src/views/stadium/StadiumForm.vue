<template>
  <div class="form-container">
    <header class="header">
      <h1>{{ isEditing ? "Editar Estadio" : "Nuevo Estadio" }}</h1>
      <button class="btn btn-secondary" @click="handleCancel">Cancelar</button>
    </header>
    <div v-if="error" class="alert alert-danger">
      <span>{{ error }}</span>
      <button class="btn-close" @click="error = null">✕</button>
    </div>
    <form @submit.prevent="handleSubmit" class="form-card">
      <div class="form-group">
        <label for="name">Nombre *</label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          class="form-control"
          placeholder="Ej. Santiago Bernabéu"
          required
        />
      </div>
      <div class="form-group">
        <label for="capacity">Capacidad *</label>
        <input
          id="capacity"
          v-model.number="formData.capacity"
          type="number"
          min="1"
          class="form-control"
          placeholder="Ej. 81044"
          required
        />
      </div>
      <div class="form-group">
        <label for="address">Dirección *</label>
        <input
          id="address"
          v-model="formData.address"
          type="text"
          class="form-control"
          placeholder="Ej. Av. de Concha Espina, 1, Madrid"
          required
        />
      </div>
      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="handleCancel"
          :disabled="stadiumStore.isLoading"
        >
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary" :disabled="stadiumStore.isLoading">
          <span v-if="stadiumStore.isLoading" class="spinner-sm"></span>
          <span>{{ isEditing ? "Guardar Cambios" : "Crear Estadio" }}</span>
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
import { useStadiumStore } from "../../stores/stadium.store";

const route = useRoute();
const router = useRouter();
const stadiumStore = useStadiumStore();

const stadiumId = computed(() => {
  const id = route.params.id;
  return id ? Number(id) : null;
});

const isEditing = computed(() => !!stadiumId.value);
const error = ref<string | null>(null);

const formData = reactive({
  name: "",
  capacity: null as number | null,
  address: "",
});

onMounted(async () => {
  if (isEditing.value && stadiumId.value) {
    await stadiumStore.fetchStadiumById(stadiumId.value);
    const stadium = stadiumStore.currentStadium;
    if (stadium) {
      formData.name = stadium.name;
      formData.capacity = stadium.capacity;
      formData.address = stadium.address;
    } else {
      error.value = "No se encontró el estadio especificado";
    }
  }
});

const handleSubmit = async () => {
  error.value = null;
  if (
    !formData.name.trim() ||
    formData.capacity === null ||
    formData.capacity <= 0 ||
    !formData.address.trim()
  ) {
    error.value = "Por favor, completa todos los campos requeridos correctamente.";
    return;
  }
  try {
    const payload = {
      name: formData.name.trim(),
      capacity: formData.capacity,
      address: formData.address.trim(),
    };
    if (isEditing.value && stadiumId.value) {
      await stadiumStore.updateStadium(stadiumId.value, payload);
    } else {
      await stadiumStore.createStadium(payload);
    }
    router.push("/stadiums");
  } catch {
    error.value = stadiumStore.error || "Ocurrió un error al guardar el estadio.";
  }
};

const handleCancel = () => {
  router.push("/stadiums");
};
</script>

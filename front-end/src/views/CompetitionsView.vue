<template>
  <main class="competitions-container">
    <h1>Competiciones</h1>
    <div v-if="store.loading" class="state-msg">Cargando competiciones...</div>
    <div v-else-if="store.error" class="state-msg error">
      {{ store.error }}
    </div>
    <div v-else-if="store.competitions.length === 0" class="state-msg">
      No hay competiciones registradas.
    </div>
    <ul v-else class="competition-list">
      <li
        v-for="competition in store.competitions"
        :key="competition.id"
        class="competition-card"
      >
        <h2>{{ competition.name }}</h2>
        <p v-if="competition.organization">
          <strong>Organización:</strong> {{ competition.organization }}
        </p>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.competitions-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.state-msg {
  padding: 1rem;
  margin-top: 1rem;
  background-color: #f3f4f6;
  border-radius: 6px;
  text-align: center;
}

.error {
  background-color: #fee2e2;
  color: #991b1b;
}

.competition-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}

.competition-card {
  border: 1px solid #e5e7eb;
  padding: 1.25rem;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.competition-card h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #111827;
}

.competition-card p {
  margin: 0;
  color: #4b5563;
}
</style>

<script setup lang="ts">
import { onMounted } from "vue";
import { useCompetitionStore } from "../stores/competitionStore";

const store = useCompetitionStore();

onMounted(() => {
  store.fetchCompetitions();
});
</script>

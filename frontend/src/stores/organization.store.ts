import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
    Organization,
    CreateOrganizationDTO,
    UpdateOrganizationDTO
} from '../types/organization';
import { organizationService } from '../services/organization.service';

/**
 * Pinia store for managing organizations. This store provides state management for organizations, including fetching, creating, updating, and deleting organizations. It also handles loading states and error messages.
 */
export const useOrganizationStore = defineStore('organization', () => {
    const organizations = ref<Organization[]>([]);
    const currentOrganization = ref<Organization | null>(null);
    const isLoading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const totalOrganizations = computed(() => organizations.value.length);
    const getOrganizationByIdFromState = computed(() => {
        return (id: number) => organizations.value.find((org) => org.id === id);
    });

    async function fetchOrganizations() {
        isLoading.value = true;
        error.value = null;
        try {
            organizations.value = await organizationService.getAll();
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al cargar las organizaciones';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchOrganizationById(id: number) {
        isLoading.value = true;
        error.value = null;
        try {
            currentOrganization.value = await organizationService.getById(id);
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || `Error al obtener la organización con ID ${id}`;
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function createOrganization(data: CreateOrganizationDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const newOrg = await organizationService.create(data);
            organizations.value.push(newOrg);
            return newOrg;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al crear la organización';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function updateOrganization(id: number, data: UpdateOrganizationDTO) {
        isLoading.value = true;
        error.value = null;
        try {
            const updatedOrg = await organizationService.update(id, data);
            const index = organizations.value.findIndex((org) => org.id === id);
            if (index !== -1) {
                organizations.value[index] = updatedOrg;
            }
            if (currentOrganization.value?.id === id) {
                currentOrganization.value = updatedOrg;
            }
            return updatedOrg;
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al actualizar la organización';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteOrganization(id: number) {
        isLoading.value = true;
        error.value = null;
        try {
            await organizationService.delete(id);
            organizations.value = organizations.value.filter((org) => org.id !== id);
            if (currentOrganization.value?.id === id) {
                currentOrganization.value = null;
            }
        } catch (err: unknown) {
            error.value = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Error al eliminar la organización';
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    function clearError() {
        error.value = null;
    }

    return {
        organizations,
        currentOrganization,
        isLoading,
        error,
        totalOrganizations,
        getOrganizationByIdFromState,
        fetchOrganizations,
        fetchOrganizationById,
        createOrganization,
        updateOrganization,
        deleteOrganization,
        clearError,
    };
});
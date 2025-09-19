import { apiClient } from '../api/apiClient.js';
import API_ENDPOINTS from '../api/endpoints.js';

const mapItemToUi = (item) => ({
  id: item.id,
  label: item.title,
  status: item.is_completed ? 'completed' : 'pending',
  required: false,
  completedDate: item.deadline || null,
  description: item.description || '',
  uploaded_files: item.uploaded_files || [],
});

const mapCategoryToUi = (cat) => ({
  id: cat.id,
  title: cat.title,
  items: Array.isArray(cat.items) ? cat.items.map(mapItemToUi) : [],
});

const mapChecklistToUi = (cl) => ({
  id: cl.id,
  title: cl.title,
  deadline: cl.overall_deadline || null,
  categories: Array.isArray(cl.categories) ? cl.categories.map(mapCategoryToUi) : [],
});

const checklistsService = {
  async createChecklist({ title, overall_deadline = null } = {}) {
    const { data } = await apiClient.post(API_ENDPOINTS.CHECKLISTS.ROOT + '/', {
      title,
      overall_deadline,
    });
    return mapChecklistToUi(data);
  },

  async getChecklists() {
    const { data } = await apiClient.get(API_ENDPOINTS.CHECKLISTS.ROOT + '/');
    return Array.isArray(data) ? data.map(mapChecklistToUi) : [];
  },
  async getChecklist(checklistId) {
    const { data } = await apiClient.get(API_ENDPOINTS.CHECKLISTS.BY_ID(checklistId));
    return mapChecklistToUi(data);
  },

  async updateChecklist(checklistId, payload) {
    const { data } = await apiClient.patch(API_ENDPOINTS.CHECKLISTS.BY_ID(checklistId), payload);
    return mapChecklistToUi(data);
  },

  async createCategory(checklistId, { title }) {
    const { data } = await apiClient.post(API_ENDPOINTS.CHECKLISTS.CATEGORIES(checklistId), { title });
    return mapCategoryToUi(data);
  },

  async updateCategory(categoryId, { title }) {
    const { data } = await apiClient.patch(API_ENDPOINTS.CHECKLISTS.CATEGORY_BY_ID(categoryId), { title });
    return mapCategoryToUi(data);
  },

  async createItem(categoryId, { title, description, deadline }) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.CHECKLISTS.ITEMS_IN_CATEGORY(categoryId),
      { title, description, deadline }
    );
    return mapItemToUi(data);
  },

  async updateItem(itemId, partial) {
    const { data } = await apiClient.patch(API_ENDPOINTS.CHECKLISTS.ITEM_BY_ID(itemId), partial);
    return mapItemToUi(data);
  },

  async updateItemDescription(itemId, description) {
    return this.updateItem(itemId, { description });
  },

  async deleteItem(itemId) {
    await apiClient.delete(API_ENDPOINTS.CHECKLISTS.ITEM_BY_ID(itemId));
    return true;
  },

  async uploadItemFile(itemId, file, { description, tags } = {}) {
    const form = new FormData();
    form.append('file', file);
    if (description) form.append('description', description);
    if (tags) form.append('tags', tags);
    const { data } = await apiClient.post(API_ENDPOINTS.CHECKLISTS.ITEM_FILES(itemId), form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.file;
  },

  async listItemFiles(itemId) {
    const { data } = await apiClient.get(API_ENDPOINTS.CHECKLISTS.ITEM_FILES(itemId));
    return data.files || [];
  },
};

export default checklistsService;



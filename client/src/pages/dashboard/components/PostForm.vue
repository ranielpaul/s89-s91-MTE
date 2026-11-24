<template>
  <div class="card shadow-sm border-0 mb-4 bg-white" :class="{ 'border border-2 border-highlight': isEditing }">
    <div class="card-body p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="h5 fw-bold mb-0 text-highlight">
          {{ isEditing ? '✏️ Edit Blog Post' : 'Publish a New Blog Post' }}
        </h4>
        <button @click="$emit('cancel')" class="btn btn-sm btn-outline-secondary">
          ✕ Cancel
        </button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label class="form-label fw-semibold">Title</label>
          <input
            v-model="form.title"
            type="text"
            class="form-control"
            placeholder="Enter an engaging title..."
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Content</label>
          <textarea
            v-model="form.content"
            class="form-control"
            rows="6"
            placeholder="Write your blog story, insights, or tutorials..."
            required
          ></textarea>
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button
            type="button"
            @click="$emit('cancel')"
            class="btn btn-secondary btn-sm"
            :disabled="loading"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-highlight btn-sm px-4"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            {{ loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Publish Post') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  isEditing: {
    type: Boolean,
    default: false
  },
  initialTitle: {
    type: String,
    default: ''
  },
  initialContent: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['save', 'cancel']);

const form = ref({
  title: props.initialTitle,
  content: props.initialContent
});

watch(
  () => [props.initialTitle, props.initialContent],
  ([newTitle, newContent]) => {
    form.value.title = newTitle || '';
    form.value.content = newContent || '';
  }
);

function handleSubmit() {
  if (!form.value.title.trim() || !form.value.content.trim()) return;
  emit('save', {
    title: form.value.title.trim(),
    content: form.value.content.trim()
  });
}
</script>

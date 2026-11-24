<template>
  <div class="card h-100 shadow-sm border-0 transition-hover bg-light">
    <div class="card-body d-flex flex-column">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <span class="badge bg-highlight">
          Blog Post
        </span>
        <small class="text-muted">{{ formatDate(blog.creationDate || blog.createdAt) }}</small>
      </div>

      <h5 class="card-title fw-bold text-dark mb-2">
        {{ blog.title }}
      </h5>

      <p class="card-subtitle small text-muted mb-3">
        By <strong class="text-secondary">{{ blog.author?.username || 'Unknown Author' }}</strong>
      </p>

      <p class="card-text text-secondary flex-grow-1">
        {{ truncateContent(blog.content, 140) }}
      </p>

      <hr class="my-3 text-secondary opacity-25" />

      <div class="d-flex justify-content-between align-items-center">
        <span class="small text-muted">
          💬 {{ blog.comments?.length || 0 }} {{ (blog.comments?.length === 1) ? 'comment' : 'comments' }}
        </span>

        <div class="d-flex gap-1">
          <router-link :to="'/blogs/' + blog._id" class="btn btn-sm btn-outline-highlight">
            Read More &rarr;
          </router-link>

          <!-- Delete action remains danger -->
          <button
            v-if="canDelete"
            @click="$emit('delete', blog._id)"
            class="btn btn-sm btn-outline-danger"
            title="Delete post"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { authState } from '../../../stores/auth';

const props = defineProps({
  blog: {
    type: Object,
    required: true
  }
});

defineEmits(['delete']);

const canDelete = computed(() => {
  if (!authState.isAuthenticated) return false;
  if (authState.isAdmin) return true;
  const authorId = props.blog.author?._id || props.blog.author;
  return authorId === authState.user?.id || authorId === authState.user?._id;
});

function truncateContent(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
</script>

<style scoped>
.transition-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.transition-hover:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
}
</style>

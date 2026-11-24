<template>
  <div class="comments-list">
    <!-- Comments List -->
    <div v-if="comments && comments.length > 0" class="d-flex flex-column gap-3">
      <div
        v-for="comment in comments"
        :key="comment._id || comment.date"
        class="card border-0 bg-light p-3 shadow-sm"
      >
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="fw-bold small text-highlight">
            @{{ comment.user?.username || comment.user || 'User' }}
          </span>
          <span class="text-muted small">
            {{ formatDate(comment.date) }}
          </span>
        </div>
        <p class="mb-0 text-dark small" style="white-space: pre-wrap;">
          {{ comment.message }}
        </p>
      </div>
    </div>

    <!-- Empty Comments State -->
    <div v-else class="text-muted text-center py-4 bg-light rounded small">
      No comments yet. Be the first to start the discussion!
    </div>
  </div>
</template>

<script setup>
defineProps({
  comments: {
    type: Array,
    default: () => []
  }
});

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

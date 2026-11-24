<template>
  <div class="comment-form-container">
    <!-- Form for Authenticated Users -->
    <div v-if="authState.isAuthenticated" class="card bg-light border-0 mb-4">
      <div class="card-body">
        <h6 class="fw-semibold mb-2">Leave a Comment</h6>
        <form @submit.prevent="handleSubmit">
          <div class="mb-2">
            <textarea
              v-model="commentMessage"
              class="form-control"
              rows="3"
              placeholder="Share your thoughts or feedback..."
              required
            ></textarea>
          </div>
          <div class="d-flex justify-content-end">
            <button
              type="submit"
              class="btn btn-sm btn-highlight"
              :disabled="submitting || !commentMessage.trim()"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              Post Comment
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Login Prompt for Guests -->
    <div v-else class="alert alert-secondary d-flex align-items-center justify-content-between mb-4">
      <span class="small">Want to leave a comment? Log in to join the conversation.</span>
      <router-link :to="'/auth?redirect=/blogs/' + blogId" class="btn btn-sm btn-highlight">
        Log In
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { authState } from '../../../stores/auth';

const props = defineProps({
  blogId: {
    type: String,
    required: true
  },
  submitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit-comment']);

const commentMessage = ref('');

function handleSubmit() {
  if (!commentMessage.value.trim()) return;
  emit('submit-comment', commentMessage.value.trim());
  commentMessage.value = '';
}
</script>

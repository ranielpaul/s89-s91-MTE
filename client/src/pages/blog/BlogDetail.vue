<template>
  <div class="container py-2" style="max-width: 860px;">
    <!-- Back Button -->
    <div class="mb-3">
      <router-link to="/" class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center">
        &larr; Back to all posts
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-highlight" role="status">
        <span class="visually-hidden">Loading post...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="!blog" class="alert alert-light border text-center py-5">
      <h5>Blog Post Not Found</h5>
      <p class="text-muted">The requested blog post could not be found or may have been removed.</p>
      <router-link to="/" class="btn btn-highlight mt-2">Return Home</router-link>
    </div>

    <!-- Blog Content -->
    <article v-else class="card shadow-sm border-0 mb-4">
      <div class="card-body p-4 p-md-5">
        <!-- Post Header -->
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <span class="badge bg-highlight">
            MEVN Blog
          </span>

          <div v-if="canEditOrDelete" class="d-flex gap-2">
            <button
              v-if="!isEditing"
              @click="startEdit"
              class="btn btn-sm btn-outline-secondary"
            >
              ✏️ Edit Post
            </button>

            <!-- Delete action remains danger -->
            <button
              @click="handleDelete"
              class="btn btn-sm btn-outline-danger"
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        <!-- Edit Mode -->
        <div v-if="isEditing" class="mb-4 p-3 bg-light rounded border border-highlight">
          <h5 class="fw-bold mb-3 text-highlight">Edit Post</h5>
          <div class="mb-3">
            <label class="form-label fw-semibold">Title</label>
            <input v-model="editForm.title" type="text" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Content</label>
            <textarea v-model="editForm.content" class="form-control" rows="8"></textarea>
          </div>
          <div class="d-flex gap-2 justify-content-end">
            <button @click="isEditing = false" class="btn btn-sm btn-secondary" :disabled="saving">
              Cancel
            </button>
            <button @click="handleUpdate" class="btn btn-sm btn-highlight" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              Save Changes
            </button>
          </div>
        </div>

        <!-- Read Mode -->
        <div v-else>
          <h1 class="h2 fw-bold text-dark mb-3">{{ blog.title }}</h1>

          <div class="d-flex align-items-center text-dark small mb-4 pb-3 border-bottom">
            <span class="me-3">
              ✏️ Written by <strong class="text-dark">{{ blog.author?.username || 'Unknown Author' }}</strong>
            </span>
            <span>
              📅 Published on {{ formatDate(blog.creationDate || blog.createdAt) }}
            </span>
          </div>

          <div class="blog-body text-dark fs-6 lh-lg mb-4" style="white-space: pre-wrap;">
            {{ blog.content }}
          </div>
        </div>

        <hr class="my-4 text-secondary opacity-25" />

        <!-- Comments Section -->
        <section class="comments-section mt-4">
          <h4 class="h5 fw-bold text-dark mb-3">
            Comments ({{ blog.comments?.length || 0 }})
          </h4>

          <!-- Subcomponent: Comment Form -->
          <CommentForm
            :blogId="blog._id"
            :submitting="submittingComment"
            @submit-comment="handleAddComment"
          />

          <!-- Subcomponent: Comment List -->
          <CommentList :comments="blog.comments" />
        </section>
      </div>
    </article>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../api';
import { authState } from '../../stores/auth';
import notyf from '../../utils/notyf';

import CommentList from './components/CommentList.vue';
import CommentForm from './components/CommentForm.vue';

const route = useRoute();
const router = useRouter();

const blog = ref(null);
const loading = ref(true);
const isEditing = ref(false);
const saving = ref(false);
const submittingComment = ref(false);

const editForm = ref({
  title: '',
  content: ''
});

const canEditOrDelete = computed(() => {
  if (!authState.isAuthenticated || !blog.value) return false;
  if (authState.isAdmin) return true;
  const authorId = blog.value.author?._id || blog.value.author;
  return authorId === authState.user?.id || authorId === authState.user?._id;
});

async function fetchBlog() {
  loading.value = true;
  try {
    const res = await api.get(`/blogs/${route.params.id}`);
    blog.value = res.data;
  } catch (err) {
    notyf.error(err.response?.data?.message || 'Blog not found.');
    blog.value = null;
  } finally {
    loading.value = false;
  }
}

function startEdit() {
  editForm.value.title = blog.value.title;
  editForm.value.content = blog.value.content;
  isEditing.value = true;
}

async function handleUpdate() {
  if (!editForm.value.title.trim() || !editForm.value.content.trim()) {
    notyf.error('Title and content cannot be empty.');
    return;
  }

  saving.value = true;
  try {
    const res = await api.patch(`/blogs/edit/${blog.value._id}`, editForm.value);
    notyf.success(res.data?.message || 'Blog updated successfully!');
    if (res.data?.blog) {
      blog.value = res.data.blog;
    } else {
      blog.value.title = editForm.value.title;
      blog.value.content = editForm.value.content;
    }
    isEditing.value = false;
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to update post.';
    notyf.error(msg);
  } finally {
    saving.value = false;
  }
}

async function handleDelete() {
  if (!confirm('Are you sure you want to permanently delete this blog post?')) return;

  try {
    const res = await api.delete(`/blogs/delete/${blog.value._id}`);
    notyf.success(res.data?.message || 'Blog post deleted successfully.');
    router.push('/');
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to delete post.';
    notyf.error(msg);
  }
}

async function handleAddComment(message) {
  submittingComment.value = true;
  try {
    const res = await api.patch(`/blogs/${blog.value._id}`, {
      message: message
    });

    notyf.success('Comment posted successfully!');
    if (res.data?.blog) {
      blog.value = res.data.blog;
    } else {
      if (!blog.value.comments) blog.value.comments = [];
      blog.value.comments.push({
        user: { username: authState.user?.username || 'You' },
        message: message,
        date: new Date()
      });
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to add comment.';
    notyf.error(msg);
  } finally {
    submittingComment.value = false;
  }
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

onMounted(() => {
  fetchBlog();
});
</script>

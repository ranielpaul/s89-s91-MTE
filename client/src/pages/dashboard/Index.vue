<template>
  <div class="container py-2">
    <!-- User Profile Header -->
    <div class="card shadow-sm border-0 mb-4 bg-white">
      <div class="card-body p-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <h2 class="h4 fw-bold mb-0 text-dark">
              Hello, {{ authState.user?.username || 'User' }}
            </h2>
            <span v-if="authState.isAdmin" class="badge bg-highlight">Administrator</span>
            <span v-else class="badge bg-secondary">Member</span>
          </div>
          <p class="text-muted small mb-0">
            Email: {{ authState.user?.email || 'N/A' }} | User ID: <code>{{ authState.user?.id || authState.user?._id }}</code>
          </p>
        </div>

        <div>
          <button
            @click="toggleCreateForm"
            class="btn"
            :class="showCreateForm ? 'btn-outline-secondary' : 'btn-highlight'"
          >
            {{ showCreateForm ? '✕ Close Form' : '+ Create New Post' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Create Post Form Subcomponent -->
    <PostForm
      v-if="showCreateForm"
      :isEditing="false"
      :loading="saving"
      @save="handleCreatePost"
      @cancel="showCreateForm = false"
    />

    <!-- Edit Post Form Subcomponent -->
    <PostForm
      v-if="editingBlog"
      :isEditing="true"
      :initialTitle="editingBlog.title"
      :initialContent="editingBlog.content"
      :loading="saving"
      @save="handleSaveEdit"
      @cancel="cancelEdit"
    />

    <!-- Tab Selection (for Admin) -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <ul class="nav nav-tabs border-bottom-0">
        <li class="nav-item">
          <button
            class="nav-link text-highlight"
            :class="{ active: currentTab === 'my' }"
            @click="currentTab = 'my'"
          >
            My Posts ({{ myPosts.length }})
          </button>
        </li>
        <li class="nav-item " v-if="authState.isAdmin">
          <button
            class="nav-link text-highlight"
            :class="{ active: currentTab === 'all' }"
            @click="currentTab = 'all'"
          >
            🛡️ All Posts (Admin Moderation) ({{ allPosts.length }})
          </button>
        </li>
      </ul>

      <button @click="fetchPosts" class="btn btn-sm btn-outline-secondary" title="Refresh posts">
        🔄 Refresh
      </button>
    </div>

    <!-- Subcomponent: Post Table -->
    <PostTable
      :posts="displayedPosts"
      :loading="loading"
      :showAuthorColumn="currentTab === 'all'"
      :currentUserId="authState.user?.id || authState.user?._id"
      :isAdmin="authState.isAdmin"
      @edit-post="startEdit"
      @delete-post="handleDelete"
      @create-post="showCreateForm = true"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../api';
import { authState } from '../../stores/auth';
import notyf from '../../utils/notyf';

import PostTable from './components/PostTable.vue';
import PostForm from './components/PostForm.vue';

const route = useRoute();

const allPosts = ref([]);
const loading = ref(true);
const currentTab = ref('my');

const showCreateForm = ref(false);
const editingBlog = ref(null);
const saving = ref(false);

const myPosts = computed(() => {
  const currentUserId = authState.user?.id || authState.user?._id;
  const currentUsername = authState.user?.username;

  return allPosts.value.filter((post) => {
    const authorId = post.author?._id || post.author;
    const authorUsername = post.author?.username;
    return (
      (currentUserId && authorId === currentUserId) ||
      (currentUsername && authorUsername === currentUsername)
    );
  });
});

const displayedPosts = computed(() => {
  if (currentTab.value === 'all' && authState.isAdmin) {
    return allPosts.value;
  }
  return myPosts.value;
});

function toggleCreateForm() {
  showCreateForm.value = !showCreateForm.value;
  if (showCreateForm.value) {
    editingBlog.value = null;
  }
}

async function fetchPosts() {
  loading.value = true;
  try {
    const res = await api.get('/blogs');
    allPosts.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    if (err.response?.status === 404) {
      allPosts.value = [];
    } else {
      notyf.error(err.response?.data?.message || 'Failed to fetch posts.');
    }
  } finally {
    loading.value = false;
  }
}

async function handleCreatePost(postData) {
  saving.value = true;
  try {
    const res = await api.post('/blogs/add', postData);
    notyf.success(res.data?.message || 'Blog post created successfully!');

    showCreateForm.value = false;
    await fetchPosts();
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to create post.';
    notyf.error(msg);
  } finally {
    saving.value = false;
  }
}

function startEdit(post) {
  editingBlog.value = post;
  showCreateForm.value = false;
  window.scrollTo({ top: 120, behavior: 'smooth' });
}

function cancelEdit() {
  editingBlog.value = null;
}

async function handleSaveEdit(postData) {
  saving.value = true;
  try {
    const res = await api.patch(`/blogs/edit/${editingBlog.value._id}`, postData);
    notyf.success(res.data?.message || 'Blog post updated successfully!');

    cancelEdit();
    await fetchPosts();
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to update post.';
    notyf.error(msg);
  } finally {
    saving.value = false;
  }
}

async function handleDelete(blogId) {
  if (!confirm('Are you sure you want to delete this blog post?')) return;

  try {
    const res = await api.delete(`/blogs/delete/${blogId}`);
    notyf.success(res.data?.message || 'Blog post deleted successfully.');
    allPosts.value = allPosts.value.filter((p) => p._id !== blogId);
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to delete post.';
    notyf.error(msg);
  }
}

onMounted(() => {
  fetchPosts();
  if (route.query.action === 'create') {
    showCreateForm.value = true;
  }
});
</script>

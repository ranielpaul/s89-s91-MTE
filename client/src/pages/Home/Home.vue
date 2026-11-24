<template>
  <div class="container">
    <!-- Hero Header -->
    <div class="p-5 mb-4 bg-light rounded-3 shadow-sm border text-center">
      <div class="container-fluid py-2">
        <h1 class="display-6 fw-bold text-dark mb-3">Welcome to BlogVlog</h1>
        <p class="col-md-8 mx-auto fs-6 text-muted mb-4">
          A modern blog and vlog platform built on the MEVN stack. Read stories, share your technical journeys, and engage with the developer community.
        </p>

        <div class="d-flex justify-content-center gap-2" v-if="!authState.isAuthenticated">
          <router-link to="/auth" class="btn btn-highlight px-4">
            Join the Community
          </router-link>
        </div>
        <div class="d-flex justify-content-center gap-2" v-else>
          <router-link to="/dashboard" class="btn btn-highlight px-4">
            Go to Dashboard & Write Post
          </router-link>
        </div>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="row align-items-center mb-4 g-3">
      <div class="col-md-6">
        <h3 class="h4 fw-bold mb-0 text-dark">
          Latest Posts:
          <span v-if="!loading" class="badge bg-highlight text-secondary px-3 align-middle">
            {{ filteredBlogs.length }}
          </span>
        </h3>
      </div>
      <div class="col-md-6">
        <div class="input-group">
          <span class="input-group-text bg-white border-end-0">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control border-start-0"
            placeholder="Search by title, author, or content..."
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="btn btn-outline-secondary"
            type="button"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-highlight" role="status">
        <span class="visually-hidden">Loading posts...</span>
      </div>
      <p class="mt-2 text-muted small">Loading blogs...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredBlogs.length === 0" class="alert alert-light border text-center py-5">
      <div class="fs-1 mb-2">📄</div>
      <h5 class="fw-bold text-dark">No blog posts found</h5>
      <p class="text-muted mb-3" v-if="searchQuery">
        No posts match your search query "<strong>{{ searchQuery }}</strong>".
      </p>
      <p class="text-muted mb-3" v-else>
        No posts have been published yet. Be the first to share one!
      </p>
      <router-link v-if="authState.isAuthenticated" to="/dashboard" class="btn btn-sm btn-highlight">
        Create a Blog Post
      </router-link>
      <router-link v-else to="/auth" class="btn btn-sm btn-highlight">
        Login to Publish
      </router-link>
    </div>

    <!-- Blog Grid -->
    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div v-for="blog in filteredBlogs" :key="blog._id" class="col">
        <BlogCard :blog="blog" @delete="handleDeletePost" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../../api';
import { authState } from '../../stores/auth';
import notyf from '../../utils/notyf';
import BlogCard from './components/BlogCard.vue';

const blogs = ref([]);
const loading = ref(true);
const searchQuery = ref('');

const filteredBlogs = computed(() => {
  if (!searchQuery.value.trim()) return blogs.value;
  const q = searchQuery.value.toLowerCase().trim();
  return blogs.value.filter((blog) => {
    const titleMatch = blog.title?.toLowerCase().includes(q);
    const contentMatch = blog.content?.toLowerCase().includes(q);
    const authorMatch = blog.author?.username?.toLowerCase().includes(q);
    return titleMatch || contentMatch || authorMatch;
  });
});

async function fetchBlogs() {
  loading.value = true;
  try {
    const res = await api.get('/blogs');
    blogs.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    if (err.response?.status === 404) {
      blogs.value = [];
    } else {
      notyf.error(err.response?.data?.message || 'Failed to fetch blog posts.');
    }
  } finally {
    loading.value = false;
  }
}

async function handleDeletePost(blogId) {
  if (!confirm('Are you sure you want to delete this blog post?')) return;

  try {
    const res = await api.delete(`/blogs/delete/${blogId}`);
    notyf.success(res.data?.message || 'Blog post deleted successfully.');
    blogs.value = blogs.value.filter((b) => b._id !== blogId);
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to delete post.';
    notyf.error(msg);
  }
}

onMounted(() => {
  fetchBlogs();
});
</script>

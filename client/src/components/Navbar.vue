<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-success sticky-top shadow-sm">
    <div class="container">
      <router-link to="/" class="navbar-brand fw-bold d-flex align-items-center">
        <span class="me-2">🌿</span>
        <span>Blog Bog</span>
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
        aria-controls="navbarContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link to="/" class="nav-link" active-class="active">Home</router-link>
          </li>
          <li class="nav-item" v-if="authState.isAuthenticated">
            <router-link to="/dashboard" class="nav-link" active-class="active">Dashboard</router-link>
          </li>
        </ul>

        <div class="d-flex align-items-center gap-2">
          <template v-if="authState.isAuthenticated">
            <span class="text-light small d-none d-md-inline fw-bold">
              Welcome
              <span v-if="authState.isAdmin" class="badge bg-highlight ms-1">Admin</span>
              <span v-else class="badge bg-highlight ms-1">Member</span>
            </span>

            <router-link to="/dashboard" class="btn btn-sm btn-highlight">
              + New Post
            </router-link>

            <button @click="handleLogout" class="btn btn-sm btn-highlight fw-bold text-light">
              Logout
            </button>
          </template>

          <template v-else>
            <router-link to="/auth" class="btn btn-sm btn-highlight">
              Login / Register
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { authState } from '../stores/auth';
import notyf from '../utils/notyf';

const router = useRouter();

function handleLogout() {
  authState.logout();
  notyf.success('You have been logged out successfully.');
  router.push('/');
}
</script>

<style scoped>
.navbar-brand {
  letter-spacing: 0.5px;
}

</style>

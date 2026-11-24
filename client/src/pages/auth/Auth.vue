<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4 p-md-5">
            <!-- Header Icon & Title -->
            <div class="text-center mb-4">
              <span class="fs-1">🔐</span>
              <h3 class="fw-bold text-dark mt-2">
                {{ isLogin ? 'Welcome Back' : 'Create an Account' }}
              </h3>
              <p class="text-muted small">
                {{ isLogin ? 'Enter your credentials to access your account' : 'Join our developer and blogger community today' }}
              </p>
            </div>

            <!-- Tab Switcher -->
            <ul class="nav nav-pills nav-fill mb-4 bg-light p-1 rounded">
              <li class="nav-item">
                <button
                  type="button"
                  class="nav-link text-highlight"
                  :class="{ active: isLogin }"
                  @click="switchMode(true)"
                >
                  Log In
                </button>
              </li>
              <li class="nav-item">
                <button
                  type="button"
                  class="nav-link text-highlight"
                  :class="{ active: !isLogin }"
                  @click="switchMode(false)"
                >
                  Register
                </button>
              </li>
            </ul>

            <!-- LOGIN FORM -->
            <form v-if="isLogin" @submit.prevent="handleLogin">
              <div class="mb-3">
                <label class="form-label small fw-semibold">Email address</label>
                <input
                  v-model="loginForm.email"
                  type="email"
                  class="form-control"
                  placeholder="name@mail.com"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Password</label>
                <input
                  v-model="loginForm.password"
                  type="password"
                  class="form-control"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                class="btn btn-highlight w-100 py-2 fw-semibold"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? 'Signing in...' : 'Sign In' }}
              </button>
            </form>

            <!-- REGISTER FORM -->
            <form v-else @submit.prevent="handleRegister">
              <div class="mb-3">
                <label class="form-label small fw-semibold">Username</label>
                <input
                  v-model="registerForm.username"
                  type="text"
                  class="form-control"
                  placeholder="johndoe"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Email address</label>
                <input
                  v-model="registerForm.email"
                  type="email"
                  class="form-control"
                  placeholder="name@mail.com"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Password</label>
                <input
                  v-model="registerForm.password"
                  type="password"
                  class="form-control"
                  placeholder="At least 8 characters"
                  minlength="8"
                  required
                />
                <div class="form-text">Must be at least 8 characters long.</div>
              </div>

              <button
                type="submit"
                class="btn btn-highlight w-100 py-2 fw-semibold"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? 'Creating Account...' : 'Create Account' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../../api';
import { authState } from '../../stores/auth';
import notyf from '../../utils/notyf';

const router = useRouter();
const route = useRoute();

const isLogin = ref(true);
const loading = ref(false);

const loginForm = ref({
  email: '',
  password: ''
});

const registerForm = ref({
  username: '',
  email: '',
  password: ''
});

function switchMode(login) {
  isLogin.value = login;
}
async function handleLogin() {
  loading.value = true;
  try {
    const res = await api.post('/users/login', {
      email: loginForm.value.email,
      password: loginForm.value.password
    });

    const token = res.data.access;
    authState.login(token);

    notyf.success(res.data.message || `Welcome back, ${authState.user?.username || 'User'}!`);

    const redirectTo = route.query.redirect || '/dashboard';
    router.push(redirectTo);
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Login failed. Please check your credentials.';
    notyf.error(msg);
  } finally {
    loading.value = false;
  }
}

async function handleRegister() {
  if (registerForm.value.password.length < 8) {
    notyf.error('Password must be at least 8 characters long.');
    return;
  }

  loading.value = true;
  try {
    const res = await api.post('/users/register', {
      username: registerForm.value.username,
      email: registerForm.value.email,
      password: registerForm.value.password
    });

    notyf.success(res.data.message || 'Registration successful! You can now log in.');

    loginForm.value.email = registerForm.value.email;
    loginForm.value.password = '';
    isLogin.value = true;
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Registration failed.';
    notyf.error(msg);
  } finally {
    loading.value = false;
  }
}
</script>

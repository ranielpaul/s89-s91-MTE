<template>
  <div class="app-layout d-flex flex-column min-vh-100">
    <Navbar />
    <main class="flex-grow-1 py-4">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
</script>

<style>
body {
  min-height: 100vh;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.cursor-pointer {
  cursor: pointer;
}
</style>

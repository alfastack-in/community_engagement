<template>
  <div>
    <nav class="p-4 bg-gray-100 flex gap-4">
      <router-link to="/">Home</router-link>
      <router-link to="/announcements">Announcements</router-link>
      <router-link to="/login">Login</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
// No logic needed
</script>

<style scoped>
nav a {
  text-decoration: none;
  color: #2563eb;
  font-weight: 500;
}
nav a.router-link-exact-active {
  color: #1d4ed8;
  border-bottom: 2px solid #1d4ed8;
}
</style> 
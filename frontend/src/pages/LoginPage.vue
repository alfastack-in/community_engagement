<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-6">
    <div class="bg-white rounded-lg shadow-md w-full max-w-md p-8">
      <h1 class="text-3xl font-bold text-center text-blue-700 mb-6">Login</h1>

      <form @submit.prevent="login" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="email"
            type="text"
            placeholder="Enter your email"
            class="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            class="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded mt-4 transition"
        >
          {{ loading ? "Logging in..." : "Login" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const router = useRouter()

async function login() {
  error.value = ''
  loading.value = true
  try {
    const res = await fetch('http://localhost:8000/api/method/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usr: email.value,
        pwd: password.value,
      }),
      credentials: 'include', // IMPORTANT to keep session cookie
    })

    const data = await res.json()
    if (!res.ok || data.exc || data.message === 'Logged In') {
      throw new Error(data.message || 'Login failed')
    }

    // Optional: fetch user info or token here
    await router.push('/announcements') // Redirect after login
  } catch (e) {
    error.value = e.message || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="h-screen flex items-center justify-center bg-gray-100">
    <form @submit.prevent="login" class="bg-white p-6 rounded-xl shadow w-full max-w-sm space-y-4">
      <h1 class="text-2xl font-bold text-center">Login</h1>

      <Input v-model="email" label="Email" placeholder="Enter your email" />
      <Input v-model="password" label="Password" type="password" placeholder="Enter your password" />

      <Button :loading="loading" type="submit" block>Login</Button>

      <p v-if="error" class="text-red-500 text-sm text-center mt-2">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Input, Button } from 'frappe-ui'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)

async function login() {
  loading.value = true
  error.value = null

  try {
    const res = await frappe.call('login', {
      type: 'POST',
      args: {
        usr: email.value,
        pwd: password.value,
      },
    })

    // On success → redirect to dashboard
    window.location.href = '/frontend/dashboard'
  } catch (err) {
    error.value = err?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-800">📢 Announcements</h1>
      <button
        @click="showModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
      >
        + New
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center text-gray-500">Loading...</div>

    <!-- Error -->
    <div v-else-if="error" class="text-center text-red-600">
      {{ error }}
    </div>

    <!-- Announcements List -->
    <div v-else>
      <div
        v-if="announcements.length"
        class="space-y-4"
      >
        <div
          v-for="item in announcements"
          :key="item.name"
          @click="selected = item"
          class="p-4 border rounded-lg hover:shadow cursor-pointer transition"
        >
          <h2 class="text-xl font-semibold text-blue-700">{{ item.title }}</h2>
          <p class="text-sm text-gray-500">By {{ item.owner }} • {{ formatDate(item.creation) }}</p>
          <p class="text-gray-700 mt-1 line-clamp-2">{{ item.content }}</p>
        </div>
      </div>
      <p v-else class="text-center text-gray-500">No announcements yet.</p>
    </div>

    <!-- Modal: View -->
    <div v-if="selected" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white max-w-md w-full p-6 rounded-lg shadow-lg relative">
        <button @click="selected = null" class="absolute top-2 right-3 text-xl text-gray-500">&times;</button>
        <h3 class="text-2xl font-bold">{{ selected.title }}</h3>
        <p class="text-sm text-gray-500 mb-4">By {{ selected.owner }} on {{ formatDate(selected.creation) }}</p>
        <p class="whitespace-pre-line text-gray-800">{{ selected.content }}</p>
      </div>
    </div>

    <!-- Modal: Create -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white max-w-md w-full p-6 rounded-lg shadow-lg relative">
        <button @click="showModal = false" class="absolute top-2 right-3 text-xl text-gray-500">&times;</button>
        <h3 class="text-2xl font-bold mb-4">New Announcement</h3>
        <form @submit.prevent="createAnnouncement" class="space-y-4">
          <input
            v-model="form.title"
            type="text"
            placeholder="Title"
            class="w-full border rounded px-3 py-2"
            required
          />
          <textarea
            v-model="form.content"
            placeholder="Content"
            class="w-full border rounded px-3 py-2"
            rows="4"
            required
          ></textarea>
          <div class="text-right">
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
            >
              {{ creating ? "Creating..." : "Create" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const announcements = ref([])
const loading = ref(true)
const error = ref('')
const showModal = ref(false)
const selected = ref(null)
const form = ref({ title: '', content: '' })
const creating = ref(false)

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString()
}

async function fetchAnnouncements() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('http://localhost:8000/api/method/community_engagement.api.get_latest_announcements')
    const data = await res.json()
    credentials:'include'
    announcements.value = data.message || []
  } catch (e) {
    error.value = 'Failed to load announcements.'
  }
  loading.value = false
}

async function createAnnouncement() {
  creating.value = true
  try {
    const res = await fetch('http://localhost:8000/api/method/community_engagement.api.create_announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
      credentials:'include'
    })
    if (!res.ok) throw new Error()
    showModal.value = false
    form.value = { title: '', content: '' }
    await fetchAnnouncements()
  } catch (e) {
    alert('Failed to create announcement.')
  }
  creating.value = false
}

onMounted(fetchAnnouncements)
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

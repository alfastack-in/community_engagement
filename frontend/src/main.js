import './index.css'

import { createApp } from 'vue'
import router from './router'
import App from './App.vue'

import {
  Button,
  Input,
  setConfig,
  frappeRequest,
  resourcesPlugin,
} from 'frappe-ui'

const app = createApp(App)

setConfig('resourceFetcher', frappeRequest)

app.use(router)
app.use(resourcesPlugin)

app.component('Button', Button)
app.component('Input', Input)

app.mount('#app')

// ✅ Manually add `window.frappe` global with basic call & session
window.frappe = {
  call: frappeRequest,
  session: {
    user: 'Guest',
  },
}

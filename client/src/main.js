import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Bootstrap CSS & JS bundle
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './assets/main.css'

// Notyf styles
import 'notyf/notyf.min.css';

const app = createApp(App);

app.use(router);
app.mount('#app');

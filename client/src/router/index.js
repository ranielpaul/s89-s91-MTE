import { createRouter, createWebHistory } from 'vue-router';
import { authState } from '../stores/auth';

import Home from '../pages/Home/Home.vue';
import Auth from '../pages/auth/Auth.vue';
import Dashboard from '../pages/dashboard/Index.vue';
import BlogDetail from '../pages/blog/BlogDetail.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/blogs/:id',
        name: 'BlogDetail',
        component: BlogDetail,
        props: true
    },
    {
        path: '/auth',
        name: 'Auth',
        component: Auth
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 };
    }
});

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !authState.isAuthenticated) {
        next({ name: 'Auth', query: { redirect: to.fullPath } });
    } else if (to.name === 'Auth' && authState.isAuthenticated) {
        next({ name: 'Dashboard' });
    } else {
        next();
    }
});

export default router;

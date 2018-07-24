import Main from '@/views/Main.vue';

// 登录页面
export const loginRouter = {
    path: '/login',
    name: 'login',
    meta: {
        title: 'Login - 登录'
    },
    component: () => import('@/views/Login.vue')
};

// 路由错误页面
export const page404 = {
    path: '*',
    name: 'error-404',
    meta: {
        title: '404-页面不存在'
    },
    component: () => import('@/views/404')
};

// 其他页面
export const otherRouter = {
    path: '/',
    name: 'otherRouter',
    redirect: '/home',
    component: Main,
    children: [
        { path: 'home', title: {i18n: 'home'}, name: 'home_index', component: () => import('@/views/home/Home') },
    ]
};

// app路由
export const appRouter = [
    
]


export const routes =  [
    loginRouter,
    page404,
    otherRouter
]
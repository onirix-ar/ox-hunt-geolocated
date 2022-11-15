import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue';
import RulesView from '../views/RulesView.vue';
import InitView from '../views/InitView.vue';
import LoginView from '../views/public/LoginView.vue';
import RegisterView from '../views/public/RegisterView.vue';
import RecoverPasswordView from '../views/public/RecoverPasswordView.vue';
import GameView from '../views/public/GameView.vue';
import RedeemView from '../views/RedeemView.vue';
import RedeemUserView from '../views/public/RedeemUserView.vue';
import authService from '../services/auth.service';
import ErrorDialogView from '../views/shared/ErrorDialogView.vue';

const PUBLIC_ROUTES = ['login', 'register', 'recover', 'notFound'];

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/recover', name: 'recover', component: RecoverPasswordView },
  { path: '/rules', name: 'rules', component: RulesView },
  { path: '/init', name: 'init', component: InitView },
  { path: '/play/', name: 'play', component: GameView },
  { path: '/redeemUser', name: 'redeemUser', component: RedeemUserView },
  { path: '/redeem', name: 'redeem', component: RedeemView },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/admin/AdminView.vue')
  },
  { path: '/:pathMatch(.*)*', name: 'notFound', component: ErrorDialogView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
    if (to.name === 'redeemUser' || to.name == 'admin') {
      next();
    } else if (!authService.isLoggedIn() && !authService.hasSeenInit()) {
      authService.clearAuth();
      authService.setInit();
      next({ name: 'init' });
    } else if (authService.isLoggedIn() && PUBLIC_ROUTES.includes(to.name)) {
      next({ name: 'home'});
    } else if (!authService.isLoggedIn() && !(PUBLIC_ROUTES.includes(to.name) || to.name === 'init')) {
      authService.clearAuth();
      next({ name: 'login'});
    }
    next();
});

export default router

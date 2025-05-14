import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import JsonTool from '../views/JsonTool.vue';
import Xlsx2Csv from '../views/Xlsx2Csv.vue';

const routes = [
  { path: '/home', component: Home },
  { path: '/', redirect: '/json' },
  { path: '/json', component: JsonTool },
  { path: '/xlsx2csv', component: Xlsx2Csv },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import JsonTool from '../views/JsonTool.vue';
import Xlsx2Csv from '../views/Xlsx2Csv.vue';
import Table2Json from "../views/Table2Json.vue";

const routes = [
  { path: '/home', component: Home },
  { path: '/', redirect: '/json' },
  { path: '/json', component: JsonTool },
  { path: '/table2json', component: Table2Json },
  { path: '/xlsx2csv', component: Xlsx2Csv },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

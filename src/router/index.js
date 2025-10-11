import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import JsonTool from '../views/JsonTool.vue';
import Xlsx2Csv from '../views/Xlsx2Csv.vue';
import Table2Json from "../views/Table2Json.vue";
import Go2Json from "@/views/Go2Json.vue";
import WordFinder from "@/views/WordFinder.vue";
import TimeTool from "@/views/TimeTool.vue";

const routes = [
  { path: '/home', component: Home },
  { path: '/', redirect: '/json' },
  { path: '/json', component: JsonTool },
  { path: '/table2json', component: Table2Json },
  { path: '/xlsx2csv', component: Xlsx2Csv },
  { path: '/go2json', component: Go2Json },
  { path: '/wordfinder', component: WordFinder },
  { path: '/timetool', component: TimeTool },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

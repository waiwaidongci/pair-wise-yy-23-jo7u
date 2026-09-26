import type { ComponentType } from "react";
import { LearnPage } from "../pages/LearnPage";
import { PracticePage } from "../pages/PracticePage";
import { MistakesPage } from "../pages/MistakesPage";
import { ProgressPage } from "../pages/ProgressPage";

export interface AppRoute {
  name: string;
  route: string;
  component: ComponentType;
}

export const routes: AppRoute[] = [
  { name: "学习卡片", route: "/learn", component: LearnPage },
  { name: "练习模式", route: "/practice", component: PracticePage },
  { name: "错题本", route: "/mistakes", component: MistakesPage },
  { name: "学习进度", route: "/progress", component: ProgressPage }
];

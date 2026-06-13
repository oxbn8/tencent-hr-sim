/** 首页 Hero 拼图 · 漫画风腾讯企鹅 × 四类 HR 角色（混元 AIGC） */
export type HeroPortrait = {
  src: string;
  name: string;
  title: string;
  objectPosition?: string;
  panelClass?: string;
};

export const HERO_PORTRAITS: HeroPortrait[] = [
  {
    src: "/hero/penguin-communicator.jpg",
    name: "沟通型 HR",
    title: "雇主品牌 · 对话与传播",
    objectPosition: "center center",
    panelClass: "tx-hero-panel-communicator",
  },
  {
    src: "/hero/penguin-creative.jpg",
    name: "创意型 HR",
    title: "AIGC 出图 · 视觉创意",
    objectPosition: "center center",
    panelClass: "tx-hero-panel-creative",
  },
  {
    src: "/hero/penguin-analyst.jpg",
    name: "分析型 HR",
    title: "数据洞察 · 人才分析",
    objectPosition: "center center",
    panelClass: "tx-hero-panel-analyst",
  },
  {
    src: "/hero/penguin-tech.jpg",
    name: "技术型 HR",
    title: "HR 数字化 · 技术赋能",
    objectPosition: "center center",
    panelClass: "tx-hero-panel-tech",
  },
];

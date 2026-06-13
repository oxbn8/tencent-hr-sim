import { useNavigate } from "react-router-dom";
import AiStatusBadge from "../components/AiStatusBadge";
import HeroPhotoCollage from "../components/HeroPhotoCollage";
import Layout from "../components/Layout";
import PenguinMascot from "../components/PenguinMascot";
import { loadSave } from "../store/save";

export default function Home() {
  const nav = useNavigate();
  const save = loadSave();

  return (
    <Layout hero>
      <div className="tx-hero-layout">
        <div className="tx-hero-upper">
          <HeroPhotoCollage />
          <section className="tx-hero-head">
            <div className="tx-page-center max-w-2xl text-center text-white">
              <div className="flex flex-col items-center gap-3 mb-4 tx-hero-head-fade">
                <PenguinMascot size={88} pose="wave" className="mb-1" />
                <AiStatusBadge />
              </div>
              <p className="text-sm opacity-95 mb-2 tx-hero-head-fade">腾讯 S3 · HR 与管理线 · 模拟实训</p>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 tx-hero-head-fade drop-shadow-sm">
                AI 赋能 HR 模拟场
              </h1>
              <p className="text-sm opacity-95 leading-relaxed max-w-md mx-auto tx-hero-head-fade">
                以培训生身份沿七日实训路线闯关 HR 实战。创意型在平台 AI Chat 中 AIGC 出图，系统分别评估成稿与 Prompt 质量。
              </p>
            </div>
          </section>
        </div>

        <div className="tx-hero-lower">
          <section className="tx-hero-cta">
            <div className="tx-page-center max-w-md">
              <div className="tx-card tx-hero-action-card p-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-4 text-sm text-slate-600">
                  <PenguinMascot size={36} pose="stand" />
                  <span>企鹅导师带你开启七日实训</span>
                </div>
                <div className="flex flex-col gap-3">
                  <button type="button" onClick={() => nav("/onboarding/org")} className="tx-btn-primary w-full">
                    开始实训
                  </button>
                  {save && (
                    <button type="button" onClick={() => nav("/game")} className="tx-btn-outline w-full">
                      继续进度 · Day {save.progress.current_day}
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-6">沟通型 + 创意型 HR · 培训生起始 · 六大事业群</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

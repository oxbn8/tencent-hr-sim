import { HERO_PORTRAITS } from "../data/heroPortraits";

const PANEL_BASE_DELAY = 0.08;
const PANEL_STAGGER = 0.2;

export default function HeroPhotoCollage() {
  return (
    <div className="tx-hero-collage" aria-hidden="true">
      {HERO_PORTRAITS.map((p, i) => {
        const delay = PANEL_BASE_DELAY + i * PANEL_STAGGER;
        return (
          <div
            key={p.src}
            className={`tx-hero-collage-panel ${p.panelClass ?? ""}`}
            style={{ animationDelay: `${delay}s` }}
          >
            <img
              src={p.src}
              alt=""
              loading="eager"
              decoding="async"
              draggable={false}
              className="tx-hero-collage-img"
              style={{
                objectPosition: p.objectPosition ?? "center bottom",
                animationDelay: `${delay + 0.12}s`,
              }}
            />
          </div>
        );
      })}
      <div className="tx-hero-collage-overlay" />
      <div className="tx-hero-collage-feather" />
    </div>
  );
}

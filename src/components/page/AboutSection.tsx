'use client'
import { useIsDark } from "@/hook/useIsDark";
import Module from "@/types/Module";

interface AboutSectionProps {
    modules: (Module & { _id: string })[];
    isAuthed: boolean;
}

function relativeDate(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "aujourd'hui";
    if (days === 1) return "hier";
    if (days < 7) return `il y a ${days} j`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `il y a ${weeks} sem.`;
    return `il y a ${Math.floor(days / 30)} mois`;
}

export default function AboutSection({ modules, isAuthed }: AboutSectionProps) {
    const isDark = useIsDark();

    const recentModules = [...modules]
        .filter(m => !m.isExtra)
        .sort((a, b) => {
            const aT = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const bT = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return bT - aT;
        })
        .slice(0, 3);

    const allSections = modules.flatMap(m => m.sections);
    const totalSections = allSections.length;
    const availableSections = allSections.filter(s => s.isAvailable).length;
    const progressPct = totalSections > 0
        ? Math.round((availableSections / totalSections) * 100)
        : 0;

    const heroImage = isDark
        ? "/images/header/escalier-dark.png"
        : "/images/header/escalier-light.png";

    const imageFade = isDark
        ? `linear-gradient(to right, #171512 0%, #171512 45%, rgba(23,21,18,0.6) 65%, transparent 100%)`
        : `linear-gradient(to right, #faf8f5 0%, #faf8f5 45%, rgba(250,248,245,0.6) 65%, transparent 100%)`;

    const textColor = isDark ? "#faf8f5" : "#1a1916";

    return (
        <>
            <style>{`
        .about-section {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-top: 1px solid var(--color-brand-gray-300, #e2ddd6);
          min-height: clamp(260px, 40vw, 560px);
        }
        .about-image-wrap {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .about-image-wrap img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: right center;
        }
        .about-image-fade {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .about-text {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding: clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3.5rem);
          width: 100%;
          box-sizing: border-box;
          max-width: 560px;
        }
        .about-rule {
          display: block;
          width: 2.5rem;
          height: 2px;
          background: var(--color-brand-primary, #c8a96e);
          border-radius: 2px;
          margin-bottom: 1.5rem;
        }
        .about-label {
          font-size: 0.7rem;
          font-family: var(--font-mono, monospace);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--color-brand-primary, #c8a96e);
          margin: 0 0 1rem;
        }
        .update-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }
        .update-item {
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
          font-size: 0.85rem;
        }
        .update-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--color-brand-primary, #c8a96e);
          flex-shrink: 0;
          margin-top: 0.35rem;
        }
        .update-name {
          flex: 1;
          font-weight: 500;
        }
        .update-date {
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          letter-spacing: 0.06em;
          color: var(--color-brand-gray-500, #9b9189);
          white-space: nowrap;
        }
        .block-separator {
          border: none;
          border-top: 1px solid rgba(200, 169, 110, 0.2);
          margin: 1.75rem 0;
          width: 100%;
        }
        .progress-text {
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .progress-bar-bg {
          height: 4px;
          background: rgba(128, 128, 128, 0.15);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.4rem;
        }
        .progress-bar-fill {
          height: 100%;
          background: var(--color-brand-primary, #c8a96e);
          border-radius: 4px;
          transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .progress-sub {
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          letter-spacing: 0.06em;
          color: var(--color-brand-gray-500, #9b9189);
        }
      `}</style>

            <section
                className="about-section"
                aria-label="Dernières mises à jour du programme"
            >
                <div className="about-image-wrap" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={heroImage} alt="" />
                    <div className="about-image-fade" style={{ background: imageFade }} />
                </div>

                <div className="about-text" style={{ color: textColor }}>
                    {/* Bloc 1 — Dernières mises à jour */}
                    <span className="about-rule" aria-hidden="true" />
                    <p className="about-label" aria-hidden="true">Dernières mises à jour</p>
                    <ul className="update-list">
                        {recentModules.map(mod => (
                            <li key={mod._id} className="update-item">
                                <span className="update-dot" aria-hidden="true" />
                                <span className="update-name">{mod.title}</span>
                                {mod.updatedAt && (
                                    <span className="update-date">
                                        {relativeDate(mod.updatedAt)}
                                    </span>
                                )}
                            </li>
                        ))}
                        {recentModules.length === 0 && (
                            <li className="update-item" style={{ opacity: 0.5 }}>
                                <span className="update-dot" aria-hidden="true" />
                                <span className="update-name">Aucun module disponible</span>
                            </li>
                        )}
                    </ul>

                    {/* Séparateur + Bloc 2 — Ma progression (connecté uniquement) */}
                    {isAuthed && totalSections > 0 && (
                        <>
                            <hr className="block-separator" aria-hidden="true" />
                            <p className="about-label" aria-hidden="true">Ma progression</p>
                            <p className="progress-text">
                                {availableSections} / {totalSections} sections déverrouillées
                            </p>
                            <div
                                className="progress-bar-bg"
                                role="progressbar"
                                aria-valuenow={progressPct}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`${progressPct}% du programme déverrouillé`}
                            >
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                            <p className="progress-sub">
                                {totalSections - availableSections} section
                                {totalSections - availableSections !== 1 ? 's' : ''} en attente
                            </p>
                        </>
                    )}
                </div>
            </section>
        </>
    );
}

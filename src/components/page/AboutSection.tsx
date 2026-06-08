'use client'
import { useMemo } from "react";
import Image from "next/image";
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

    const recentModules = useMemo(() =>
        [...modules]
            .filter(m => !m.isExtra)
            .sort((a, b) => {
                const aT = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
                const bT = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
                return bT - aT;
            })
            .slice(0, 3),
        [modules]
    );

    const { totalSections, availableSections, progressPct } = useMemo(() => {
        const allSections = modules.flatMap(m => m.sections);
        const total = allSections.length;
        const available = allSections.filter(s => s.isAvailable).length;
        return {
            totalSections: total,
            availableSections: available,
            progressPct: total > 0 ? Math.round((available / total) * 100) : 0,
        };
    }, [modules]);

    const heroImage = isDark
        ? "/images/header/escalier-dark.png"
        : "/images/header/escalier-light.png";

    // Extended solid zone (55%) and longer transition (75→90%) so text at max-width 560px
    // stays inside a covered zone on viewports ≥1024px, and partially covered on smaller ones.
    const bgVar = isDark ? "var(--color-brand-dark)" : "var(--color-brand-light)";
    const imageFade = `linear-gradient(to right, ${bgVar} 0%, ${bgVar} 55%, color-mix(in srgb, ${bgVar} 55%, transparent) 75%, transparent 90%)`;

    const textColor = isDark ? "var(--color-brand-light)" : "var(--color-brand-dark)";

    return (
        <>
            <style>{`
        :root {
          --about-mobile-overlay: color-mix(in srgb, var(--color-brand-light) 90%, transparent);
        }
        .dark {
          --about-mobile-overlay: color-mix(in srgb, var(--color-brand-dark) 90%, transparent);
        }
        .about-section {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-top: 1px solid var(--color-brand-gray-300);
          min-height: clamp(260px, 40vw, 560px);
        }
        .about-image-wrap {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .about-image-fade {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .about-mobile-overlay {
          display: none;
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        @media (max-width: 639px) {
          .about-mobile-overlay {
            display: block;
            background: var(--about-mobile-overlay);
          }
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
          background: var(--color-brand-primary);
          border-radius: 2px;
          margin-bottom: 1.5rem;
        }
        .about-label {
          font-size: 0.7rem;
          font-family: var(--font-mono, monospace);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--color-brand-primary);
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
          background: var(--color-brand-primary);
          flex-shrink: 0;
          margin-top: 0.35rem;
        }
        .update-name {
          flex: 1;
          min-width: 0;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .update-date {
          font-family: var(--font-mono, monospace);
          font-size: 0.7rem;
          letter-spacing: 0.06em;
          color: var(--color-brand-gray-500);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .block-separator {
          border: none;
          border-top: 1px solid color-mix(in srgb, var(--color-brand-primary) 20%, transparent);
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
          background: color-mix(in srgb, var(--color-brand-gray-500) 20%, transparent);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.4rem;
        }
        .progress-bar-fill {
          height: 100%;
          background: var(--color-brand-primary);
          border-radius: 4px;
          transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .progress-sub {
          font-family: var(--font-mono, monospace);
          font-size: 0.7rem;
          letter-spacing: 0.06em;
          color: var(--color-brand-gray-500);
        }
      `}</style>

            <section
                className="about-section"
                aria-label="Dernières mises à jour du programme"
            >
                <div className="about-image-wrap" aria-hidden="true">
                    <Image
                        src={heroImage}
                        alt=""
                        fill
                        priority={false}
                        sizes="100vw"
                        style={{ objectFit: 'cover', objectPosition: 'right center' }}
                    />
                    <div className="about-image-fade" style={{ background: imageFade }} />
                    <div className="about-mobile-overlay" />
                </div>

                <div className="about-text" style={{ color: textColor }}>
                    {/* Bloc 1 — Dernières mises à jour */}
                    <span className="about-rule" aria-hidden="true" />
                    <p id="updates-label" className="about-label">Dernières mises à jour</p>
                    <ul className="update-list" aria-labelledby="updates-label">
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
                            <p id="progress-label" className="about-label">Ma progression</p>
                            <p className="progress-text" aria-describedby="progress-label">
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

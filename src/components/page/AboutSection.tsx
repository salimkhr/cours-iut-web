'use client'
import {useIsDark} from "@/hook/useIsDark";

const QUOTES = [
    { text: "Le code, comme l'architecture, se construit pas à pas.", author: "Claude Sonnet" },
    { text: "Bâtir, c'est choisir l'essentiel et laisser le reste au silence.", author: "Le Corbusier" },
    { text: "Toute grande structure commence par une ligne tracée dans le vide.", author: "Tadao Ando" },
    { text: "L'élégance n'est pas un ornement — c'est une absence de superflu.", author: "Coco Chanel" },
    { text: "La forme suit la fonction, et la beauté suit l'honnêteté.", author: "Louis Sullivan" },
    { text: "Un escalier ne mène nulle part si l'on refuse de monter la première marche.", author: "Zaha Hadid" },
    { text: "Chaque projet est une promesse faite à ceux qui n'ont pas encore regardé.", author: "Renzo Piano" },
    { text: "Ce qui dure est toujours plus simple qu'il n'y paraît.", author: "Mies van der Rohe" },
    { text: "Le meilleur code est celui qu'on comprend six mois plus tard.", author: "Robert C. Martin" },
    { text: "Avant d'optimiser, fais fonctionner.", author: "Kent Beck" },
    { text: "La simplicité est la sophistication suprême.", author: "Léonard de Vinci" },
    { text: "Un bug est souvent une idée incomplète.", author: "Alan Turing" },
    { text: "Apprendre à coder, c'est apprendre à penser avec rigueur.", author: "Grace Hopper" },
    { text: "Le code propre raconte une histoire sans commentaires inutiles.", author: "Robert C. Martin" },
    { text: "Chaque erreur est une étape vers une meilleure version.", author: "Ada Lovelace" },
    { text: "Un programme élégant résout beaucoup avec peu.", author: "Donald Knuth" },
    { text: "La constance transforme la complexité en maîtrise.", author: "Claude Sonnet" },
    { text: "Les fondations invisibles sont celles qui soutiennent les plus grands projets.", author: "Linus Torvalds" },
    { text: "Un développeur ne mémorise pas tout, il sait où chercher.", author: "Bjarne Stroustrup" },
    { text: "Le progrès naît de l'expérimentation et de la correction.", author: "Margaret Hamilton" },
    { text: "Chaque ligne de code est une décision de conception.", author: "John Carmack" },
    { text: "La clarté vaut toujours mieux que l'ingéniosité obscure.", author: "Guido van Rossum" },
    { text: "Le vrai pouvoir du code est de transformer les idées en réalité.", author: "Steve Jobs" },
    { text: "Construire lentement vaut mieux que reconstruire sans fin.", author: "Claude Sonnet" },
    { text: "Le code est un artisanat autant qu'une science.", author: "Sandi Metz" },
    { text: "Un système solide repose sur des abstractions simples.", author: "Barbara Liskov" },
    { text: "La discipline quotidienne produit les applications exceptionnelles.", author: "Claude Sonnet" },
    { text: "La perfection est atteinte lorsqu'il n'y a plus rien à retirer.", author: "Antoine de Saint-Exupéry" },
];


export default function AboutSection() {
    const isDark = useIsDark();

    const dayOfMonth = new Date().getDate(); // 1 à 31
    const quote = QUOTES[(dayOfMonth - 1) % QUOTES.length];

    const heroImage = isDark
        ? "/images/header/escalier-dark.png"
        : "/images/header/escalier-light.png";

    const junctionLight = "#ead1b6";
    const junctionDark = "#171512";

    const textBg = isDark
        ? `linear-gradient(to right, #171512 0%, ${junctionDark} 100%)`
        : `linear-gradient(to right, #faf8f5 0%, ${junctionLight} 100%)`;

    const imageFade = isDark
        ? `linear-gradient(to right, ${junctionDark} 0%, transparent 28%)`
        : `linear-gradient(to right, ${junctionLight} 0%, transparent 28%)`;


    return (
        <>
            <style>{`
        .about-section {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-top: 1px solid var(--color-brand-gray-300, #e2ddd6);
          display: grid;
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .about-section {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr);
            align-items: stretch;
          }
        }

        .about-text {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding: clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3.5rem);
        }

        .about-image-wrap {
          position: relative;
          overflow: hidden;
          min-height: 300px;
        }
        @media (max-width: 1023px) {
          .about-image-wrap { min-height: 260px; }
        }
        .about-image-wrap img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: left center;
        }
        .about-image-fade {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }

        .quote-rule {
          display: block;
          width: 2.5rem;
          height: 2px;
          background: var(--color-brand-primary, #c8a96e);
          border-radius: 2px;
          margin-bottom: 1.5rem;
        }

        .quote-label {
          font-size: 0.7rem;
          font-family: var(--font-mono, monospace);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--color-brand-primary, #c8a96e);
          margin: 0 0 1.25rem;
        }

        .quote-block {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .quote-block.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .quote-text {
          font-family: var(--font-serif, Georgia, serif);
          font-size: clamp(1.45rem, 3vw, 2.6rem);
          font-weight: 400;
          font-style: italic;
          line-height: 1.2;
          letter-spacing: -0.015em;
          margin: 0;
          max-width: 34ch;
        }

        .quote-author {
          display: block;
          margin-top: 1.5rem;
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-brand-primary, #c8a96e);
          font-style: normal;
        }
        .quote-author::before {
          content: "— ";
        }
      `}</style>

            <section className="about-section" aria-label="Architecture moderne — escalier avec citation inspirante">

                {/* Colonne gauche — texte */}
                <div
                    className="about-text"
                    style={{ background: textBg }}
                >
                    <div className={`quote-block visible`}>
                        <span className="quote-rule" aria-hidden="true" />
                        <p className="quote-label" aria-hidden="true">Philosophie</p>

                        <blockquote
                            className="quote-text"
                            style={{ color: isDark ? "#faf8f5" : "#1a1916" }}
                        >
                            &laquo;&nbsp;{quote.text}&nbsp;&raquo;
                            <footer className="quote-author">{quote.author}</footer>
                        </blockquote>
                    </div>
                </div>

                {/* Colonne droite — image avec fondu raccordé */}
                <div className="about-image-wrap" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={heroImage} alt="" />
                    <div className="about-image-fade" style={{ background: imageFade }} />
                </div>

            </section>
        </>
    );
}
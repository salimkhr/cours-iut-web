export default function AboutSection() {
    return (
        <section
            role="img"
            aria-label="Architecture moderne — escalier"
            className="relative w-full bg-no-repeat bg-right-bottom bg-contain lg:min-h-[60vh] overflow-hidden border-t border-brand-gray-300 dark:border-brand-gray-700"
            style={{backgroundImage: "url(/images/header/escalier.png)"}}
        >
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-brand-light via-brand-light/85 to-transparent dark:from-brand-dark dark:via-brand-dark/85 dark:to-transparent z-0"
            />

            <div
                className="relative z-10 flex flex-col items-start justify-center px-6 lg:pl-12 lg:pr-6 py-16 lg:py-24 lg:min-h-[60vh] opacity-0 animate-fade-in">
                <div className="w-full">
                    {/* TODO: remplacer par le générateur aléatoire (citation / accroche) */}
                    <blockquote
                        data-placeholder="random-quote"
                        className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium italic tracking-tight leading-[1.1] text-brand-dark dark:text-brand-light max-w-5xl">
                        « Le code, comme l&apos;architecture, se construit pas à pas. »
                    </blockquote>

                    <span aria-hidden="true" className="block w-16 h-1 bg-brand-primary rounded-full mt-6"/>
                </div>
            </div>
        </section>
    );
}

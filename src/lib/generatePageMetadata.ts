import {Metadata} from "next";
import Section from "@/types/Section";
import Module from "@/types/Module";

export function generatePageMetadata({
                                         currentModule,
                                         currentSection,
                                         defaultTitle = "Module non trouvé",
                                         noIndex = false,
                                         defaultImageUrl = "https://salimkhraimeche.dev/images/header.png",
                                     }: {
    currentModule?: Module;
    currentSection?: Section;
    defaultTitle?: string;
    noIndex?: boolean;
    defaultImageUrl?: string;
}): Metadata {
    // Titre et description
    const title = currentModule
        ? currentSection
            ? `${currentModule.title} | ${currentSection.title}`
            : currentModule.title
        : defaultTitle;

    const description =
        currentModule?.description || `Maîtrisez le développement web front-end et back-end`;

    // URL et image
    const url = currentModule
        ? `https://salimkhraimeche.dev/${currentModule.path}${
            currentSection ? `/${currentSection.path}` : ""
        }`
        : "https://salimkhraimeche.dev";

    const imageUrl = currentModule
        ? `https://salimkhraimeche.dev/images/header/header_${currentModule.path}.png`
        : defaultImageUrl;

    return {
        title,
        description,
        robots: noIndex
            ? {
                index: false,
                follow: false,
                googleBot: {
                    index: false,
                    follow: false,
                    noimageindex: true,
                },
            }
            : {index: true, follow: true},
        openGraph: {
            title,
            description,
            url,
            siteName: "Salim Khraimeche",
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale: "fr_FR",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [imageUrl],
        },
    };
}
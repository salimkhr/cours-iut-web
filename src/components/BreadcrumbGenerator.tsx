import * as React from "react"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Module from "@/types/Module";
import Section from "@/types/Section";

interface BreadcrumbPageProps {
    currentModule: Module;
    currentSection?: Section;
    currentContent?: string;
    className?: string;
}

export default function BreadcrumbGenerator({currentModule, currentSection, currentContent, className}: BreadcrumbPageProps) {
    return (
        <Breadcrumb className={className}>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator/>

                <BreadcrumbItem>
                    {currentSection || currentContent ? (
                        <BreadcrumbLink href={`/${currentModule?.path}`}>
                            {currentModule?.title}
                        </BreadcrumbLink>
                    ) : (
                        <BreadcrumbPage>{currentModule?.title}</BreadcrumbPage>
                    )}
                </BreadcrumbItem>

                {currentSection && (
                    <>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            {currentContent ? (
                                <BreadcrumbLink href={`/${currentModule?.path}/${currentSection?.path}`}>
                                    {currentSection?.title}
                                </BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage>{currentSection?.title}</BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                    </>
                )}

                {currentContent && (
                    <>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{currentContent}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
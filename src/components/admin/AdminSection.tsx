'use client';

import Section from "@/types/Section";

interface AdminSectionProps {
    section: Section;
}

export default function AdminSection({section}: AdminSectionProps) {
    return (
        <div className="border rounded p-4">
            <h3 className="font-semibold text-lg">{section.title}</h3>
            <ul className="list-disc list-inside space-y-1">
                {section.contents !== undefined && section.contents.length > 0 ? section.contents.map(content => (
                    <li key={`${section.path}-${content}`}>
                        <strong>{content}</strong>
                    </li>
                )) : 'Aucun contenu disponible.'}
            </ul>
        </div>
    );
}
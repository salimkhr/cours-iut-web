import React, {useEffect, useState} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import CodeCard from "@/components/Cards/CodeCard";
import Code from "@/components/ui/Code";
import Module from "@/types/module";
import useAdminApi from "@/hook/admin/useAdminApi";
import Heading from "@/components/ui/Heading";

interface ShowQuestionProps {
    question?: {
        text: string;
    };
    currentModule?: string;
}

export default function ShowQuestion({question, currentModule}: ShowQuestionProps) {
    const {listModules} = useAdminApi();
    const [module, setModule] = useState<Module>();

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const modulesList = await listModules();
                setModule(modulesList.find(mod => mod._id === currentModule));
                console.log(modulesList, currentModule);
            } catch (error) {
                console.error("Erreur lors du chargement des modules:", error);
            }
        };

        fetchModules();
        // pas utile d'ajouter listModules
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!question) return null;

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
                h1({children}) {
                    return (<Heading level={1}>{children}</Heading>)
                },
                h2({children}) {
                    return (<Heading level={2}>{children}</Heading>)
                },
                h3({children}) {
                    return (<Heading level={3}>{children}</Heading>)
                },
                h4({children}) {
                    return (<Heading level={4}>{children}</Heading>)
                },
                h5({children}) {
                    return (<Heading level={5}>{children}</Heading>)
                },
                h6({children}) {
                    return (<Heading level={6}>{children}</Heading>)
                },
                pre({node}) {
                    const codeNode = node?.children[0];

                    if (
                        codeNode &&
                        typeof codeNode === "object" &&
                        "tagName" in codeNode &&
                        codeNode?.tagName === "code"
                    ) {
                        if ("properties" in codeNode) {
                            const langClass = codeNode.properties.className || "";
                            const lang = (langClass + "").replace("language-", "") || "bash";

                            const code =
                                typeof codeNode.children === "string"
                                    ? codeNode.children
                                    : Array.isArray(codeNode.children)
                                        ? codeNode.children
                                            .filter(
                                                (c): c is { type: "text"; value: string } =>
                                                    c.type === "text" && "value" in c
                                            )
                                            .map((c) => c.value)
                                            .join("")
                                        : "";

                            return (
                                <div className="w-full px-20">
                                    <CodeCard currentModule={module} language={lang}>
                                        {code}
                                    </CodeCard>
                                </div>
                            );
                        }
                    }

                    return <pre></pre>;
                },
                code({children, ...props}) {
                    return (
                        <Code className="bg-muted px-1 rounded text-sm" {...props}>
                            {children}
                        </Code>
                    );
                },
            }}
        >
            {question.text}
        </ReactMarkdown>
    );
}
"use client";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import {Bot, User} from "lucide-react";
import {cn} from "@/lib/utils";
import {Message as MessageType} from "@/lib/store/useChatStore";
import Module from "@/types/module";
import Code from "@/components/ui/Code";
import CodeCard from "@/components/Cards/CodeCard";

export default function Message({
                                    msg,
                                    isLastBotTyping,
                                    currentModule,
                                }: {
    msg: MessageType;
    isLastBotTyping: boolean;
    currentModule?: Module;
}) {
    return (
        <div className={cn("flex items-start", currentModule ? "w-[420px]" : '')}>
            {msg.from === "bot" && (
                <div className="p-2 bg-muted rounded-full">
                    <Bot className="h-4 w-4 text-muted-foreground"/>
                </div>
            )}
            <div
                style={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}
                className={cn(
                    "relative w-[75%] p-3 rounded-lg text-sm overflow-scroll",
                    msg.from === "user"
                        ? `bg-${currentModule !== undefined ? currentModule.path : "module"} text-white ml-auto`
                        : "bg-gray-200 text-foreground"
                )}
            >
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{

                        pre({node}) {
                            const codeNode = node?.children[0];

                            if (
                                codeNode &&
                                typeof codeNode === "object" &&
                                "tagName" in codeNode && codeNode?.tagName === "code"
                            ) {
                                if ("properties" in codeNode) {
                                    const langClass = codeNode.properties.className || "";
                                    const lang = (langClass + '').replace("language-", "") || "bash";

                                    const code =
                                        typeof codeNode.children === "string"
                                            ? codeNode.children
                                            : Array.isArray(codeNode.children)
                                                ? codeNode.children
                                                    .filter((c): c is {
                                                        type: 'text';
                                                        value: string
                                                    } => c.type === 'text' && 'value' in c)
                                                    .map((c) => c.value)
                                                    .join('')
                                                : "";

                                    return <CodeCard currentModule={currentModule} language={lang}>{code}</CodeCard>;
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
                    {msg.text}
                </ReactMarkdown>

                {isLastBotTyping && msg.from === "bot" && (
                    <div className="bg-gray-200 text-foreground p-2 rounded-lg text-sm italic">
                        Génération en cours ...
                    </div>
                )}

                <span className="block text-[10px] text-muted-foreground mt-1 text-right">
          {msg.timestamp}
        </span>
            </div>
            {msg.from === "user" && (
                <div className="p-2 bg-muted rounded-full">
                    <User className="h-4 w-4 text-muted-foreground"/>
                </div>
            )}
        </div>
    );
}

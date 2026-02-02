"use client"
import {useEffect, useRef, useState} from "react";
import {useChatStore} from "@/lib/store/useChatStore";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Textarea} from "@/components/ui/textarea";
import {AppWindow, Bot, Send, Trash} from "lucide-react";
import Message from "@/components/ia/Message";
import useChatHandler from "@/hook/ia/useChatHandler";
import Module from "@/types/Module";
import {cn} from "@/lib/utils";

interface ChatBoxProps {
    currentModule?: Module;
    variant?: 'inline' | 'fullpage';
    showOpenButton?: boolean;
    height?: string;
    className?: string;
}

export default function ChatBox({
                                    currentModule,
                                    variant = 'inline',
                                    showOpenButton = true,
                                    height,
                                    className
                                }: ChatBoxProps) {
    const {messages, clearMessages} = useChatStore();
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const {sendMessage, isTyping} = useChatHandler();

    const openMessages = () => {
        window.open('/chat', '_blank');
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages, isTyping]);

    const nbMessage = messages.length;

    // Configuration basée sur la variante
    const config = {
        inline: {
            containerClass: "flex flex-col h-full",
            scrollAreaClass: "px-4 pt-2",
            formClass: "pt-2 flex gap-2 px-4 pb-4",
            sendButtonClass: "absolute bottom-4 right-4 h-8 w-8 p-0",
            clearButtonClass: "absolute top-2 right-10 z-10",
            openButtonClass: "absolute top-2 right-23 z-10"
        },
        fullpage: {
            containerClass: "flex flex-col h-[85vh]",
            scrollAreaClass: "flex-1 px-4 pt-2 pb-20 overflow-hidden",
            formClass: "bg-white p-0 flex gap-2 absolute bottom-10 left-[2%] pb-5 w-[96%]",
            sendButtonClass: "absolute bottom-4 right-4 h-8 w-8 p-0",
            clearButtonClass: "absolute top-2 right-10 z-10",
            openButtonClass: "absolute top-2 right-23 z-10"
        }
    };

    const currentConfig = config[variant];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isTyping && input.trim()) {
            sendMessage(input);
            setInput("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!isTyping && input.trim()) {
                sendMessage(input);
                setInput("");
            }
        }
    };

    return (
        <div className={cn(currentConfig.containerClass, height && `h-${height}`, className)}>
            {/* Bouton Clear */}
            <Button
                variant="outline"
                onClick={clearMessages}
                className={cn(
                    currentConfig.clearButtonClass,
                    `border-${currentModule?.path}`,
                    `text-${currentModule?.path}`
                )}
                aria-label="Effacer la conversation"
            >
                <Trash className="h-5 w-5"/>
            </Button>

            {/* Bouton Open (conditionnel) */}
            {showOpenButton && variant === 'inline' && (
                <Button
                    variant="outline"
                    onClick={openMessages}
                    className={cn(
                        currentConfig.openButtonClass,
                        `border-${currentModule?.path}`,
                        `text-${currentModule?.path}`
                    )}
                    aria-label="Ouvrir en grand"
                >
                    <AppWindow className="h-5 w-5"/>
                </Button>
            )}

            {/* Zone de messages */}
            <ScrollArea className={currentConfig.scrollAreaClass}>
                <div className="space-y-4">
                    {messages.map((msg, i) => (
                        <Message
                            key={i}
                            msg={msg}
                            isLastBotTyping={isTyping && nbMessage - 1 === i}
                            currentModule={currentModule}
                        />
                    ))}

                    {/* Message par défaut pour la version fullpage */}
                    {variant === 'fullpage' && messages.length === 0 && (
                        <Message
                            msg={{from: 'bot', text: 'Aucun message', timestamp: ''}}
                            isLastBotTyping={false}
                        />
                    )}

                    {/* Indicateur de frappe */}
                    {isTyping && messages[nbMessage - 1]?.from === "user" && (
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-muted rounded-full">
                                <Bot className="h-4 w-4 text-muted-foreground animate-pulse"/>
                            </div>
                            Génération en cours ...
                        </div>
                    )}

                    <div ref={scrollRef}/>
                </div>
            </ScrollArea>

            {/* Formulaire d'input */}
            <form className={currentConfig.formClass} onSubmit={handleSubmit}>
                <Textarea
                    placeholder="Écris un message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={1}
                    className={cn("resize-none pr-12", `border-${currentModule?.path}`)}
                    onKeyDown={handleKeyDown}
                />
                <Button
                    variant="ghost"
                    type="submit"
                    disabled={isTyping || !input.trim()}
                    className={cn(currentConfig.sendButtonClass, `text-${currentModule?.path}`)}
                >
                    <Send className="h-4 w-4"/>
                </Button>
            </form>
        </div>
    );
}
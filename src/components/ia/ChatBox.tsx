import {useEffect, useRef, useState} from "react";
import {useChatStore} from "@/lib/store/useChatStore";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Textarea} from "@/components/ui/textarea";
import {Bot, Send, Trash} from "lucide-react";
import Message from "./Message";
import useChatHandler from "@/hook/ia/useChatHandler";
import {Module} from "@/types/module";
import {cn} from "@/lib/utils";


interface ChatBoxProps {
    currentModule?: Module;
}

export default function ChatBox({currentModule}: ChatBoxProps) {
    const {messages, clearMessages} = useChatStore();
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const {sendMessage, isTyping} = useChatHandler();

    useEffect(() => {
        scrollRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages, isTyping]);

    const nbMessage = messages.length;

    return (
        <div className="flex flex-col h-full">
            <Button
                variant="outline"
                onClick={clearMessages}
                className={cn("absolute top-2 right-10 z-10", `border-${currentModule?.path}`, `text-${currentModule?.path}`)}
                aria-label="Effacer la conversation"
            >
                <Trash className="h-5 w-5"/>
            </Button>
            <ScrollArea className="flex-1 px-4 pt-2">
                <div className="space-y-4">
                    {messages.map((msg, i) => (
                        <Message
                            key={i}
                            msg={msg}
                            isLastBotTyping={isTyping && nbMessage - 1 === i}
                            currentModule={currentModule}
                        />
                    ))}

                    {isTyping && messages[nbMessage - 1].from === "user" && (
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

            <form
                className="pt-2 flex gap-2 px-4 pb-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage(input);
                    setInput("");
                }}
            >
                <Textarea
                    placeholder="Écris un message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={1}
                    className={cn("resize-none pr-12", `border-${currentModule?.path}`)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault(); // Empêche le saut de ligne
                            // Soumet le formulaire, ici on appelle la fonction d'envoi
                            if (!isTyping && input.trim()) {
                                sendMessage(input);
                                setInput("");
                            }
                        }
                    }}
                />
                <Button
                    variant="ghost"
                    type="submit"
                    disabled={isTyping || !input.trim()}
                    className={cn("absolute bottom-4 right-4 h-8 w-8 p-0", `text-${currentModule?.path}`)}
                >
                    <Send className="h-4 w-4"/>
                </Button>
            </form>
        </div>
    );
}

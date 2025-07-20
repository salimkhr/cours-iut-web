import {Bot, User} from "lucide-react";
import {cn} from "@/lib/utils";
import {Message as MessageType} from "@/lib/store/useChatStore";
import {Module} from "@/types/module";


export default function Message({msg, isLastBotTyping, currentModule}: {
    msg: MessageType;
    isLastBotTyping: boolean,
    currentModule?: Module
}) {
    return (
        <div className="flex items-start space-x-2">
            {msg.from === "bot" && (
                <div className="p-2 bg-muted rounded-full">
                    <Bot className="h-4 w-4 text-muted-foreground"/>
                </div>
            )}
            <div
                style={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}
                className={cn(
                    "relative max-w-[75%] p-3 rounded-lg text-sm",
                    msg.from === "user"
                        ? `bg-${currentModule?.path} text-white ml-auto`
                        : "bg-gray-200 text-foreground"
                )}
            >
                {msg.text}
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

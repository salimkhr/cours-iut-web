"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,} from "@/components/ui/sheet";
import {MessageSquare} from "lucide-react";
import ChatBox from "@/components/ia/ChatBox";
import Module from "@/types/module";

interface ChatWidgetProps {
    currentModule?: Module;
}

export default function ChatWidget({currentModule}: ChatWidgetProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="fixed bottom-20 right-4 z-50">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button
                        className="rounded-full p-3 shadow-lg"
                        variant="default"
                        aria-label="Ouvrir le chatbot"
                    >
                        <MessageSquare className="w-5 h-5"/>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="sm:max-w-md w-full flex flex-col bg-white">
                    <SheetHeader>
                        <SheetTitle className={"hea"}>Assistant IA</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto pt-4">
                        <ChatBox currentModule={currentModule}/>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

'use client'
import Text from "@/components/ui/Text";
import {useEffect, useState} from "react";

export default function KeyPressBox() {
    const [pressedKeys, setPressedKeys] = useState("");

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            let keys = [];

            if (event.ctrlKey) keys.push("Ctrl");
            if (event.shiftKey) keys.push("Shift");
            if (event.altKey) keys.push("Alt");
            if (event.metaKey) keys.push("Meta"); // Command sur Mac

            // Ajouter la touche pressée si ce n'est pas juste un modificateur
            if (!["Control", "Shift", "Alt", "Meta"].includes(event.key)) {
                keys.push(event.key);
            }

            if (keys.length > 0) {
                setPressedKeys(keys.join(" + "));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="h-32 border rounded-lg flex items-center justify-center text-sm">
            <Text>
                {pressedKeys ? `Touche(s) pressée(s) : ${pressedKeys}` : "Appuyez sur une touche"}
            </Text>
        </div>
    );
}

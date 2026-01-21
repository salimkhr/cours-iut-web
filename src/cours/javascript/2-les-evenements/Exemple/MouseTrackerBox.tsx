'use client';
import Text from "@/components/ui/Text";
import {useState} from "react";

export default function MouseTrackerBox() {
    const [pos, setPos] = useState({x: 0, y: 0});

    return (
        <div
            onMouseMove={(e) =>
                setPos({x: e.clientX, y: e.clientY})
            }
            className="h-32 border rounded-lg flex items-center justify-center text-sm"
        >
            <Text>X: {pos.x} — Y: {pos.y}</Text>
        </div>
    );
}

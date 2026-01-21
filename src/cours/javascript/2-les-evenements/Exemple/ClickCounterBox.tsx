'use client'
import {useState} from "react";
import {Button} from "@/components/ui/button";

export default function ClickCounterBox() {
    const [count, setCount] = useState(0);

    return (
        <Button
            variant="outline"
            size="sm" onClick={() => setCount(count + 1)}>
            Cliqué {count} fois
        </Button>
    );
}

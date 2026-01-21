'use client';

import {Button} from "@/components/ui/button";
import React from "react";

export default function ColorClickableBox() {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={(e) =>
                (e.currentTarget.style.backgroundColor = "lightblue")
            }
        >
            Clique ici
        </Button>
    );
}

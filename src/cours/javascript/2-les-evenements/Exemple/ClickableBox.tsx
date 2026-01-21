'use client';

import {Button} from "@/components/ui/button";
import React from "react";

export default function ClickableBox() {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => {
                alert("Bouton cliqué !");
                alert("Clic détecté");
            }}
        >
            Clique ici
        </Button>
    );
}

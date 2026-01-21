'use client'

import {useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import Text from "@/components/ui/Text";

export default function FormBox() {
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (username.length < 3) {
            setMessage("Le nom d'utilisateur doit contenir au moins 3 caractères");
            setIsError(true);
        } else {
            setMessage("Formulaire valide !");
            setIsError(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 w-80 mx-auto mt-10"
        >
            <Input
                id="username"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <Button type="submit" variant="outline">
                Valider
            </Button>
            {message && (
                <Text className={isError ? "text-red-600" : "text-green-600"}>
                    {message}
                </Text>
            )}
        </form>
    );
}

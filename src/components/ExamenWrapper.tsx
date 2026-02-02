import ExamenGate from "@/components/ExamenGate";
import Module from "@/types/Module";

interface ExamenWrapperProps {
    currentModule: Module;
    children: React.ReactNode;
}

// Composant serveur qui wrap ExamenGate (client) avec children (serveur)
export default function ExamenWrapper({currentModule, children}: ExamenWrapperProps) {
    return (
        <ExamenGate currentModule={currentModule}>
            {children}
        </ExamenGate>
    );
}
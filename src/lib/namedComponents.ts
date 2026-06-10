import React from "react";
import ColorClickableBox from "@/cours/javascript/2-les-evenements/Exemple/ColorClickableBox";
import ClickableBox from "@/cours/javascript/2-les-evenements/Exemple/ClickableBox";
import ClickCounterBox from "@/cours/javascript/2-les-evenements/Exemple/ClickCounterBox";
import MouseTrackerBox from "@/cours/javascript/2-les-evenements/Exemple/MouseTrackerBox";
import FormBox from "@/cours/javascript/2-les-evenements/Exemple/FormBox";
import KeyPressBox from "@/cours/javascript/2-les-evenements/Exemple/KeyPressBox";
import { MainChart, ComparisonChart, VariantesChart } from "@/cours/javascript/4-fetch/modal/MilgramCharts";
import MilgramModalContent from "@/cours/javascript/4-fetch/modal/MilgramModalContent";

export const namedComponents: Record<string, React.ComponentType> = {
    ColorClickableBox,
    ClickableBox,
    ClickCounterBox,
    MouseTrackerBox,
    FormBox,
    KeyPressBox,
    MilgramMainChart: MainChart,
    MilgramComparisonChart: ComparisonChart,
    MilgramVariantesChart: VariantesChart,
    MilgramModalContent,
};

export function getNamedComponent(name: string): React.ComponentType | undefined {
    return namedComponents[name];
}

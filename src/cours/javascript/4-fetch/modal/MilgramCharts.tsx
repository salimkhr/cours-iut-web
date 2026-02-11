// components/MilgramCharts.tsx
'use client';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const mainData = [
    {voltage: '300V', participants: 100},
    {voltage: '330V', participants: 79},
    {voltage: '360V', participants: 69},
    {voltage: '375V', participants: 67},
    {voltage: '450V', participants: 65},
];

const comparisonData = [
    {experience: 'Milgram 1961', hommes: 65, femmes: 65},
    {experience: 'Jeu de la mort 2010', hommes: 72.5, femmes: 82.5},
];

const variantesData = [
    {variante: 'Base (Yale)', taux: 65},
    {variante: 'Bureau Bridgeport', taux: 47.5},
    {variante: 'Même pièce', taux: 40},
    {variante: 'Contact tactile', taux: 30},
    {variante: 'Téléphone', taux: 20.5},
    {variante: 'Pairs désobéissants', taux: 10},
    {variante: 'Pairs obéissants', taux: 92.5},
];

export function MainChart() {
    return (
        <ResponsiveContainer width="100%" height={280}>
            <LineChart data={mainData}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="voltage"/>
                <YAxis domain={[0, 100]} label={{value: '%', angle: 0, position: 'insideTopLeft'}}/>
                <Tooltip/>
                <Legend/>
                <Line
                    type="monotone"
                    dataKey="participants"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="% continuant"
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

export function ComparisonChart() {
    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="experience"/>
                <YAxis domain={[0, 100]}/>
                <Tooltip/>
                <Legend/>
                <Bar dataKey="hommes" fill="#0088FE" name="Hommes"/>
                <Bar dataKey="femmes" fill="#FF8042" name="Femmes"/>
            </BarChart>
        </ResponsiveContainer>
    );
}

export function VariantesChart() {
    return (
        <ResponsiveContainer width="100%" height={320}>
            <BarChart data={variantesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis type="number" domain={[0, 100]}/>
                <YAxis dataKey="variante" type="category" width={140}/>
                <Tooltip/>
                <Bar dataKey="taux" fill="#8884d8" name="% obéissance"/>
            </BarChart>
        </ResponsiveContainer>
    );
}
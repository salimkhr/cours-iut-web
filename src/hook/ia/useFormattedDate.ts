export default function useFormattedDate() {
    const formatDate = (date = new Date()) => {
        const dayName = date.toLocaleDateString('fr-FR', {weekday: 'short'});
        const dayNumber = date.toLocaleDateString('fr-FR', {day: '2-digit'});
        const monthName = date.toLocaleDateString('fr-FR', {month: 'short'});
        const time = date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
        const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
        return `${capitalize(dayName)} ${dayNumber} ${capitalize(monthName)} ${time}`;
    };
    return {formatDate};
}
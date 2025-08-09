import {useState} from "react";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {ChevronsUpDown} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";

export default function MultiSelect({label, options, value, onChange}: {
    label: string;
    options: string[];
    value: string[];
    onChange: (val: string[]) => void
}) {
    const [open, setOpen] = useState(false);

    const toggleOption = (option: string) => {
        if (value.includes(option)) {
            onChange(value.filter((v) => v !== option));
        } else {
            onChange([...value, option]);
        }
    };

    return (
        <div>
            <Label>{label}</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                        {value?.length > 0 ? value.join(", ") : `Sélectionner ${label.toLowerCase()}`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-2">
                    {options.map((option) => (
                        <div
                            key={option}
                            className="flex items-center space-x-2 p-1 cursor-pointer hover:bg-accent rounded"
                            onClick={() => toggleOption(option)}
                        >
                            <Checkbox checked={value?.includes(option)}/>
                            <span>{option}</span>
                        </div>
                    ))}
                </PopoverContent>
            </Popover>
        </div>
    );
}
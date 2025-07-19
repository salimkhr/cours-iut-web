const ColorSwatch = ({value = "#000"}) => {
    return (
        <span className="inline-flex items-center gap-2 align-middle">
            <span
                className="w-4 h-4 inline-block rounded shadow-md border"
                style={{backgroundColor: value}}
            />
            <span className="text-sm font-mono">{value}</span>
      </span>
    );
};

export default ColorSwatch;
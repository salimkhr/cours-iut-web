const ColorSwatch = ({value = "#2a1d12"}) => {
    return (
        <span className="inline-flex items-center gap-2 align-middle">
            <span
                className="inline-block size-4 rounded border border-border shadow-[0_2px_8px_-4px_rgba(147,97,58,0.7)]"
                style={{backgroundColor: value}}
            />
            <span className="text-sm font-mono">{value}</span>
      </span>
    );
};

export default ColorSwatch;

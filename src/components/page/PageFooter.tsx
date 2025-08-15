import Image from "next/image";

interface PageFooterProps {
    imagePath: string;
}

export default function PageFooter({imagePath}: PageFooterProps) {
    return (
        <div className="opacity-0 animate-fade-in">
            <Image
                src={imagePath}
                alt=""
                width={1000}
                height={1000}
                className="hidden md:flex h-100"
                style={{paddingBottom: '40px', zIndex: 100}}
            />
        </div>
    );
}
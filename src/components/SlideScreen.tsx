// components/Slide.tsx
import React from "react";

export type SlideProps = {
    title?: string;
    children: React.ReactNode;
    className?: string; // <-- ajouté pour permettre cloneElement
};

const SlideScreen: React.FC<SlideProps> = ({ title, children, className }) => {
    return (
        <div className={`w-full h-full flex flex-col justify-center items-center p-8 ${className}`}>
            {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
            <div className="text-lg">{children}</div>
        </div>
    );
};

export default SlideScreen;

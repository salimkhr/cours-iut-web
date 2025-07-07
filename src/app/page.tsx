'use client'

import ModuleCard from "@/components/Cards/ModuleCard";
import modules from "../../data/modules";
import Image from "next/image";
import * as React from "react";
import { motion } from "framer-motion";

export default function Home() {
    return (
        <div className="flex flex-col w-full items-center justify-start">

            <section
                className="w-full flex flex-col lg:flex-row items-center justify-center lg:justify-between p-4 lg:p-6 gap-4 lg:gap-6 lg:min-h-[10vh]">
                {/* Left Side: Animated Text */}
                <motion.div
                    className="flex flex-col items-center justify-center w-full lg:w-2/3"
                    initial={{opacity: 0, y: 50}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.8, ease: "easeOut"}}
                >
                    <motion.h1
                        className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-extrabold mt-10 lg:mb-4 text-center"
                        initial={{opacity: 0, y: 30}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.8, ease: "easeOut", delay: 0.2}}
                    >
                        Développement Web
                    </motion.h1>

                    <motion.p
                        className="text-base sm:text-lg text-gray-600 mb-3 lg:mb-4 text-center max-w-2xl"
                        initial={{opacity: 0, y: 30}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.8, ease: "easeOut", delay: 0.4}}
                    >
                        Maîtriser les bases du développement web front-end et back-end pour exploiter efficacement les
                        frameworks modernes.
                    </motion.p>
                </motion.div>

                {/* Right Side: Animated Image (hidden on mobile) */}
                <motion.div
                    className="hidden lg:flex items-center justify-center w-full lg:w-1/3"
                    initial={{opacity: 0, x: 100}}
                    animate={{opacity: 1, x: 0}}
                    transition={{duration: 0.8, ease: "easeOut", delay: 0.6}}
                >
                    <Image
                        src="/header.svg"
                        alt="Développement Web"
                        width={600}
                        height={600}
                        className="w-full h-auto max-w-xs lg:max-w-sm"
                        style={{marginBottom: '-20px', zIndex: 100}}
                    />
                </motion.div>
            </section>

            {/* Section Module Cards */}
            <section className="w-full px-4 lg:px-8 py-8 lg:py-12">
                <h2 className="text-4xl lg:text-6xl font-extrabold mb-4 lg:mb-8 text-center">
                    Liste des cours
                </h2>
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full max-w-7xl mx-auto mb-12 lg:mb-16">
                    {modules.map((currentModule, index) => (
                        <motion.div
                            key={currentModule.id}
                            initial={{opacity: 0, y: 30}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true}}
                            transition={{duration: 0.6, ease: "easeOut", delay: index * 0.1}}
                        >
                            <ModuleCard currentModule={currentModule}/>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Footer Image */}
            <Image
                src="/footer.svg"
                alt=""
                width={1000}
                height={1000}
                className="hidden md:flex w-full h-100"
                style={{marginBottom: '-20px', zIndex: 100}}
            />
        </div>
    );
}

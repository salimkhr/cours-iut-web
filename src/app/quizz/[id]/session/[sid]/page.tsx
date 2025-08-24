import {QRCodeSVG} from "qrcode.react";
import Heading from "@/components/ui/Heading";

export default function Page() {
    return (
        <div className={"flex flex-col items-center justify-center gap-4"}>
            <Heading level={1}>Quizz</Heading>
            <QRCodeSVG value="https://example.com" size={512} level={'H'} fgColor={"#53567d"}/>
        </div>

    );
}

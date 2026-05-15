import net from "net";
import { UPLOAD_CONFIG } from "./config";

type ScanResult =
    | { clean: true }
    | { clean: false; virus: string }
    | { error: string };

/**
 * Envoie le buffer à clamd via le protocole INSTREAM (TCP).
 * Retourne { clean: true }, { clean: false, virus } ou { error }.
 */
export async function scanWithClamAV(buf: Buffer): Promise<ScanResult> {
    const { host, port, timeout } = UPLOAD_CONFIG.clamav;

    return new Promise((resolve) => {
        const socket = new net.Socket();
        let settled = false;
        let response = "";

        function settle(result: ScanResult) {
            if (!settled) {
                settled = true;
                socket.destroy();
                resolve(result);
            }
        }

        socket.setTimeout(timeout);
        socket.on("timeout", () => settle({ error: "ClamAV timeout" }));
        socket.on("error", (err) => settle({ error: `ClamAV: ${err.message}` }));

        socket.connect(port, host, () => {
            // Commande INSTREAM (null-terminated)
            socket.write("zINSTREAM\0");

            // Envoi par chunks de 4 Ko : [uint32BE taille][données]
            const CHUNK = 4096;
            for (let offset = 0; offset < buf.length; offset += CHUNK) {
                const chunk = buf.subarray(offset, offset + CHUNK);
                const header = Buffer.allocUnsafe(4);
                header.writeUInt32BE(chunk.length, 0);
                socket.write(header);
                socket.write(chunk);
            }

            // Fin de stream : 4 octets nuls
            socket.write(Buffer.alloc(4));
        });

        socket.on("data", (data: Buffer) => {
            response += data.toString("utf8");
            // clamd termine toujours sa réponse par \n
            if (response.includes("\n")) {
                const line = response.trim().replace(/\0/g, "");
                if (line.endsWith("OK")) {
                    settle({ clean: true });
                } else if (line.includes("FOUND")) {
                    // ex: "stream: Eicar-Test-Signature FOUND"
                    const virus = line.replace(/^stream:\s*/i, "").replace(/\s*FOUND$/i, "");
                    settle({ clean: false, virus });
                } else {
                    settle({ error: `ClamAV: ${line}` });
                }
            }
        });

        socket.on("close", () => {
            // clamd peut couper la connexion dès qu'il détecte un virus
            if (!settled) settle({ error: "ClamAV: connexion fermée prématurément" });
        });
    });
}

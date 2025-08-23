import Heading from "@/components/ui/Heading";
import Code from "@/components/ui/Code";
import Box from "@/components/ui/Box";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import CodeCard from "@/components/Cards/CodeCard";
import {List, ListItem} from "@/components/ui/List";
import Text from "@/components/ui/Text";
import Link from "next/link";

function formatNumberToFrench(value: number): string {
    const formatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    return formatter.format(value);
}

// Données des streamers avec indication de lieu
const streamersData = [
    {
        "name": "Antoine Daniel",
        "pseudo": "AntoineDaniel",
        "lastAmount": 120000,
        "rank": 1,
        "isRemote": false,
        "setupNumber": 32,
        "city": "Nice"
    },
    {
        "name": "Adrien Nougaret",
        "pseudo": "ZeratoR",
        "lastAmount": 120000,
        "rank": 2,
        "isRemote": false,
        "setupNumber": 44,
        "city": "Bordeaux"
    },
    {
        "name": "Marie Lopez",
        "pseudo": "EnjoyPhoenix",
        "lastAmount": 110000,
        "rank": 3,
        "isRemote": false,
        "setupNumber": 12,
        "city": "Bordeaux"
    },
    {
        "name": "Sébastien Ferez",
        "pseudo": "AlphaCast",
        "lastAmount": 100000,
        "rank": 4,
        "isRemote": false,
        "setupNumber": 93,
        "city": "Luxembourg"
    },
    {
        "name": "Frédéric Molas",
        "pseudo": "Joueur_du_Grenier",
        "lastAmount": 95000,
        "rank": 5,
        "isRemote": false,
        "setupNumber": 49,
        "city": "Luxembourg"
    },
    {
        "name": "Xavier Dang",
        "pseudo": "mistermv",
        "lastAmount": 90000,
        "rank": 6,
        "isRemote": false,
        "setupNumber": 55,
        "city": "Nantes"
    },
    {
        "name": "Jordan Rondelli",
        "pseudo": "Joyca",
        "lastAmount": 85000,
        "rank": 7,
        "isRemote": false,
        "setupNumber": 29,
        "city": "Montpellier"
    },
    {
        "name": "Aurélien Gilles",
        "pseudo": "Ponce",
        "lastAmount": 85000,
        "rank": 8,
        "isRemote": false,
        "setupNumber": 66,
        "city": "Paris"
    },
    {
        "name": "Florence",
        "pseudo": "AngleDroit",
        "lastAmount": 80000,
        "rank": 9,
        "isRemote": false,
        "setupNumber": 77,
        "city": "Nice"
    },
    {
        "name": "Justine Noguera",
        "pseudo": "BagheraJones",
        "lastAmount": 70000,
        "rank": 10,
        "isRemote": false,
        "setupNumber": 73,
        "city": "Bruxelles"
    },
    {
        "name": "Emmanuel Marquez",
        "pseudo": "MoMaN",
        "lastAmount": 70000,
        "rank": 11,
        "isRemote": false,
        "setupNumber": 95,
        "city": "Montpellier"
    },
    {
        "name": "Mynthos",
        "pseudo": "Mynthos",
        "lastAmount": 60000,
        "rank": 12,
        "isRemote": false,
        "setupNumber": 54,
        "city": "Luxembourg"
    },
    {
        "name": "Ava",
        "pseudo": "AVAMind",
        "lastAmount": 50000,
        "rank": 13,
        "isRemote": false,
        "setupNumber": 61,
        "city": "Lille"
    },
    {
        "name": "Arif Selim Akin",
        "pseudo": "Doigby",
        "lastAmount": 50000,
        "rank": 14,
        "isRemote": false,
        "setupNumber": 74,
        "city": "Bruxelles"
    },
    {
        "name": "Nico_la",
        "pseudo": "Nico_la",
        "lastAmount": 50000,
        "rank": 15,
        "isRemote": false,
        "setupNumber": 42,
        "city": "Lille"
    },
    {
        "name": "byilhann",
        "pseudo": "byilhann",
        "lastAmount": 45000,
        "rank": 16,
        "isRemote": false,
        "setupNumber": 59,
        "city": "Grenoble"
    },
    {
        "name": "DrFeelgood",
        "pseudo": "Alexis Rodrigues",
        "lastAmount": 45000,
        "rank": 17,
        "isRemote": false,
        "setupNumber": 60,
        "city": "Rennes"
    },
    {
        "name": "Marianne",
        "pseudo": "LittleBigWhale",
        "lastAmount": 45000,
        "rank": 18,
        "isRemote": false,
        "setupNumber": 46,
        "city": "Strasbourg"
    },
    {
        "name": "Yann",
        "pseudo": "chowh1",
        "lastAmount": 40000,
        "rank": 19,
        "isRemote": false,
        "setupNumber": 53,
        "city": "Nantes"
    },
    {
        "name": "Pierre-Alexis Bizot",
        "pseudo": "Domingo",
        "lastAmount": 40000,
        "rank": 20,
        "isRemote": false,
        "setupNumber": 33,
        "city": "Monaco"
    },
    {
        "name": "Kenny Schrub",
        "pseudo": "KennyStream",
        "lastAmount": 40000,
        "rank": 21,
        "isRemote": false,
        "setupNumber": 31,
        "city": "Nice"
    },
    {
        "name": "Théo Reunbot",
        "pseudo": "Rivenzi",
        "lastAmount": 40000,
        "rank": 22,
        "isRemote": false,
        "setupNumber": 85,
        "city": "Nice"
    },
    {
        "name": "Sylvain",
        "pseudo": "SylvainLyve",
        "lastAmount": 40000,
        "rank": 23,
        "isRemote": false,
        "setupNumber": 64,
        "city": "Lille"
    },
    {
        "name": "Trinity Morisette",
        "pseudo": "Trinity",
        "lastAmount": 40000,
        "rank": 24,
        "isRemote": false,
        "setupNumber": 50,
        "city": "Strasbourg"
    },
    {
        "name": "Clément Viktorovitch",
        "pseudo": "Clemovitch",
        "lastAmount": 35000,
        "rank": 25,
        "isRemote": false,
        "setupNumber": 90,
        "city": "Rennes"
    },
    {
        "name": "Claudia",
        "pseudo": "Pressea",
        "lastAmount": 35000,
        "rank": 26,
        "isRemote": false,
        "setupNumber": 35,
        "city": "Marseille"
    },
    {
        "name": "CrocodyleTV",
        "pseudo": "CrocodyleTV",
        "lastAmount": 30000,
        "rank": 27,
        "isRemote": false,
        "setupNumber": 75,
        "city": "Lyon"
    },
    {
        "name": "Rayenne Guendil",
        "pseudo": "Etoiles",
        "lastAmount": 30000,
        "rank": 28,
        "isRemote": false,
        "setupNumber": 76,
        "city": "Bruxelles"
    },
    {
        "name": "Lapi",
        "pseudo": "Constantin Alberto",
        "lastAmount": 30000,
        "rank": 29,
        "isRemote": false,
        "setupNumber": 96,
        "city": "Bruxelles"
    },
    {
        "name": "Sakor Ros",
        "pseudo": "Sakor_",
        "lastAmount": 30000,
        "rank": 30,
        "isRemote": false,
        "setupNumber": 2,
        "city": "Rennes"
    },
    {
        "name": "TheGuill84",
        "pseudo": "TheGuill84",
        "lastAmount": 30000,
        "rank": 31,
        "isRemote": false,
        "setupNumber": 7,
        "city": "Bruxelles"
    },
    {
        "name": "Carla Giardina",
        "pseudo": "Ultia",
        "lastAmount": 30000,
        "rank": 32,
        "isRemote": false,
        "setupNumber": 63,
        "city": "Lyon"
    },
    {
        "name": "Zimas",
        "pseudo": "Zimas",
        "lastAmount": 30000,
        "rank": 33,
        "isRemote": true,
        "setupNumber": 25,
        "city": "Monaco"
    },
    {
        "name": "DamDamLive",
        "pseudo": "DamDamLive",
        "lastAmount": 25000,
        "rank": 34,
        "isRemote": false,
        "setupNumber": 38,
        "city": "Genève"
    },
    {
        "name": "Flamby",
        "pseudo": "Flamby",
        "lastAmount": 25000,
        "rank": 35,
        "isRemote": false,
        "setupNumber": 21,
        "city": "Rennes"
    },
    {
        "name": "m4fgaming",
        "pseudo": "m4fgaming",
        "lastAmount": 25000,
        "rank": 36,
        "isRemote": false,
        "setupNumber": 98,
        "city": "Nantes"
    },
    {
        "name": "Shisheyu",
        "pseudo": "Shisheyu",
        "lastAmount": 25000,
        "rank": 37,
        "isRemote": false,
        "setupNumber": 78,
        "city": "Marseille"
    },
    {
        "name": "theodort",
        "pseudo": "theodort",
        "lastAmount": 25000,
        "rank": 38,
        "isRemote": false,
        "setupNumber": 1,
        "city": "Paris"
    },
    {
        "name": "0uahleouff",
        "pseudo": "0uahleouff",
        "lastAmount": 25000,
        "rank": 39,
        "isRemote": true,
        "setupNumber": 99,
        "city": "Marseille"
    },
    {
        "name": "Gom4rt",
        "pseudo": "Gom4rt",
        "lastAmount": 22000,
        "rank": 40,
        "isRemote": false,
        "setupNumber": 15,
        "city": "Bruxelles"
    },
    {
        "name": "2old4stream",
        "pseudo": "2old4stream",
        "lastAmount": 22000,
        "rank": 41,
        "isRemote": true,
        "setupNumber": 4,
        "city": "Grenoble"
    },
    {
        "name": "Gius",
        "pseudo": "Gius",
        "lastAmount": 20000,
        "rank": 42,
        "isRemote": false,
        "setupNumber": 23,
        "city": "Strasbourg"
    },
    {
        "name": "Mastuh",
        "pseudo": "Mastu",
        "lastAmount": 20000,
        "rank": 43,
        "isRemote": false,
        "setupNumber": 89,
        "city": "Paris"
    },
    {
        "name": "samueletienne",
        "pseudo": "Samuel Étienne",
        "lastAmount": 20000,
        "rank": 44,
        "isRemote": true,
        "setupNumber": 71,
        "city": "Bruxelles"
    },
    {
        "name": "TheGreatReview",
        "pseudo": "TheGreatReview",
        "lastAmount": 20000,
        "rank": 45,
        "isRemote": false,
        "setupNumber": 18,
        "city": "Paris"
    },
    {
        "name": "adyboo",
        "pseudo": "adyboo",
        "lastAmount": 20000,
        "rank": 46,
        "isRemote": true,
        "setupNumber": 8,
        "city": "Bordeaux"
    },
    {
        "name": "HortyUnderscore",
        "pseudo": "HortyUnderscore",
        "lastAmount": 18000,
        "rank": 47,
        "isRemote": false,
        "setupNumber": 22,
        "city": "Monaco"
    },
    {
        "name": "Adyce_",
        "pseudo": "Adyce_",
        "lastAmount": 18000,
        "rank": 48,
        "isRemote": true,
        "setupNumber": 84,
        "city": "Lille"
    },
    {
        "name": "airkagaming",
        "pseudo": "airkagaming",
        "lastAmount": 17000,
        "rank": 49,
        "isRemote": true,
        "setupNumber": 88,
        "city": "Bruxelles"
    },
    {
        "name": "Akipupuce",
        "pseudo": "Akipupuce",
        "lastAmount": 16000,
        "rank": 50,
        "isRemote": true,
        "setupNumber": 34,
        "city": "Paris"
    },
    {
        "name": "helydia",
        "pseudo": "helydia",
        "lastAmount": 15000,
        "rank": 51,
        "isRemote": false,
        "setupNumber": 79,
        "city": "Nantes"
    },
    {
        "name": "Sundae",
        "pseudo": "Sundae",
        "lastAmount": 15000,
        "rank": 52,
        "isRemote": false,
        "setupNumber": 72,
        "city": "Marseille"
    },
    {
        "name": "zacknani",
        "pseudo": "zacknani",
        "lastAmount": 15000,
        "rank": 53,
        "isRemote": false,
        "setupNumber": 94,
        "city": "Nantes"
    },
    {
        "name": "allmight__one",
        "pseudo": "allmight__one",
        "lastAmount": 15000,
        "rank": 54,
        "isRemote": true,
        "setupNumber": 56,
        "city": "Strasbourg"
    },
    {
        "name": "Jirayalecochon",
        "pseudo": "Jirayalecochon",
        "lastAmount": 14000,
        "rank": 55,
        "isRemote": false,
        "setupNumber": 47,
        "city": "Luxembourg"
    },
    {
        "name": "Anaee",
        "pseudo": "Anaee",
        "lastAmount": 14000,
        "rank": 56,
        "isRemote": true,
        "setupNumber": 3,
        "city": "Luxembourg"
    },
    {
        "name": "AnaOnAir",
        "pseudo": "AnaOnAir",
        "lastAmount": 13000,
        "rank": 57,
        "isRemote": true,
        "setupNumber": 67,
        "city": "Bruxelles"
    },
    {
        "name": "JLTomy",
        "pseudo": "JLTomy",
        "lastAmount": 12000,
        "rank": 58,
        "isRemote": false,
        "setupNumber": 62,
        "city": "Toulouse"
    },
    {
        "name": "Antistar",
        "pseudo": "Antistar",
        "lastAmount": 12000,
        "rank": 59,
        "isRemote": true,
        "setupNumber": 65,
        "city": "Paris"
    },
    {
        "name": "arnaquemoisitupeux",
        "pseudo": "arnaquemoisitupeux",
        "lastAmount": 11000,
        "rank": 60,
        "isRemote": true,
        "setupNumber": 37,
        "city": "Genève"
    },
    {
        "name": "Artemize",
        "pseudo": "Artemize",
        "lastAmount": 10000,
        "rank": 61,
        "isRemote": true,
        "setupNumber": 28,
        "city": "Luxembourg"
    },
    {
        "name": "As2piK",
        "pseudo": "As2piK",
        "lastAmount": 9500,
        "rank": 62,
        "isRemote": true,
        "setupNumber": 69,
        "city": "Montpellier"
    },
    {
        "name": "Azghaaar",
        "pseudo": "Azghaaar",
        "lastAmount": 9000,
        "rank": 63,
        "isRemote": true,
        "setupNumber": 97,
        "city": "Luxembourg"
    },
    {
        "name": "BARBE___DOUCE",
        "pseudo": "BARBE___DOUCE",
        "lastAmount": 8500,
        "rank": 64,
        "isRemote": true,
        "setupNumber": 81,
        "city": "Rennes"
    },
    {
        "name": "BARDINETTE",
        "pseudo": "BARDINETTE",
        "lastAmount": 8000,
        "rank": 65,
        "isRemote": true,
        "setupNumber": 11,
        "city": "Genève"
    },
    {
        "name": "Belben",
        "pseudo": "Belben",
        "lastAmount": 7800,
        "rank": 66,
        "isRemote": true,
        "setupNumber": 80,
        "city": "Luxembourg"
    },
    {
        "name": "Bicardic",
        "pseudo": "Bicardic",
        "lastAmount": 7600,
        "rank": 67,
        "isRemote": true,
        "setupNumber": 24,
        "city": "Rennes"
    },
    {
        "name": "BriceFX",
        "pseudo": "BriceFX",
        "lastAmount": 7400,
        "rank": 68,
        "isRemote": true,
        "setupNumber": 16,
        "city": "Marseille"
    },
    {
        "name": "Caramel_",
        "pseudo": "Caramel_",
        "lastAmount": 7200,
        "rank": 69,
        "isRemote": true,
        "setupNumber": 48,
        "city": "Monaco"
    },
    {
        "name": "Celestine",
        "pseudo": "Celestine",
        "lastAmount": 7000,
        "rank": 70,
        "isRemote": true,
        "setupNumber": 52,
        "city": "Luxembourg"
    },
    {
        "name": "cerbere",
        "pseudo": "cerbere",
        "lastAmount": 6800,
        "rank": 71,
        "isRemote": true,
        "setupNumber": 100,
        "city": "Monaco"
    },
    {
        "name": "ChaosXS",
        "pseudo": "ChaosXS",
        "lastAmount": 6600,
        "rank": 72,
        "isRemote": true,
        "setupNumber": 51,
        "city": "Bordeaux"
    },
    {
        "name": "Chawson",
        "pseudo": "Chawson",
        "lastAmount": 6400,
        "rank": 73,
        "isRemote": true,
        "setupNumber": 19,
        "city": "Rennes"
    },
    {
        "name": "CherrySushi",
        "pseudo": "CherrySushi",
        "lastAmount": 6200,
        "rank": 74,
        "isRemote": true,
        "setupNumber": 5,
        "city": "Monaco"
    },
    {
        "name": "Chris_470",
        "pseudo": "Chris_470",
        "lastAmount": 6000,
        "rank": 75,
        "isRemote": true,
        "setupNumber": 86,
        "city": "Paris"
    },
    {
        "name": "Cinelou",
        "pseudo": "Cinelou",
        "lastAmount": 5800,
        "rank": 76,
        "isRemote": true,
        "setupNumber": 40,
        "city": "Grenoble"
    },
    {
        "name": "Climb",
        "pseudo": "Climb",
        "lastAmount": 5600,
        "rank": 77,
        "isRemote": true,
        "setupNumber": 70,
        "city": "Strasbourg"
    },
    {
        "name": "Colonel_R",
        "pseudo": "Colonel_R",
        "lastAmount": 5400,
        "rank": 78,
        "isRemote": true,
        "setupNumber": 91,
        "city": "Monaco"
    },
    {
        "name": "Concealed",
        "pseudo": "Concealed",
        "lastAmount": 5200,
        "rank": 79,
        "isRemote": true,
        "setupNumber": 45,
        "city": "Marseille"
    },
    {
        "name": "CreepStream",
        "pseudo": "CreepStream",
        "lastAmount": 5000,
        "rank": 80,
        "isRemote": true,
        "setupNumber": 82,
        "city": "Marseille"
    },
    {
        "name": "CyprienGaming",
        "pseudo": "CyprienGaming",
        "lastAmount": 4800,
        "rank": 81,
        "isRemote": true,
        "setupNumber": 13,
        "city": "Nice"
    },
    {
        "name": "DaSSy",
        "pseudo": "DaSSy",
        "lastAmount": 4600,
        "rank": 82,
        "isRemote": true,
        "setupNumber": 10,
        "city": "Paris"
    },
    {
        "name": "DamiNin",
        "pseudo": "DamiNin",
        "lastAmount": 4400,
        "rank": 83,
        "isRemote": true,
        "setupNumber": 92,
        "city": "Grenoble"
    },
    {
        "name": "Danyplay",
        "pseudo": "Danyplay",
        "lastAmount": 4200,
        "rank": 84,
        "isRemote": true,
        "setupNumber": 58,
        "city": "Bordeaux"
    },
    {
        "name": "Darkthrow",
        "pseudo": "Darkthrow",
        "lastAmount": 4000,
        "rank": 85,
        "isRemote": true,
        "setupNumber": 83,
        "city": "Monaco"
    },
    {
        "name": "Deadrocker",
        "pseudo": "Deadrocker",
        "lastAmount": 3800,
        "rank": 86,
        "isRemote": true,
        "setupNumber": 87,
        "city": "Monaco"
    },
    {
        "name": "DixitTV",
        "pseudo": "DixitTV",
        "lastAmount": 3600,
        "rank": 87,
        "isRemote": true,
        "setupNumber": 39,
        "city": "Nice"
    },
    {
        "name": "Djumpy",
        "pseudo": "Djumpy",
        "lastAmount": 3400,
        "rank": 88,
        "isRemote": true,
        "setupNumber": 6,
        "city": "Montpellier"
    },
    {
        "name": "Dr_Loock",
        "pseudo": "Dr_Loock",
        "lastAmount": 3200,
        "rank": 89,
        "isRemote": true,
        "setupNumber": 9,
        "city": "Nantes"
    },
    {
        "name": "Droll",
        "pseudo": "Droll",
        "lastAmount": 3000,
        "rank": 90,
        "isRemote": true,
        "setupNumber": 30,
        "city": "Nantes"
    },
    {
        "name": "DzA_58",
        "pseudo": "DzA_58",
        "lastAmount": 2800,
        "rank": 91,
        "isRemote": true,
        "setupNumber": 57,
        "city": "Montpellier"
    },
    {
        "name": "e3rra",
        "pseudo": "e3rra",
        "lastAmount": 2600,
        "rank": 92,
        "isRemote": true,
        "setupNumber": 14,
        "city": "Marseille"
    },
    {
        "name": "Eclay",
        "pseudo": "Eclay",
        "lastAmount": 2400,
        "rank": 93,
        "isRemote": true,
        "setupNumber": 41,
        "city": "Strasbourg"
    },
    {
        "name": "Ecleco",
        "pseudo": "Ecleco",
        "lastAmount": 2200,
        "rank": 94,
        "isRemote": true,
        "setupNumber": 20,
        "city": "Paris"
    },
    {
        "name": "Ekynox",
        "pseudo": "Ekynox",
        "lastAmount": 2000,
        "rank": 95,
        "isRemote": true,
        "setupNumber": 17,
        "city": "Luxembourg"
    },
    {
        "name": "ElPerroDelMar",
        "pseudo": "ElPerroDelMar",
        "lastAmount": 1800,
        "rank": 96,
        "isRemote": true,
        "setupNumber": 36,
        "city": "Lille"
    },
    {
        "name": "Elysian",
        "pseudo": "Elysian",
        "lastAmount": 1600,
        "rank": 97,
        "isRemote": true,
        "setupNumber": 26,
        "city": "Nice"
    },
    {
        "name": "Enzard",
        "pseudo": "Enzard",
        "lastAmount": 1400,
        "rank": 98,
        "isRemote": true,
        "setupNumber": 27,
        "city": "Lille"
    },
    {
        "name": "Eriixx",
        "pseudo": "Eriixx",
        "lastAmount": 1200,
        "rank": 99,
        "isRemote": true,
        "setupNumber": 43,
        "city": "Lille"
    },
    {
        "name": "Etique_tv",
        "pseudo": "Etique_tv",
        "lastAmount": 1000,
        "rank": 100,
        "isRemote": true,
        "setupNumber": 68,
        "city": "Grenoble"
    }
]


const amounts = streamersData.map(streamer => streamer.lastAmount);
const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
const averageAmount = totalAmount / streamersData.length;
const maxAmount = Math.max(...amounts);
const minAmount = Math.min(...amounts);

export default function TP() {
    return (
        <section>
            <Box>
                <Heading level={2}>A- Rappel de HTML</Heading>
                <Heading level={3}>Woody</Heading>
                <Text>
                    Le serveur <strong>woody</strong> est un serveur web de l&apos;IUT configuré
                    avec <strong>Apache</strong>.
                    Il permet d&apos;interpréter les scripts PHP et de rendre accessibles sur le réseau les fichiers
                    HTML et PHP que vous placez dans votre dossier personnel <Code>~/public_html</Code>.
                    Par exemple, si vous ajoutez un fichier
                    nommé <Code>index.php</Code> dans <Code>~/public_html/TP1/</Code>, il sera accessible à
                    l&apos;adresse :<Link href="http://woody.iut.univ-lehavre.fr/~loginLDAP/TP1/index.php"
                                          target="_blank"><Code>http://woody.iut.univ-lehavre.fr/~<strong>loginLDAP</strong>/TP1/index.php</Code></Link> ou <Link
                    href="http://localhost/~loginLDAP/TP1/index.php"
                    target="_blank"><Code>http://localhost/~<strong>loginLDAP</strong>/TP1/index.php</Code></Link>.
                </Text>

                <Heading level={3}>Rappel de HTML</Heading>
                <Text className="mt-4">
                    Dans le fichier <Code>~/public_html/TP1/rappel.html</Code>, créez une page HTML contenant la
                    structure de base d&apos;un document HTML, ainsi qu&apos;un tableau.</Text>
                <CodeCard language="html" filename="rappel.html">
                    {`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Z-Event 2025</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-LN+7fdVzj6u52u30Kp6M/trliBMCMKTyK833zpbD+pXdCLuTusPj697FH4R/5mcr" crossorigin="anonymous">
</head>
<body>
    <h1>Tableau des dons Z-Event</h1>
    
    <!-- Ajouter le tableau avec les données ci-dessous -->
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js" integrity="sha384-ndDqU0Gzau9qJ1lfW4pNLlhNTkCfHzAVBReH9diLvGRem5+R9g2FzA8ZGN954O5Q" crossorigin="anonymous"></script>

</body>
</html>`}
                </CodeCard>
                <Text>Ce tableau devra récapituler les montants collectés par les streamers lors du dernier Z-Event,
                    avec
                    les 5 colonnes suivantes :
                    <Code>Nom du Streamer</Code>, <Code>Pseudo</Code>, <Code>Montant Collecté (en
                        euros)</Code>, <Code>Rang</Code> et <Code>Lieu</Code>.
                    Vous pourrez ensuite consulter cette page dans votre navigateur à l&apos;adresse :
                    <Link href="http://woody.iut.univ-lehavre.fr/~loginLDAP/TP1/rappel.html"
                          target="_blank"><Code>http://woody.iut.univ-lehavre.fr/~<strong>loginLDAP</strong>/TP1/rappel.html</Code>
                    </Link> ou
                    <Link href="http://localhost/~loginLDAP/TP1/rappel.html" target="_blank">
                        <Code>http://localhost/~<strong>loginLDAP</strong>/TP1/rappel.html</Code>
                    </Link>.
                </Text>

                <Text><strong>Données à utiliser :</strong></Text>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead scope="row">Nom du Streamer</TableHead>
                            <TableHead scope="row">Prénom/Pseudo</TableHead>
                            <TableHead scope="row">Montant Collecté (en euros)</TableHead>
                            <TableHead scope="row">Rang</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {streamersData.sort((a, b) => a.rank - b.rank) // tri décroissant
                            .slice(0, 5).map((streamer) => (
                                <TableRow key={streamer.rank}>
                                    <TableCell>{streamer.name}</TableCell>
                                    <TableCell><Link
                                        href={`https://twitch.tv/${streamer.pseudo}`}
                                        target="_blank">{streamer.pseudo}</Link></TableCell>
                                    <TableCell>{formatNumberToFrench(streamer.lastAmount)}</TableCell>
                                    <TableCell>{streamer.rank}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>

                <small>Source : ChatGPT (les montants ne sont pas factuels)</small>
            </Box>

            <Box>
                <Heading level={2}>B- Hello World en PHP</Heading>
                <Text>
                    Dans un fichier <Code>~/public_html/TP1/helloWorld.php</Code>, écrire une page contenant :
                </Text>
                <CodeCard language="php">
                    {`<?php
  echo 'Hello World!';
  echo '<br/>';
  echo 'Nous sommes le ' . date('d/m/Y');
?>`}
                </CodeCard>
                <List ordered>
                    <ListItem>Déterminer à quelle heure correspond la date affichée : celle du serveur ou celle du
                        navigateur ?</ListItem>
                    <ListItem>Modifier le script pour ajouter une
                        variable <Code>$pseudo</Code> contenant &apos;ZeratoR&apos; et afficher Hello $pseudo!
                        à la place de Hello World!</ListItem>
                    <ListItem>
                        <strong>Variables et concaténation :</strong> Créer les variables suivantes et les afficher :
                        <List>
                            <ListItem><Code>$amount</Code> contenant 1200000</ListItem>
                            <ListItem><Code>$rank</Code> contenant 1</ListItem>
                            <ListItem>Afficher : &quot;Le streamer $pseudo est classé $rank avec $amount
                                euros&quot;</ListItem>
                        </List>
                    </ListItem>
                    <ListItem>
                        <strong>Formatage :</strong> Utiliser la fonction <Link
                        href="https://www.php.net/manual/fr/function.number-format.php" target="_blank"><Code>{`number_format($amount,
                        0, ',', '
                        ')`}</Code></Link>
                        pour afficher le montant avec des espaces comme séparateurs de milliers.
                    </ListItem>
                </List>
            </Box>

            <Box>
                <Heading level={2}>C- Le debug</Heading>
                <Text>
                    Dans un fichier <Code>~/public_html/TP1/debug.php</Code>, écrire une page contenant :
                </Text>
                <CodeCard language="php">
                    {`<?php
$lastname = 'Medical';             // Chaîne de caractères
$firstname = ['Anne','Lyse'];      // Tableau de chaîne de caractères
$age = 25;                         // Entier
$price = 19.99;                    // Float
$isStudent = true;                 // Booléen

var_dump($age, $price, $isStudent, $lastname, $firstname);
?>`}
                </CodeCard>
                <List ordered>
                    <ListItem>Expliquer ce que fait la fonction <Code>var_dump()</Code>.</ListItem>
                    <ListItem>Ajouter au script un appel à la fonction <Code>die();</Code> ainsi que l&apos;affichage
                        du lastname avec <Code>echo $lastname;</Code>. Vérifier si le texte du <Code>echo</Code> est
                        affiché.</ListItem>
                </List>
                <Text>Utiliser les fonctions <Code>var_dump()</Code> et <Code>die()</Code> pour ajouter des
                    traces dans le code afin d&apos;aider au débogage.</Text>
            </Box>

            <Box>
                <Heading level={2}>D- Introduction aux objets</Heading>

                <Text>Dans un fichier <Code>~/public_html/TP1/streamer.php</Code>, vous devez créer une
                    classe <Code>Streamer</Code> :</Text>
                <CodeCard language="php" filename="streamer.php">
                    {`<?php
class Streamer {
    // Propriétés privées et Constructeur à implémenter
    
    // Getters à créer
    
    // Méthodes utilitaires à développer
}

// Tests (à ajouter à la fin du fichier)
$streamer1 = new Streamer("Adrien Nougaret", "ZeratoR", 1200000, 1);
echo $streamer1;
?>`}
                </CodeCard>

                <List ordered>
                    <ListItem>
                        avec les propriétés privées suivantes :
                        <Code>$name</Code>, <Code>$pseudo</Code>, <Code>$amount</Code>, <Code>$rank</Code>
                    </ListItem>
                    <ListItem>
                        <strong>Getters :</strong> Créez les méthodes getter pour chaque propriété :
                        <Code>getName()</Code>, <Code>getPseudo()</Code>, <Code>getAmount()</Code>, <Code>getRank()</Code>
                    </ListItem>
                    <ListItem>
                        <strong>Méthode de formatage :</strong> Ajoutez une méthode <Code>getFormattedAmount()</Code>
                        qui retourne le montant formaté avec des espaces comme séparateurs de milliers et le symbole €.
                        Utilisez la fonction <Link
                        href="https://www.php.net/manual/fr/function.number-format.php" target="_blank"><Code>
                        {`number_format($amount,0,',', '')`}</Code></Link>.
                    </ListItem>
                    <ListItem>
                        <strong>Méthode de comparaison :</strong> Créez une
                        méthode <Code>isAboveAverage($average)</Code>
                        qui retourne <Code>true</Code> si le montant du streamer est supérieur à la moyenne passée en
                        paramètre.
                    </ListItem>
                    <ListItem>
                        <strong>Méthode de couleur :</strong> Implémentez une méthode <Code>getRankColor()</Code>
                        qui retourne &apos;gold&apos; pour le rang 1, &apos;silver&apos; pour le rang
                        2, &apos;bronze&apos; pour le rang 3,
                        et une chaîne vide pour les autres rangs. Utilisez un <Code>switch</Code>.
                    </ListItem>
                    <ListItem>
                        <strong>Méthode toString :</strong> Ajoutez une méthode <Code>__toString()</Code>
                        qui retourne une représentation textuelle du streamer : &quot;Le streamer $pseudo ($name) est
                        classé
                        $rank avec $amount euros&quot;.
                    </ListItem>
                    <ListItem>
                        <strong>Test :</strong> Créez quelques instances de votre classe et testez les méthodes
                        en affichant les informations des streamers.
                    </ListItem>
                    <ListItem>
                        <strong>Méthode de couleur :</strong> modifiez la méthode <Code>getRankColor()</Code> pour
                        utiliser un <Code>match</Code>.
                    </ListItem>
                </List>

            </Box>

            <Box>
                <Heading level={2}>E- Utilisation des objets dans le tableau</Heading>
                <Text>Dans un fichier <Code>~/public_html/TP1/zevent.php</Code>, vous allez maintenant utiliser votre
                    classe Streamer :</Text>

                <List ordered>
                    <ListItem>
                        <strong>Création du tableau :</strong> Créez le même tableau que rappel.html, mais en affichant
                        les données de <Code>$Streamers</Code>.
                    </ListItem>
                    <ListItem>
                        <strong>Calculs statistiques :</strong> Implémentez le calcul des statistiques suivantes en
                        utilisant les méthodes des objets :
                        <List>
                            <ListItem>Total collecté (somme de tous les montants)</ListItem>
                            <ListItem>Moyenne des montants</ListItem>
                            <ListItem>Montant minimum et maximum</ListItem>
                            <ListItem>Nombre de streamers</ListItem>
                        </List>
                    </ListItem>
                    <ListItem>
                        <strong>Affichage du podium :</strong>
                        Créez un fichier CSS avec les classes suivantes et ajoutez-le dans la
                        balise <Code>{`<head>`}</Code> de <Code>zevent.php</Code> :
                        <List ordered>
                            <ListItem><Code>{`.gold {background-color:#FFD700;}`}</Code></ListItem>
                            <ListItem><Code>{`.silver {background-color:#C0C0C0;}`}</Code></ListItem>
                            <ListItem><Code>{`.bronze{background-color:#CD7F32;}`}</Code></ListItem>
                        </List>
                        Ensuite, utilisez la fonction <Code>getRankColor()</Code> de la
                        classe <Code>Streamer</Code> pour
                        déterminer la classe CSS à appliquer à chaque <Code>&lt;tr&gt;</Code> selon le rang du streamer
                        et affichez le rang dans la ligne correspondante.
                    </ListItem>
                </List>

                <Text><strong>Structure de départ :</strong></Text>
                <CodeCard language="php" filename="zevent.php">
                    {`<?php

// Création du tableau d'objets streamers
$streamers = [
${streamersData.map((streamer) => `\tnew Streamer("${streamer.name}","${streamer.pseudo}",${streamer.lastAmount},${streamer.rank})`).join(',\n')}
];

// Calculs statistiques
// À COMPLÉTER : implémenter les calculs

// À COMPLÉTER : Affichage du tableau
?>`}
                </CodeCard>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Indicateur</TableHead>
                            <TableHead>Valeur</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Total Collecté</TableCell>
                            <TableCell>{formatNumberToFrench(totalAmount)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Moyenne des Dons</TableCell>
                            <TableCell>{formatNumberToFrench(averageAmount)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Montant Minimum</TableCell>
                            <TableCell>{formatNumberToFrench(minAmount)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Montant Maximum</TableCell>
                            <TableCell>{formatNumberToFrench(maxAmount)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Box>
            <Box>
                <Heading level={2}>F- Héritage - Streamers Remote vs Physiques</Heading>
                <List ordered>
                    <ListItem><strong>Class mére :</strong> Modifiez la class <Code>Streamer</Code> pour y ajouter la
                        méthode
                        abstraite <Code>getLocationInfo()</Code></ListItem>
                    <ListItem><strong>Class Remote :</strong> Créer la class <Code>RemoteStreamer</Code> héritant
                        de <Code>Streamer</Code> avec
                        la propriété
                        <Code>location</Code>, et ajouter y un Getter ainsi que la définition de la
                        méthode <Code>getLocationInfo()</Code> <Code>{`"À distance depuis {$this->location}"`}</Code>
                    </ListItem>

                    <ListItem><strong>Class Physical :</strong> Créer la class <Code>PhysicalStreamer </Code> héritant
                        de <Code>Streamer</Code> avec
                        la propriété
                        <Code>setupNumber </Code>, et ajouter y un Getter ainsi que la définition de la
                        méthode <Code>getLocationInfo()</Code> : <Code>{`"Sur site au setup #{$this->setupNumber}"`}</Code>
                    </ListItem>
                    <ListItem><strong>Test</strong> remplacez le tableau <Code>streamers</Code> par :</ListItem>

                    <CodeCard language="php">
                        {`$streamers = [
 ${streamersData.map((streamer) => `\tnew ${streamer.isRemote ? 'Remote' : 'Physical'}Streamer("${streamer.name}","${streamer.pseudo}",${streamer.lastAmount},${streamer.rank},${streamer.isRemote ? `"${streamer.city}"` : streamer.setupNumber})`).join(',\n')}
]`}
                    </CodeCard>
                </List>
            </Box>

        </section>
    );
}

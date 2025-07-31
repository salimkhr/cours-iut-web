import InputCard from "@/components/Cards/InputCard";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import Box from "@/components/ui/Box";
import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import Heading from "@/components/ui/Heading";
import Code from "@/components/ui/Code";
import {Stack, VStack} from "@/components/ui/Stack";
import Grid from "@/components/ui/Grid";
import {Button} from "@/components/ui/button";
import CodeWithPreviewCard, {CodePanel, PreviewPanel} from "@/components/Cards/CodeWithPreviewCard";

export default function LesFormulaires() {

    /*const frameworks = createListCollection({
        items: [
            {label: "Apple", value: "Apple"},
            {label: "Banana", value: "Banana"},
            {label: "Cherry", value: "Cherry"},
            {label: "Date", value: "Date"},
            {label: "Grape", value: "Grape"},
        ],
    })*/

    return (
        <section>
            {/*<Toaster/>*/}
            <Box>
                {/* Création d'un formulaire HTML */}
                <Heading level={2}>A- Création d&apos;un formulaire HTML</Heading>
                <Heading level={3}>1. Structure de base d’un formulaire HTML</Heading>
                <Text>
                    Un formulaire HTML est constitué de la balise <Code>&lt;form&gt;</Code> qui encapsule différents
                    éléments d&apos;entrée permettant à l&apos;utilisateur de saisir des données. La structure de
                    base
                    d’un formulaire HTML inclut les éléments suivants :
                </Text>
                <List>
                    <ListItem>Balise <Code>&lt;form&gt;</Code> : Enveloppe le formulaire. Elle contient des
                        attributs
                        essentiels comme action et method.
                        <List>
                            <ListItem>action : Spécifie l&apos;URL vers laquelle les données du formulaire seront
                                envoyées.</ListItem>
                            <ListItem>method : Définit la méthode de soumission des données (GET ou POST).</ListItem>
                        </List>
                    </ListItem>
                    <ListItem>
                        Champs d&apos;entrée
                        (<Code>&lt;input&gt;</Code>, <Code>&lt;textarea&gt;</Code>, <Code>&lt;select&gt;</Code>) :
                        Permettant aux utilisateurs de saisir des données.
                    </ListItem>
                    <ListItem>
                        libéllé
                        (<Code>&lt;label&gt;</Code>) :
                        Permettant aux utilisateurs de savoir a quoi correspond l&apos;input.
                    </ListItem>
                    <ListItem>
                        Bouton de soumission (<Code>&lt;input type=&quot;submit&quot;&gt;</Code> ou <Code>&lt;button
                        type=&quot;submit&quot;&gt;</Code>) : Permettant de soumettre le formulaire.
                    </ListItem>
                </List>
                <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<form method="get" action="index.php">
                    <label for="input-hello">Hello</label>
                    <input type="text" value="Hello" id="input-hello">
                    
                    <input type="submit" value="send">
                </form>`}</CodePanel>
                    <PreviewPanel>
                        <form method="get" className="space-y-4 max-w-md mx-auto">
                            <div className="flex items-center gap-4">
                                <label htmlFor="input-hello" className="w-32 font-semibold">Hello:</label>
                                <input
                                    type="text"
                                    id="input-hello"
                                    name="input-hello"
                                    defaultValue="Hello"
                                    className="flex-1 p-2 border rounded"
                                />
                            </div>

                            <div className="pt-2 text-right">
                                <input
                                    type="submit"
                                    value="Send"
                                    className="bg-html-css text-white py-2 px-4 rounded cursor-pointer w-full"
                                />
                            </div>
                        </form>
                    </PreviewPanel>
                </CodeWithPreviewCard>
                <Heading level={3}>2. Types d’entrées dans un formulaire</Heading>
                {/* Section Champs de texte */}
                <Box>
                    <Heading level={4}>Champs de texte</Heading>
                    <Grid
                        templateColumns={{
                            base: "1fr",         // Une seule colonne sur les petits écrans
                            sm: "repeat(auto-fit, minmax(300px, 1fr))", // Colonnes dès 300px en petit écran
                            md: "repeat(auto-fit, minmax(400px, 1fr))", // Colonnes dès 400px en moyen écran
                            lg: "repeat(auto-fit, minmax(450px, 1fr))"  // Colonnes dès 450px sur grands écrans
                        }}
                        gap={6}
                        width="100%"

                    >
                        <InputCard
                            title="Text"
                            description="Champ de texte pour entrer des informations simples"
                            language="html"
                            inputElement={<Input placeholder=" Username" className="mt-2 px-2"
                            />}
                        >
                            {`<input placeholder="Username" />`}
                        </InputCard>
                        <InputCard
                            title="Password"
                            description="Champ pour entrer un mot de passe avec des caractères masqués"
                            language="html"
                            inputElement={<Input type="password" placeholder=" Password" className="mt-2 px-2"
                            />}
                        >
                            {`<input type="password" placeholder="Password" />`}
                        </InputCard>
                        <InputCard
                            title="Search"
                            description="Champ pour entrer une requête de recherche"
                            language="html"
                            inputElement={<Input type="search" placeholder=" Search" className="mt-2 px-2"
                            />}
                        >
                            {`<input type="search" placeholder="Search" />`}

                        </InputCard>
                        <InputCard
                            title="Email"
                            description="Champ pour entrer une adresse e-mail avec validation"
                            language="html"
                            inputElement={<Input type="email" placeholder=" Email" className="mt-2 px-2"
                            />}
                        >
                            {`<input type="email" placeholder="Email" />`}
                        </InputCard>
                        <InputCard
                            title="Tel"
                            description="Champ pour entrer un numéro de téléphone avec validation du format"
                            language="html"
                            inputElement={<Input type="tel" placeholder=" 123-456-7890" className="mt-2 px-2"
                            />}
                        >
                            {`<input type="tel" placeholder="123-456-7890" />`}
                        </InputCard>
                        <InputCard
                            title="URL"
                            description="Champ pour entrer une URL avec validation du format"
                            language="html"
                            inputElement={<Input type="url" placeholder=" https://example.com"/>}
                        >
                            {`<input type="url" placeholder="https://example.com" />`}
                        </InputCard>
                        <InputCard
                            title="Textarea"
                            description="Zone de texte pour saisir plusieurs lignes"
                            language="html"
                            inputElement={
                                <Textarea
                                    id="textarea1"
                                    placeholder="Type your message here..."
                                    rows={4}
                                    cols={50}
                                />
                            }
                        >
                            {`<label for="textarea1">Your message:</label>\n<textarea id="textarea1" rows="4" cols="50">\n   Type your message here...\n</textarea>`}
                        </InputCard>
                    </Grid>
                </Box>

                {/* Section Boutons */}
                <Box>
                    <Heading level={4}>Boutons</Heading>
                    <Grid
                        templateColumns={{
                            base: "1fr",         // Une seule colonne sur les petits écrans
                            sm: "repeat(auto-fit, minmax(300px, 1fr))", // Colonnes dès 300px en petit écran
                            md: "repeat(auto-fit, minmax(400px, 1fr))", // Colonnes dès 400px en moyen écran
                            lg: "repeat(auto-fit, minmax(450px, 1fr))"  // Colonnes dès 450px sur grands écrans
                        }}
                        gap={6}
                        width="100%"

                    >
                        <InputCard
                            title="Button"
                            description="Bouton cliquable, souvent utilisé pour des actions"
                            language="html"
                            inputElement={<Button type="button">Click me</Button>}
                        >
                            {`<input type="button" value="Click me" />`}
                        </InputCard>
                        <InputCard
                            title="Reset"
                            description="Bouton pour réinitialiser les valeurs du formulaire"
                            language="html"
                            inputElement={<Button type="reset">Reset</Button>}
                        >
                            {`<input type="reset" value="Reset" />`}
                        </InputCard>
                        <InputCard
                            title="Submit"
                            description="Bouton pour soumettre le formulaire"
                            language="html"
                            inputElement={<Button type="submit">Submit</Button>}
                        >
                            {`<input type="submit" value="Submit" />`}
                        </InputCard>
                    </Grid>
                </Box>

                {/* Section Sélections */}
                <Box>
                    <Heading level={4}>Sélections</Heading>
                    <Grid
                        templateColumns={{
                            base: "1fr",         // Une seule colonne sur les petits écrans
                            sm: "repeat(auto-fit, minmax(300px, 1fr))", // Colonnes dès 300px en petit écran
                            md: "repeat(auto-fit, minmax(400px, 1fr))", // Colonnes dès 400px en moyen écran
                            lg: "repeat(auto-fit, minmax(450px, 1fr))"  // Colonnes dès 450px sur grands écrans
                        }}
                        gap={6}
                        width="100%"

                    >
                        <InputCard
                            title="Checkbox"
                            description="Case à cocher pour sélectionner une option"
                            language="html"
                            inputElement={
                                <>
                                    {/*<Checkbox.Root>*/}
                                    {/*    <Checkbox.HiddenInput/>*/}
                                    {/*    <Checkbox.Control/>*/}
                                    {/*    <Checkbox.Label>Check me</Checkbox.Label>*/}
                                    {/*</Checkbox.Root>*/}
                                    {/*<Checkbox.Root>*/}
                                    {/*    <Checkbox.HiddenInput/>*/}
                                    {/*    <Checkbox.Control/>*/}
                                    {/*    <Checkbox.Label>Check me too</Checkbox.Label>*/}
                                    {/*</Checkbox.Root>*/}
                                </>
                            }
                        >
                            {`<label for="checkbox1">Check me</label>\n<input type="checkbox" id="checkbox1" />\n\n<label for="checkbox2">Check me too</label>\n<input type="checkbox" id="checkbox2" />`}
                        </InputCard>
                        <InputCard
                            title="Radio"
                            description="Boutons radio pour sélectionner une option parmi plusieurs"
                            language="html"
                            // inputElement={
                            // <RadioGroup.Root defaultValue="option1" mt={2}>
                            //     <Stack direction="row">
                            //         <RadioGroup.Item value="option1">
                            //             <RadioGroup.ItemHiddenInput/>
                            //             <RadioGroup.ItemIndicator/>
                            //             <RadioGroup.ItemText>Option 1</RadioGroup.ItemText>
                            //         </RadioGroup.Item>
                            //         <RadioGroup.Item value="option2">
                            //             <RadioGroup.ItemHiddenInput/>
                            //             <RadioGroup.ItemIndicator/>
                            //             <RadioGroup.ItemText>Option 2</RadioGroup.ItemText>
                            //         </RadioGroup.Item>
                            //     </Stack>
                            // </RadioGroup.Root>
                            // }
                        >
                            {`<label for="radio1">Option 1</label>\n<input type="radio" id="radio1" value="option1" name="option"/>\n\n<label for="radio2">Option 2</label>\n<input type="radio" id="radio2" value="option2" name="option"/>`}
                        </InputCard>
                        <InputCard
                            title="Datalist"
                            description="Champ de texte avec une liste de suggestions"
                            language="html"
                            inputElement={
                                <>
                                    <Input id="inputWithList" list="fruits"/>
                                    <datalist id="fruits">
                                        <option value="Apple"/>
                                        <option value="Banana"/>
                                        <option value="Cherry"/>
                                        <option value="Date"/>
                                        <option value="Grape"/>
                                    </datalist>
                                </>
                            }
                        >
                            {`<label for="inputWithList">Choose a fruit:</label>
<Input id="inputWithList" list="fruits"/>
<datalist id="fruits">
    <option value="Apple" />
    <option value="Banana" />
    <option value="Cherry" />
    <option value="Date" />
    <option value="Grape" />
    </datalist>`}
                        </InputCard>
                        <InputCard
                            title="Select"
                            description="Menu déroulant pour sélectionner une option"
                            language="html"
                            // inputElement={
                            // <Select.Root collection={frameworks} size="sm" width="320px">
                            //     <Select.HiddenSelect/>
                            //     <Select.Label>Choose a fruit:</Select.Label>
                            //     <Select.Control>
                            //         <Select.Trigger>
                            //             <Select.ValueText/>
                            //         </Select.Trigger>
                            //         <Select.IndicatorGroup>
                            //             <Select.Indicator/>
                            //         </Select.IndicatorGroup>
                            //     </Select.Control>
                            //     <Portal>
                            //         <Select.Positioner>
                            //             <Select.Content>
                            //                 {frameworks.items.map((framework) => ( <Select.Item item={framework} key={framework.value}>     {framework.label}     <Select.ItemIndicator/> </Select.Item>
                            //                 ))}
                            //             </Select.Content>
                            //         </Select.Positioner>
                            //     </Portal>
                            // </Select.Root>
                            //  }
                        >
                            {`<label for="select1">Choose a fruit:</label>

<select id="select1">
    <option value="Apple">Apple</option>
    <option value="Banana">Banana</option>
    <option value="Cherry">Cherry</option>
    <option value="Date">Date</option>
    <option value="Grape">Grape</option>
</select>
`}
                        </InputCard>
                        <InputCard
                            title="Range"
                            description="Champ pour sélectionner une valeur dans une plage"
                            language="html"
                            // inputElement={
                            // <Slider.Root width="200px" min={0} max={100}>
                            //     <Slider.Control>
                            //         <Slider.Track>
                            //             <Slider.Range/>
                            //         </Slider.Track>
                            //         <Slider.Thumbs/>
                            //     </Slider.Control>
                            // </Slider.Root>
                            // }
                        >
                            {`<label for="range1">Select a range:</label>\n<input type="range" id="range1" min="0" max="100" />`}
                        </InputCard>
                    </Grid>
                </Box>

                {/* Section Date et heure */}
                <Box>
                    <Heading level={4}>Date et heure</Heading>
                    <Grid
                        templateColumns={{
                            base: "1fr",         // Une seule colonne sur les petits écrans
                            sm: "repeat(auto-fit, minmax(300px, 1fr))", // Colonnes dès 300px en petit écran
                            md: "repeat(auto-fit, minmax(400px, 1fr))", // Colonnes dès 400px en moyen écran
                            lg: "repeat(auto-fit, minmax(450px, 1fr))"  // Colonnes dès 450px sur grands écrans
                        }}
                        gap={6}
                        width="100%">
                        <InputCard
                            title="Date"
                            description="Champ pour sélectionner une date"
                            language="html"
                            inputElement={<Input type="date" className="mt-2 px-2"/>}
                        >
                            {`<input type="date" />`}
                        </InputCard>
                        <InputCard
                            title="Datetime-local"
                            description="Champ pour sélectionner une date et une heure"
                            language="html"
                            inputElement={<Input type="datetime-local" className="mt-2 px-2"
                            />}
                        >
                            {`<input type="datetime-local" />`}
                        </InputCard>
                        <InputCard
                            title="Month"
                            description="Champ pour sélectionner un mois et une année"
                            language="html"
                            inputElement={<Input type="month" className="mt-2 px-2"/>}
                        >
                            {`<input type="month" />`}
                        </InputCard>
                        <InputCard
                            title="Time"
                            description="Champ pour sélectionner une heure"
                            language="html"
                            inputElement={<Input type="time" className="mt-2 px-2"/>}
                        >
                            {`<input type="time" />`}
                        </InputCard>
                        <InputCard
                            title="Week"
                            description="Champ pour sélectionner une semaine"
                            language="html"
                            inputElement={<Input type="week" className="mt-2 px-2"/>}
                        >
                            {`<input type="week" />`}
                        </InputCard>
                    </Grid>
                </Box>

                {/* Section Divers */}
                <Box>
                    <Heading level={3}>Divers</Heading>
                    <Grid
                        templateColumns={{
                            base: "1fr",         // Une seule colonne sur les petits écrans
                            sm: "repeat(auto-fit, minmax(300px, 1fr))", // Colonnes dès 300px en petit écran
                            md: "repeat(auto-fit, minmax(400px, 1fr))", // Colonnes dès 400px en moyen écran
                            lg: "repeat(auto-fit, minmax(450px, 1fr))"  // Colonnes dès 450px sur grands écrans
                        }}
                        gap={6}
                        width="100%">
                        <InputCard
                            title="Color"
                            description="Champ pour sélectionner une couleur"
                            language="html"
                            inputElement={<Input type="color" className="mt-2 px-2"/>}
                        >
                            {`<input type="color" />`}
                        </InputCard>
                        <InputCard
                            title="File"
                            description="Champ pour sélectionner un fichier à télécharger"
                            language="html"
                            inputElement={<Input type="file" className="mt-2 px-2"/>}
                        >
                            {`<input type="file" />`}
                        </InputCard>
                        <InputCard
                            title="Number"
                            description="Champ pour entrer des nombres avec des contrôles de valeurs"
                            language="html"
                            inputElement={<Input type="number" min="0" max="120" className="mt-2 px-2"
                            />}
                        >
                            {`<input type="number" min="0" max="120" />`}
                        </InputCard>
                        <InputCard
                            title="Hidden"
                            description="Champ caché, souvent utilisé pour stocker des informations non visibles"
                            language="html"
                            inputElement={<Stack><Input type="hidden" value="hiddenValue"/></Stack>}
                        >
                            {`<input type="hidden" value="hiddenValue" />`}
                        </InputCard>
                    </Grid>
                    <Heading level={3}>3. Validation des formulaires en HTML5 </Heading>
                    <Text>HTML5 propose des outils de validation intégrés qui permettent de vérifier la saisie des
                        utilisateurs</Text>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Attribut</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell><Code>required</Code></TableCell>
                                <TableCell>Rend un champ obligatoire</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>minlength</Code>/<Code>maxlength</Code></TableCell>
                                <TableCell>Définit la longueur minimale/maximale d’un champ texte</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>pattern</Code></TableCell>
                                <TableCell>Utilise une expression régulière pour imposer un format
                                    spécifique</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>step</Code>/<Code>min</Code>/<Code>max</Code></TableCell>
                                <TableCell> Définit un incrément spécifique pour un champ numérique ainsi
                                    qu&apos;une
                                    valeur
                                    minimal et maximal</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>type</Code></TableCell>
                                <TableCell> type Certains types d’input (email, url, number) intègrent déjà des
                                    validations
                                    automatiques</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>


                    <Heading level={3}>4. L&apos;auto complete </Heading>
                    <Text>
                        L&apos;attribut <Code>autocomplete</Code> permet de spécifier si le navigateur doit ou non
                        suggérer des informations sauvegardées (comme des informations d&apos;identification, des
                        adresses ou des informations de carte bancaire) dans un formulaire.
                    </Text>


                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Categorie</TableHead>
                                <TableHead>Valeur <Code>autocomplete</Code></TableHead>
                                <TableHead>Utilisation</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Informations personnelles */}
                            <TableRow>
                                <TableHead scope="col" rowSpan={8}>Informations
                                    personnelles</TableHead>
                                <TableCell><Code>name</Code></TableCell>
                                <TableCell>Nom complet</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>given-name</Code></TableCell>
                                <TableCell>Prénom</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>family-name</Code></TableCell>
                                <TableCell>Nom de famille</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>nickname</Code></TableCell>
                                <TableCell>Pseudo</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>email</Code></TableCell>
                                <TableCell>Adresse e-mail</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>username</Code></TableCell>
                                <TableCell>Nom d&apos;utilisateur</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>new-password</Code></TableCell>
                                <TableCell>Mot de passe (nouveau)</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>current-password</Code></TableCell>
                                <TableCell>Mot de passe (existant)</TableCell>
                            </TableRow>
                            {/* Coordonnées */}
                            <TableRow>
                                <TableHead scope="col" rowSpan={6}>Coordonnées</TableHead>
                                <TableCell><Code>street-address</Code></TableCell>
                                <TableCell>Adresse complète</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>address-line1</Code></TableCell>
                                <TableCell>Adresse - ligne 1</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>address-line2</Code></TableCell>
                                <TableCell>Adresse - ligne 2</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>postal-code</Code></TableCell>
                                <TableCell>Code postal</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>city</Code></TableCell>
                                <TableCell>Ville</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>country</Code></TableCell>
                                <TableCell>Pays</TableCell>
                            </TableRow>
                            {/* Téléphone & Contact */}
                            <TableRow>
                                <TableHead scope="col" rowSpan={4}>Téléphone & Contact</TableHead>
                                <TableCell><Code>tel</Code></TableCell>
                                <TableCell>Numéro de téléphone</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>tel-country-code</Code></TableCell>
                                <TableCell>Code pays (ex: +33)</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>tel-national</Code></TableCell>
                                <TableCell>Numéro sans indicatif</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>tel-area-code</Code></TableCell>
                                <TableCell>Code région (USA)</TableCell>
                            </TableRow>
                            {/* Informations bancaires */}
                            <TableRow>
                                <TableHead scope="col" rowSpan={6}>Informations bancaires</TableHead>
                                <TableCell><Code>cc-name</Code></TableCell>
                                <TableCell>Nom sur la carte</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>cc-number</Code></TableCell>
                                <TableCell>Numéro de carte bancaire</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>cc-exp</Code></TableCell>
                                <TableCell>Date d’expiration (MM/AA)</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>cc-exp-month</Code></TableCell>
                                <TableCell>Mois d&apos;expiration</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>cc-exp-year</Code></TableCell>
                                <TableCell>Année d&apos;expiration</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>cc-csc</Code></TableCell>
                                <TableCell>Code de sécurité (CVC)</TableCell>
                            </TableRow>
                            {/* Autres */}
                            <TableRow>
                                <TableHead scope="col" rowSpan={3}>Autres</TableHead>
                                <TableCell><Code>bday</Code></TableCell>
                                <TableCell>Date de naissance (AAAA-MM-JJ)</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>sex</Code></TableCell>
                                <TableCell>Genre</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>one-time-code</Code></TableCell>
                                <TableCell>Code de vérification (OTP, double authentification)</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>


                    <Box>
                        <Heading level={4}>Formulaire d&apos;inscription</Heading>
                        <Text>
                            Dans un formulaire d&apos;inscription, vous pouvez utiliser l&apos;auto-completion pour
                            pré-remplir des champs comme le nom, l&apos;adresse e-mail et d&apos;autres informations
                            personnelles.
                        </Text>
                        <CodeWithPreviewCard language="html">
                            <CodePanel>
                                {`<form action="/submit" method="post">
    <label for="firstname">First Name:</label>
    <input type="text" id="firstname" name="firstname" placeholder="Enter your first name" autocomplete="given-name" required>
    
    <label for="lastname">Last Name:</label>
    <input type="text" id="lastname" name="lastname"  placeholder="Enter your last name" autocomplete="family-name" required>
    
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" placeholder="Enter your email" autocomplete="email" required>
    
    <label for="password">Password:</label>
    <input type="password" id="password" name="password"  placeholder="Enter your password" autocomplete="new-password" required>
    
    <input type="submit" value="Register">
</form>`}
                            </CodePanel>
                            <PreviewPanel>
                                <VStack>
                                    <form>
                                        <div className="flex items-center gap-4">
                                            <label htmlFor="firstname" className="w-32 font-semibold">First
                                                Name:</label>
                                            <input
                                                type="text"
                                                id="firstname"
                                                name="firstname"
                                                placeholder="Enter your first name"
                                                autoComplete="given-name"
                                                required
                                                className="flex-1 p-2 border rounded"
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <label htmlFor="lastname" className="w-32 font-semibold">Last Name:</label>
                                            <input
                                                type="text"
                                                id="lastname"
                                                name="lastname"
                                                placeholder="Enter your last name"
                                                autoComplete="family-name"
                                                required
                                                className="flex-1 p-2 border rounded"
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <label htmlFor="email" className="w-32 font-semibold">Email:</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                placeholder="Enter your email"
                                                autoComplete="email"
                                                required
                                                className="flex-1 p-2 border rounded"
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <label htmlFor="password" className="w-32 font-semibold">Password:</label>
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                placeholder="Enter your password"
                                                autoComplete="new-password"
                                                required
                                                className="flex-1 p-2 border rounded"
                                            />
                                        </div>

                                        <div className="pt-2 text-right">
                                            <input
                                                type="submit"
                                                value="Register"
                                                className="bg-html-css text-white py-2 px-4 rounded cursor-pointer w-full"
                                            />
                                        </div>
                                    </form>
                                </VStack>
                            </PreviewPanel>
                        </CodeWithPreviewCard>
                    </Box>

                    <Box>
                        <Heading level={4}>Formulaire de paiement (Carte bleue)</Heading>
                        <Text>
                            Dans un formulaire de paiement, vous pouvez également utiliser l&apos;auto-completion
                            pour
                            les informations liées à la carte bancaire comme le numéro de carte, la date
                            d&apos;expiration et le code de sécurité.
                        </Text>
                        <CodeWithPreviewCard language="html">
                            <CodePanel>
                                {`<form action="/payment" method="post" autocomplete="on">
                            <label for="cardnumber">Card Number:</label>
                            <input type="text" id="cardnumber" name="cardnumber" placeholder="Enter your card number" autocomplete="cc-number" required/>
                            
                            <label for="expiration">Expiration Date:</label>
                            <input type="month" id="expiration" name="expiration" placeholder="Select expiration date" autocomplete="cc-exp" required/>
                            
                            <label for="cvc">CVC:</label>
                            <input type="text" id="cvc" name="cvc" placeholder="Enter CVC" autocomplete="cc-csc" pattern="^\\d{3,4}$" required/>
                            
                            <input type="submit" value="Pay Now"/>
                        </form>`}
                            </CodePanel>
                            <PreviewPanel>
                                <VStack>
                                    <form action="/payment" method="post" autoComplete="on"
                                          className="space-y-4 max-w-md mx-auto">
                                        <div className="flex items-center gap-4">
                                            <label htmlFor="cardnumber" className="w-32 font-semibold">Card
                                                Number:</label>
                                            <input
                                                type="text"
                                                id="cardnumber"
                                                name="cardnumber"
                                                placeholder="Enter your card number"
                                                autoComplete="cc-number"
                                                required
                                                className="flex-1 p-2 border rounded"
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <label htmlFor="expiration"
                                                   className="w-32 font-semibold">Expiration:</label>
                                            <input
                                                type="month"
                                                id="expiration"
                                                name="expiration"
                                                placeholder="Select expiration date"
                                                autoComplete="cc-exp"
                                                required
                                                className="flex-1 p-2 border rounded"
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <label htmlFor="cvc" className="w-32 font-semibold">CVC:</label>
                                            <input
                                                type="text"
                                                id="cvc"
                                                name="cvc"
                                                placeholder="Enter CVC"
                                                autoComplete="cc-csc"
                                                pattern="^\d{3,4}$"
                                                required
                                                className="flex-1 p-2 border rounded"
                                            />
                                        </div>

                                        <div className="pt-2 text-right">
                                            <input
                                                type="submit"
                                                value="Pay Now"
                                                className="bg-html-css text-white py-2 px-4 rounded cursor-pointer hover:bg-green-700 w-full"
                                            />
                                        </div>
                                    </form>
                                </VStack>
                            </PreviewPanel>
                        </CodeWithPreviewCard>
                    </Box>
                </Box>
            </Box>
        </section>
    )
        ;
}
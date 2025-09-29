import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import Grid from "@/components/ui/Grid";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import CodeWithPreviewCard, {CodePanel, PreviewPanel} from "@/components/Cards/CodeWithPreviewCard";
import InputCard from "@/components/Cards/InputCard";
import CodeCard from "@/components/Cards/CodeCard";

export default function Cours() {
        return (
            <article>
                <section>
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
                                <ListItem>method : Définit la méthode de soumission des données (GET ou
                                    POST).</ListItem>
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
    <label for="input-hello">Hello : </label>
    <input type="text" value="Hello" id="input-hello">
    
    <input type="submit" value="send">
</form>`}</CodePanel>
                        <PreviewPanel>
                            <form method="get" action="index.php">
                                <label htmlFor="input-hello">Hello :</label>
                                <input type="text" defaultValue="Hello" id="input-hello" className={"input"}/>

                                <input type="submit" defaultValue="send" className={"button"}/>
                            </form>
                        </PreviewPanel>
                    </CodeWithPreviewCard>
                    <Heading level={3}>2. Types d’entrées dans un formulaire</Heading>
                    {/* Section Champs de texte */}
                    <section>
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
                                code={`<input placeholder="Username" />`}
                                inputElement={<input placeholder=" Username" className={"input"}/>}
                            />
                            <InputCard
                                title="Password"
                                description="Champ pour entrer un mot de passe avec des caractères masqués"
                                code={`<input type="password" placeholder="Password" />`}
                                inputElement={<input type="password" placeholder=" Password" className={"input"}/>}
                            />
                            <InputCard
                                title="Search"
                                description="Champ pour entrer une requête de recherche"
                                code={`<input type="search" placeholder="Search" />`}
                                inputElement={<input type="search" placeholder=" Search" className={"input"}/>}
                            />
                            <InputCard
                                title="Email"
                                description="Champ pour entrer une adresse e-mail avec validation"
                                code={`<input type="email" placeholder="Email" />`}
                                inputElement={<input type="email" placeholder=" Email" className={"input"}/>}
                            />
                            <InputCard
                                title="Tel"
                                description="Champ pour entrer un numéro de téléphone avec validation du format"
                                code={`<input type="tel" placeholder="123-456-7890" />`}
                                inputElement={<input type="tel" placeholder=" 123-456-7890" className={"input"}/>}
                            />
                            <InputCard
                                title="URL"
                                description="Champ pour entrer une URL avec validation du format"
                                code={`<input type="url" placeholder="https://example.com" />`}
                                inputElement={<input type="url" placeholder=" https://example.com" className={"input"}/>}
                            />
                            <InputCard
                                title="Textarea"
                                description="Zone de texte pour saisir plusieurs lignes"
                                code={`<label for="textarea1">Your message:</label>\n<textarea id="textarea1" rows="4" cols="50">\n   Type your message here...\n</textarea>`}
                                inputElement={
                                    <textarea
                                        id="textarea1"
                                        placeholder="Type your message here..."
                                        rows={4}
                                        cols={50}
                                        className="input"
                                    />
                                }
                            />
                        </Grid>
                    </section>

                    {/* Section Boutons */}
                    <section>
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
                                code={`<input type="button" value="Click me" />`}
                                inputElement={<button type="button" className="button">Click me</button>}
                            />
                            <InputCard
                                title="Reset"
                                description="Bouton pour réinitialiser les valeurs du formulaire"
                                code={`<input type="reset" value="Reset" />`}
                                inputElement={<button type="reset" className="button">Reset</button>}
                            />
                            <InputCard
                                title="Submit"
                                description="Bouton pour soumettre le formulaire"
                                code={`<input type="submit" value="Submit" />`}
                                inputElement={<button type="submit" className="button">Submit</button>}
                            />
                        </Grid>
                    </section>

                    {/* Section Sélections */}
                    <section>
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
                                code={`<label for="checkbox1">Check me</label>\n<input type="checkbox" id="checkbox1" />\n\n<label for="checkbox2">Check me too</label>\n<input type="checkbox" id="checkbox2" />`}
                                inputElement={
                                    <>
                                        <label htmlFor="checkbox1">Check me</label>
                                        <input type="checkbox" id="checkbox1" className="button"/>

                                        <label htmlFor="checkbox2">Check me too</label>
                                        <input type="checkbox" id="checkbox2" className="button"/>
                                    </>
                                }
                            />
                            <InputCard
                                title="Radio"
                                description="Boutons radio pour sélectionner une option parmi plusieurs"
                                code={`<label for="radio1">Option 1</label>\n<input type="radio" id="radio1" value="option1" name="option"/>\n\n<label for="radio2">Option 2</label>\n<input type="radio" id="radio2" value="option2" name="option"/>`}
                                inputElement={
                                <>
                                    <label htmlFor="radio1">Option 1</label>
                                    <input type="radio" id="radio1" value="option1" name="option" className="button"/>

                                    <label htmlFor="radio2">Option 2</label>
                                    <input type="radio" id="radio2" value="option2" name="option" className="button"/>
                                </>
                                }
                            />
                            <InputCard
                                title="Datalist"
                                description="Champ de texte avec une liste de suggestions"
                                code={`<label for="inputWithList">Choose a fruit:</label>
<input id="inputWithList" list="fruits"/>
<datalist id="fruits">
    <option value="Apple" />
    <option value="Banana" />
    <option value="Cherry" />
    <option value="Date" />
    </datalist>`}
                                inputElement={
                                    <>
                                        <input id="inputWithList" list="fruits" className="input"/>
                                        <datalist id="fruits">
                                            <option value="Apple"/>
                                            <option value="Banana"/>
                                            <option value="Cherry"/>
                                            <option value="Date"/>
                                            <option value="Grape"/>
                                        </datalist>
                                    </>
                                }
                            />
                            <InputCard
                                title="Select"
                                description="Menu déroulant pour sélectionner une option"
                                code={`<label for="select1">Choose a fruit:</label>

<select id="select1" >
    <option value="Apple">Apple</option>
    <option value="Banana">Banana</option>
    <option value="Cherry">Cherry</option>
    <option value="Date">Date</option>
    <option value="Grape">Grape</option>
</select>
`}
                                inputElement={
                                    <>
                                        <label htmlFor="select1">Choose a fruit:</label>

                                        <select id="select1" className="input">
                                            <option value="Apple">Apple</option>
                                            <option value="Banana">Banana</option>
                                            <option value="Cherry">Cherry</option>
                                            <option value="Date">Date</option>
                                            <option value="Grape">Grape</option>
                                        </select>
                                    </>
                                }
                            />
                            <InputCard
                                title="Range"
                                description="Champ pour sélectionner une valeur dans une plage"
                                code={`<label for="range1">Select a range:</label>\n<input type="range" id="range1" min="0" max="100" />`}
                                inputElement={
                                    <>
                                        <label htmlFor="range1">Select a range:</label>
                                        <input type="range" id="range1" min="0" max="100" className="input"/>
                                    </>
                                }
                            />
                        </Grid>
                    </section>

                    {/* Section Date et heure */}
                    <section>
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
                                code={`<input type="date" />`}
                                inputElement={<input type="date" className="input"/>}
                            />
                            <InputCard
                                title="Datetime-local"
                                description="Champ pour sélectionner une date et une heure"
                                code={`<input type="datetime-local" />`}
                                inputElement={<input type="datetime-local" className="input"/>}
                            />
                            <InputCard
                                title="Month"
                                description="Champ pour sélectionner un mois et une année"
                                code={`<input type="month" />`}
                                inputElement={<input type="month" className="input"/>}
                            />
                            <InputCard
                                title="Time"
                                description="Champ pour sélectionner une heure"
                                code={`<input type="time" />`}
                                inputElement={<input type="time" className="input"/>}
                            />
                            <InputCard
                                title="Week"
                                description="Champ pour sélectionner une semaine"
                                code={`<input type="week" />`}
                                inputElement={<input type="week" className="input"/>}
                            />
                        </Grid>
                    </section>

                    {/* Section Divers */}
                    <section>
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
                                code={`<input type="color" />`}
                                inputElement={<input type="color" className="input"/>}
                            />
                            <InputCard
                                title="File"
                                description="Champ pour sélectionner un fichier à télécharger"
                                code={`<input type="file" />`}
                                inputElement={<input type="file" className="input"/>}
                            />
                            <InputCard
                                title="Number"
                                description="Champ pour entrer des nombres avec des contrôles de valeurs"
                                code={`<input type="number" min="0" max="120" />`}
                                inputElement={<input type="number" min="0" max="120" className="input"/>}
                            />
                            <InputCard
                                title="Hidden"
                                description="Champ caché, souvent utilisé pour stocker des informations non visibles"
                                code={`<input type="hidden" value="hiddenValue" />`}
                                inputElement={<input type="hidden" value="hiddenValue" className="input"/>}
                            />
                        </Grid>
                        <Heading level={3}>3. Validation des formulaires en HTML5</Heading>
                        <Text>HTML5 propose des outils de validation intégrés qui permettent de vérifier la saisie des
                            utilisateurs</Text>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Attribut</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Exemple</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell><Code>name</Code></TableCell>
                                    <TableCell>Nom du champ utilisé pour identifier la donnée côté serveur</TableCell>
                                    <TableCell><Code>{`name="username"`}</Code></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><Code>id</Code></TableCell>
                                    <TableCell>Identifiant unique pour lier avec un label ou manipuler en JavaScript</TableCell>
                                    <TableCell><Code>{`id="user-email"`}</Code></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><Code>value</Code></TableCell>
                                    <TableCell>Valeur par défaut du champ</TableCell>
                                    <TableCell><Code>{`value="John"`}</Code></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><Code>placeholder</Code></TableCell>
                                    <TableCell>Texte indicatif affiché dans le champ vide</TableCell>
                                    <TableCell><Code>{`placeholder="Entrez votre nom"`}</Code></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><Code>disabled</Code></TableCell>
                                    <TableCell>Désactive le champ (non modifiable, non envoyé)</TableCell>
                                    <TableCell><Code>{`disabled`}</Code></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><Code>readonly</Code></TableCell>
                                    <TableCell>Champ en lecture seule (non modifiable mais envoyé)</TableCell>
                                    <TableCell><Code>{`readonly`}</Code></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><Code>required</Code></TableCell>
                                    <TableCell>Champs obligatoire. le Navigateur bloque l&apos;envois du formulaire</TableCell>
                                    <TableCell><Code>{`required`}</Code></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>


                        <Heading level={3}>4. L&apos;auto complete</Heading>
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


                        <section>
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
                                    <form action="/submit" method="post">
                                        <label htmlFor="firstname">First Name:</label>
                                        <input type="text" id="firstname" name="firstname"
                                               placeholder="Enter your first name" autoComplete="given-name" required className="input"/>

                                        <label htmlFor="lastname">Last Name:</label>
                                        <input type="text" id="lastname" name="lastname"
                                               placeholder="Enter your last name" autoComplete="family-name" required className="input"/>

                                        <label htmlFor="email">Email:</label>
                                        <input type="email" id="email" name="email" placeholder="Enter your email"
                                               autoComplete="email" required className="input"/>

                                        <label htmlFor="password">Password:</label>
                                        <input type="password" id="password" name="password"
                                               placeholder="Enter your password" autoComplete="new-password" required className="input"/>

                                        <input type="submit" value="Register" className="button"/>
                                    </form>
                                </PreviewPanel>
                            </CodeWithPreviewCard>
                        </section>

                        <section>
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
    <input type="text" id="cardnumber" name="cardnumber" placeholder="Enter your card number" autocomplete="cc-number" required>
    
    <label for="expiration">Expiration Date:</label>
    <input type="month" id="expiration" name="expiration" placeholder="Select expiration date" autocomplete="cc-exp" required>
    
    <label for="cvc">CVC:</label>
    <input type="text" id="cvc" name="cvc" placeholder="Enter CVC" autocomplete="cc-csc" pattern="^\\d{3,4}$" required>
    
    <input type="submit" value="Pay Now">
</form>`}
                                </CodePanel>
                                <PreviewPanel>
                                    <form action="/payment" method="post" autoComplete="on">
                                        <label htmlFor="cardnumber">Card Number:</label>
                                        <input type="text" id="cardnumber" name="cardnumber"
                                               placeholder="Enter your card number" autoComplete="cc-number" required className="input"/>

                                        <label htmlFor="expiration">Expiration Date:</label>
                                        <input type="month" id="expiration" name="expiration"
                                               placeholder="Select expiration date" autoComplete="cc-exp" required className="input"/>

                                        <label htmlFor="cvc">CVC:</label>
                                        <input type="text" id="cvc" name="cvc" placeholder="Enter CVC"
                                               autoComplete="cc-csc" pattern="^\d{3,4}$" required className="input"/>

                                        <input type="submit" value="Pay Now" className="button"/>
                                    </form>
                                </PreviewPanel>
                            </CodeWithPreviewCard>
                        </section>
                    </section>
                </section>
                <section className="mb-12">
                    <Heading level={2}>B- Transmission des données d&apos;un formulaire en PHP</Heading>

                    <Heading level={3}>1. Méthodes de soumission : GET et POST</Heading>

                    <Text>
                        En PHP, les données d&apos;un formulaire peuvent être soumises via deux méthodes principales :
                        GET et POST. Ces méthodes influencent comment les données sont envoyées au serveur et accessibles.
                    </Text>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Méthode</TableHead>
                                <TableHead>Caractéristiques</TableHead>
                                <TableHead>Usage recommandé</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell><Code>GET</Code></TableCell>
                                <TableCell>
                                    • Données dans l&apos;URL<br/>
                                    • Visible dans l&apos;historique<br/>
                                    • Limité à ~2000 caractères<br/>
                                    • Peut être mise en cache<br/>
                                    • Peut être bookmarké
                                </TableCell>
                                <TableCell>
                                    Recherches, filtres, pagination<br/>
                                    (données non sensibles)
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>POST</Code></TableCell>
                                <TableCell>
                                    • Données dans le corps HTTP<br/>
                                    • Invisible dans l&apos;URL<br/>
                                    • Pas de limite de taille<br/>
                                    • Non mis en cache<br/>
                                    • Non bookmarkable
                                </TableCell>
                                <TableCell>
                                    Formulaires d&apos;inscription, connexion,<br/>
                                    modifications de données
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>

                    <Heading level={3}>2. Les superglobales $_GET et $_POST</Heading>

                    <Text>
                        Pour les deux méthodes, la valeur d&apos;un champ de formulaire est récupérée en utilisant
                        le nom du champ défini par l&apos;attribut <Code>name</Code>. Par exemple,
                        dans <Code>{`<input type="text" name="username">`}</Code>, la valeur saisie sera accessible
                        via <Code>$_GET[&apos;username&apos;]</Code> ou <Code>$_POST[&apos;username&apos;]</Code> selon la méthode utilisée.
                    </Text>

                    <Heading level={4}>Exemple avec la méthode GET</Heading>
                    <Text>Les données apparaissent dans l&apos;URL : example.com/search.php?query=php&category=tutorial</Text>

                    <CodeCard language="html">
                        {`<!-- search.php -->
<form action="search.php" method="get">
    <label for="query">Recherche :</label>
    <input type="text" name="query" id="query">
    
    <label for="category">Catégorie :</label>
    <select name="category" id="category">
        <option value="tutorial">Tutoriel</option>
        <option value="documentation">Documentation</option>
    </select>
    
    <button type="submit">Rechercher</button>
</form>`}
                    </CodeCard>

                    <Text>Traitement en PHP avec $_GET - Récupération des paramètres de l&apos;URL</Text>
                    <CodeCard language="php">
                        {`<?php
// search.php

// Récupération des données GET
$query = $_GET['query'] ?? ''; //name="query" dans le formulaire
$category = $_GET['category'] ?? ''; //name="category" dans le formulaire

// Sécurisation avec htmlspecialchars
$query = htmlspecialchars($query, ENT_QUOTES, 'UTF-8');
$category = htmlspecialchars($category, ENT_QUOTES, 'UTF-8');

// Affichage
if (!empty($query)) {
    echo "Recherche : " . $query . "<br>";
    echo "Catégorie : " . $category;
} else {
    echo "Aucune recherche effectuée.";
}
?>`}
                    </CodeCard>

                    <Heading level={4}>Exemple avec la méthode POST</Heading>
                    <Text>Les données ne sont pas visibles dans l&apos;URL</Text>

                    <CodeCard language="html">
                        {`<!-- login.php -->
<form action="login.php" method="post">
    <label for="username">Nom d'utilisateur :</label>
    <input type="text" name="username" id="username" required>
    
    <label for="password">Mot de passe :</label>
    <input type="password" name="password" id="password" required>
    
    <button type="submit">Se connecter</button>
</form>`}
                    </CodeCard>

                    <Text>Traitement en PHP avec $_POST - Récupération des données du corps de la requête</Text>
                    <CodeCard language="php">
                        {`<?php
// login.php

// Récupération des données POST
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

// Sécurisation
$username = htmlspecialchars($username, ENT_QUOTES, 'UTF-8');

// Validation
if (empty($username) || empty($password)) {
    echo "Tous les champs sont obligatoires.";
} else {
    // Vérification des identifiants (exemple simplifié)
    // En production : utiliser password_verify() avec hash en BDD
    echo "Tentative de connexion pour : " . $username;
}
?>`}
                    </CodeCard>

                    <Heading level={3}>3. $_REQUEST : à utiliser avec précaution</Heading>

                    <Text>
                        <Code>$_REQUEST</Code> contient les données de <Code>$_GET</Code>, <Code>$_POST</Code> et
                        <Code>$_COOKIE</Code>. Bien qu&apos;elle soit pratique, son utilisation n&apos;est pas recommandée car :
                    </Text>

                    <List>
                        <ListItem>Elle ne permet pas de distinguer la source des données</ListItem>
                        <ListItem>Elle peut créer des conflits si des paramètres ont le même nom</ListItem>
                        <ListItem>Elle rend le code moins explicite et plus difficile à déboguer</ListItem>
                    </List>

                    <Text>
                        <strong>Recommandation :</strong> Utilisez toujours <Code>$_GET</Code> ou <Code>$_POST</Code> explicitement
                        selon la méthode de votre formulaire.
                    </Text>

                    <Heading level={3}>4. $_SERVER[&apos;REQUEST_METHOD&apos;] : Détection de la méthode HTTP</Heading>

                    <Text>
                        <Code>$_SERVER[&apos;REQUEST_METHOD&apos;]</Code> permet de connaître la méthode HTTP utilisée
                        pour accéder à la page (GET, POST, PUT, DELETE, etc.). C&apos;est utile pour créer une seule
                        page qui affiche le formulaire ET traite les données.
                    </Text>

                    <Text>Formulaire avec traitement dans le même fichier - Utilisation de REQUEST_METHOD pour séparer affichage et traitement</Text>
                    <CodeCard language="php">
                        {`<?php
// contact.php

$errors = [];
$success = false;
$name = '';
$email = '';
$message = '';

// Traitement uniquement si la méthode est POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupération et sécurisation des données
    $name = htmlspecialchars($_POST['name'] ?? '', ENT_QUOTES, 'UTF-8');
    $email = htmlspecialchars($_POST['email'] ?? '', ENT_QUOTES, 'UTF-8');
    $message = htmlspecialchars($_POST['message'] ?? '', ENT_QUOTES, 'UTF-8');
    
    // Validation
    if (empty($name)) {
        $errors[] = "Le nom est requis.";
    }
    
    if (empty($email)) {
        $errors[] = "L'email est requis.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "L'email n'est pas valide.";
    }
    
    if (empty($message)) {
        $errors[] = "Le message est requis.";
    } elseif (strlen($message) < 10) {
        $errors[] = "Le message doit contenir au moins 10 caractères.";
    }
    
    // Si pas d'erreurs, traiter les données
    if (empty($errors)) {
        // Traitement (envoi email, insertion BDD, etc.)
        $success = true;
        // Réinitialiser les champs après succès
        $name = '';
        $email = '';
        $message = '';
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Formulaire de contact</title>
    <style>
        .error { color: red; }
        .success { color: green; }
    </style>
</head>
<body>
    <h1>Contactez-nous</h1>
    
    <?php if ($success): ?>
        <p class="success">Votre message a été envoyé avec succès !</p>
    <?php endif; ?>
    
    <?php if (!empty($errors)): ?>
        <div class="error">
            <ul>
                <?php foreach ($errors as $error): ?>
                    <li><?= $error ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>
    
    <form action="contact.php" method="post">
        <div>
            <label for="name">Nom :</label>
            <input type="text" name="name" id="name" 
                   value="<?= htmlspecialchars($name) ?>" required>
        </div>
        
        <div>
            <label for="email">Email :</label>
            <input type="email" name="email" id="email" 
                   value="<?= htmlspecialchars($email) ?>" required>
        </div>
        
        <div>
            <label for="message">Message :</label>
            <textarea name="message" id="message" rows="5" required><?= htmlspecialchars($message) ?></textarea>
        </div>
        
        <button type="submit">Envoyer</button>
    </form>
</body>
</html>`}
                    </CodeCard>

                    <Text>
                        <strong>Avantages de cette approche :</strong>
                    </Text>
                    <List>
                        <ListItem>Un seul fichier PHP pour le formulaire et le traitement</ListItem>
                        <ListItem>Les erreurs sont affichées directement dans le formulaire</ListItem>
                        <ListItem>Les valeurs saisies sont conservées en cas d&apos;erreur</ListItem>
                        <ListItem>Code plus maintenable et organisé</ListItem>
                    </List>
                </section>

                {/* Section C - Sécurisation XSS */}
                <section className="mb-12">
                    <Heading level={2}>C- Sécurisation des données : Protection XSS</Heading>

                    <Heading level={3}>1. Qu&apos;est-ce qu&apos;une attaque XSS ?</Heading>

                    <Text>
                        XSS (Cross-Site Scripting) est une vulnérabilité qui permet à un attaquant d&apos;injecter
                        du code JavaScript malveillant dans une page web. Ce code s&apos;exécute ensuite dans le
                        navigateur des visiteurs, permettant le vol de cookies, de sessions, ou la manipulation
                        du contenu de la page.
                    </Text>

                    <Heading level={4}>Exemple d&apos;attaque XSS</Heading>

                    <Text>Code vulnérable (NE PAS UTILISER) - Sans protection, l&apos;injection de script est possible</Text>
                    <CodeCard language="php">
                        {`<?php
// VULNÉRABLE : Ne jamais faire cela !
$name = $_POST['name'];
echo "Bonjour " . $name;
?>

<!-- Si un utilisateur soumet : -->
<!-- <script>alert('XSS')</script> -->
<!-- Le script s'exécutera dans le navigateur ! -->`}
                    </CodeCard>

                    <Heading level={3}>2. Protection avec htmlspecialchars()</Heading>

                    <Text>
                        La fonction <Code>htmlspecialchars()</Code> convertit les caractères spéciaux en
                        entités HTML, empêchant ainsi l&apos;exécution de code malveillant.
                    </Text>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Caractère</TableHead>
                                <TableHead>Entité HTML</TableHead>
                                <TableHead>Résultat</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell><Code>&lt;</Code></TableCell>
                                <TableCell><Code>&amp;lt;</Code></TableCell>
                                <TableCell>Affiché comme texte, non interprété comme balise</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>&gt;</Code></TableCell>
                                <TableCell><Code>&amp;gt;</Code></TableCell>
                                <TableCell>Affiché comme texte, non interprété comme balise</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>&</Code></TableCell>
                                <TableCell><Code>&amp;amp;</Code></TableCell>
                                <TableCell>Empêche l&apos;injection d&apos;entités HTML</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>&quot;</Code></TableCell>
                                <TableCell><Code>&amp;quot;</Code></TableCell>
                                <TableCell>Protège les attributs HTML</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>&apos;</Code></TableCell>
                                <TableCell><Code>&amp;#039;</Code></TableCell>
                                <TableCell>Protège les attributs HTML (avec ENT_QUOTES)</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>

                    <Text>Protection correcte avec htmlspecialchars() - Le code JavaScript est neutralisé et affiché comme texte</Text>
                    <CodeCard language="php">
                        {`<?php
// SÉCURISÉ : Toujours utiliser htmlspecialchars()
$name = htmlspecialchars($_POST['name'] ?? '', ENT_QUOTES, 'UTF-8');
echo "Bonjour " . $name;

// Si un utilisateur soumet : <script>alert('XSS')</script>
// Ce qui sera affiché : &lt;script&gt;alert('XSS')&lt;/script&gt;
// Le navigateur affiche le texte sans exécuter le script
?>`}
                    </CodeCard>

                    <Heading level={3}>3. Paramètres de htmlspecialchars()</Heading>

                    <Text>Syntaxe complète - Tous les paramètres recommandés pour une protection maximale</Text>
                    <CodeCard language="php">
                        {`<?php
$safe_data = htmlspecialchars(
    $user_input,           // Données à sécuriser
    ENT_QUOTES,            // Convertir les guillemets simples ET doubles
    'UTF-8'                // Encodage (toujours spécifier UTF-8)
);
?>`}
                    </CodeCard>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Paramètre</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Valeur recommandée</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>1er paramètre</TableCell>
                                <TableCell>La chaîne à convertir</TableCell>
                                <TableCell>Variable utilisateur</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>ENT_QUOTES</Code></TableCell>
                                <TableCell>Convertit &quot; et &apos;</TableCell>
                                <TableCell>Toujours utiliser</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Code>&apos;UTF-8&apos;</Code></TableCell>
                                <TableCell>Encodage des caractères</TableCell>
                                <TableCell>Toujours spécifier</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>

                    <Heading level={3}>4. Exemples pratiques de protection XSS</Heading>

                    <Text>Affichage de commentaires utilisateur - Protection lors de l&apos;affichage de contenu généré par les utilisateurs</Text>
                    <CodeCard language="php">
                        {`<?php
// Récupération depuis la base de données ou formulaire
$comments = [
    [
        'author' => 'Jean',
        'content' => 'Super article !'
    ],
    [
        'author' => 'Pirate',
        'content' => '<script>alert("XSS")</script>'
    ]
];

foreach ($comments as $comment) {
    $author = htmlspecialchars($comment['author'], ENT_QUOTES, 'UTF-8');
    $content = htmlspecialchars($comment['content'], ENT_QUOTES, 'UTF-8');
    
    echo "<div class='comment'>";
    echo "<strong>" . $author . "</strong><br>";
    echo "<p>" . $content . "</p>";
    echo "</div>";
}

// Le script malveillant sera affiché comme texte, pas exécuté
?>`}
                    </CodeCard>

                    <Text>Protection dans les attributs HTML - CRITIQUE : Toujours protéger les données dans les attributs value, title, etc.</Text>
                    <CodeCard language="php">
                        {`<?php
$username = $_POST['username'] ?? '';
$search = $_GET['search'] ?? '';

// Sécurisation pour utilisation dans les attributs
$safe_username = htmlspecialchars($username, ENT_QUOTES, 'UTF-8');
$safe_search = htmlspecialchars($search, ENT_QUOTES, 'UTF-8');
?>

<!-- CORRECT : Protection dans les attributs -->
<input type="text" name="username" value="<?= $safe_username ?>">
<input type="search" name="search" value="<?= $safe_search ?>">
<a href="profile.php?user=<?= urlencode($safe_username) ?>" 
   title="Profil de <?= $safe_username ?>">
   <?= $safe_username ?>
</a>

<!-- INCORRECT : Sans protection, injection possible -->
<!-- <input type="text" value="<?= $username ?>"> -->
<!-- Un attaquant pourrait injecter : " onclick="alert('XSS')" -->`}
                    </CodeCard>

                    <Text>Formulaire complet avec protection XSS - Exemple réel de formulaire entièrement sécurisé</Text>
                    <CodeCard language="php">
                        {`<?php
$errors = [];
$name = '';
$email = '';
$bio = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // ÉTAPE 1 : Récupération ET sécurisation immédiate
    $name = htmlspecialchars($_POST['name'] ?? '', ENT_QUOTES, 'UTF-8');
    $email = htmlspecialchars($_POST['email'] ?? '', ENT_QUOTES, 'UTF-8');
    $bio = htmlspecialchars($_POST['bio'] ?? '', ENT_QUOTES, 'UTF-8');
    
    // ÉTAPE 2 : Validation
    if (empty($name)) {
        $errors[] = "Le nom est requis.";
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Email invalide.";
    }
    
    // ÉTAPE 3 : Traitement si valide
    if (empty($errors)) {
        // Ici : insertion en base de données, envoi d'email, etc.
        // Les données sont déjà sécurisées
        echo "<p>Inscription réussie pour " . $name . " !</p>";
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Inscription sécurisée</title>
</head>
<body>
    <?php if (!empty($errors)): ?>
        <div style="color: red;">
            <?php foreach ($errors as $error): ?>
                <p><?= $error ?></p>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
    
    <form method="post">
        <div>
            <label for="name">Nom :</label>
            <input type="text" name="name" id="name" 
                   value="<?= $name ?>" required>
        </div>
        
        <div>
            <label for="email">Email :</label>
            <input type="email" name="email" id="email" 
                   value="<?= $email ?>" required>
        </div>
        
        <div>
            <label for="bio">Biographie :</label>
            <textarea name="bio" id="bio" rows="4"><?= $bio ?></textarea>
        </div>
        
        <button type="submit">S'inscrire</button>
    </form>
</body>
</html>`}
                    </CodeCard>
                </section>
                {/* Récapitulatif */}
                <section className="mb-12 p-6">
                    <Heading level={2}>D- Récapitulatif</Heading>

                    <Heading level={3}>$_GET</Heading>
                    <List>
                        <ListItem>Données visibles dans l&apos;URL</ListItem>
                        <ListItem>Pour recherches, filtres, pagination</ListItem>
                        <ListItem>Limité en taille (~2000 caractères)</ListItem>
                    </List>

                    <Heading level={3}>$_POST</Heading>
                    <List>
                        <ListItem>Données dans le corps HTTP, invisibles dans l&apos;URL</ListItem>
                        <ListItem>Pour formulaires d&apos;inscription, connexion, modification</ListItem>
                        <ListItem>Pas de limite de taille</ListItem>
                    </List>

                    <Heading level={3}>$_SERVER[&apos;REQUEST_METHOD&apos;]</Heading>
                    <List>
                        <ListItem>Permet de détecter la méthode HTTP (GET, POST, etc.)</ListItem>
                        <ListItem>Utile pour combiner affichage et traitement dans un même fichier</ListItem>
                        <ListItem>Utiliser <Code>if ($_SERVER[&apos;REQUEST_METHOD&apos;] === &apos;POST&apos;)</Code></ListItem>
                    </List>

                    <Heading level={3}>Protection XSS</Heading>
                    <List>
                        <ListItem>
                            <strong>Toujours</strong> utiliser : <Code>htmlspecialchars($data, ENT_QUOTES, &apos;UTF-8&apos;)</Code>
                        </ListItem>
                        <ListItem>Sécuriser avant tout affichage de données utilisateur</ListItem>
                        <ListItem>Protéger dans le texte, les attributs HTML et les URL</ListItem>
                        <ListItem>Ne jamais afficher de données brutes sans protection</ListItem>
                    </List>
                </section>
            </article>
        );
}
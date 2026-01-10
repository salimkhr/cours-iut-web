import Heading from "@/components/ui/Heading";
import CodeCard from "@/components/Cards/CodeCard";
import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import Link from "next/link";

export default function TP() {
    return (
        <article>
            <section>
                <Heading level={2} netflex>A – Formulaire d&apos;inscription</Heading>

                <Heading level={3}>1. Correction des données</Heading>
                <CodeCard language="sql">
                    {`ALTER TABLE accounts
                        ADD COLUMN birthdate DATE;`}
                </CodeCard>

                <Heading level={3}>2. Le FormTrait</Heading>
                <Text>
                    Afin d&apos;éviter de répéter les appels à <Code>htmlentities()</Code>, créez le
                    trait <Code>app/trait/FormTrait.php</Code> contenant les méthodes suivantes :
                </Text>

                <List>
                    <ListItem>
                        <Code>sanitizeInput(string $input)</Code> : méthode privée retournant
                        <Code>htmlspecialchars(strip_tags(trim($input)));</Code>.
                        Elle nettoie l&apos;entrée afin d&apos;éviter les failles XSS.
                    </ListItem>

                    <ListItem>
                        <Code>getPostParam(string $key, mixed $default = null)</Code> : récupère un
                        paramètre POST en le nettoyant via <Code>sanitizeInput()</Code>.
                        Renvoie la valeur nettoyée ou la valeur par défaut si le paramètre n&apos;existe pas.
                    </ListItem>

                    <ListItem>
                        <Code>getQueryParam(string $key, mixed $default = null)</Code> : récupère un
                        paramètre GET en le nettoyant avec <Code>sanitizeInput()</Code>.
                        Renvoie la valeur nettoyée ou la valeur par défaut si le paramètre n&apos;existe pas.
                    </ListItem>

                    <ListItem>
                        <Code>getAllPostParams()</Code> : récupère tous les paramètres POST et les nettoie
                        avec <Code>sanitizeInput()</Code>.
                        Renvoie un tableau de paramètres nettoyés (vous pouvez utiliser la fonction{" "}
                        <Link href="https://www.php.net/manual/fr/function.array-map.php" target="_blank">
                            <Code>array_map()</Code>
                        </Link>{" "}
                        pour appliquer <Code>sanitizeInput()</Code> à chaque élément).
                    </ListItem>

                    <ListItem>
                        <Code>getAllQueryParams()</Code> : récupère tous les paramètres GET et les nettoie
                        avec <Code>sanitizeInput()</Code>.
                        Renvoie un tableau de paramètres nettoyés (vous pouvez utiliser{" "}
                        <Link href="https://www.php.net/manual/fr/function.array-map.php" target="_blank">
                            <Code>array_map()</Code>
                        </Link>{" "}
                        pour appliquer <Code>sanitizeInput()</Code> à chaque élément).
                    </ListItem>
                </List>

                <Heading level={3}>3. Le formulaire</Heading>
                <List ordered>
                    <ListItem>
                        Modifier le formulaire d&apos;inscription (<Code>RegisterController</Code>) pour utiliser le <Code>FormTrait</Code>{" "}
                        à la place de <Code>$_POST</Code>.
                    </ListItem>
                    <ListItem>
                        Dans le dossier <Code>app/entities</Code>, créer une classe <Code>Account</Code>{" "}
                        représentant la table <Code>accounts</Code>.
                    </ListItem>
                    <ListItem>
                        Dans le dossier <Code>app/repositories</Code>, créer une classe{" "}
                        <Code>AccountRepository</Code> contenant une méthode{" "}
                        <Code>create(Account $account)</Code>.
                    </ListItem>
                    <ListItem>
                        Si le formulaire est valide, utiliser le repository pour insérer une nouvelle
                        ligne dans la table <Code>accounts</Code>.
                        Le hachage du mot de passe se fera grâce à la fonction{" "}
                        <Link
                            href="https://www.php.net/manual/fr/function.password-hash.php"
                            target="_blank"
                        >
                            <Code>password_hash($password)</Code>
                        </Link>.
                    </ListItem>
                </List>
            </section>

            <section>
                <Heading level={2}>B – Les séries</Heading>

                <Heading level={3}>1. Création</Heading>
                <List ordered>
                    <ListItem>
                        Modifier le fichier <Code>public/admin.php</Code> pour y ajouter un{" "}
                        <Code>switch</Code> sur <Code>$_GET[&apos;action&apos;]</Code> :
                        <List>
                            <ListItem>
                                &apos;create&apos; =&gt; <Code>AdminSeriesController::create()</Code>
                            </ListItem>
                            <ListItem>
                                default =&gt; <Code>AdminSeriesController::list()</Code>
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        Ajouter la méthode <Code>create()</Code> au <Code>AdminSeriesController</Code>,
                        appelant uniquement la vue <Code>series_form</Code>.
                    </ListItem>

                    <ListItem>
                        Créer la vue <Code>series_form.html.php</Code> reprenant les inclusions du header et du footer
                        de <Code>series_list</Code>, et affichant un formulaire correspondant aux attributs
                        de la classe <Code>Series</Code> :
                        <List>
                            <ListItem>title (text)</ListItem>
                            <ListItem>description (textarea, optionnel)</ListItem>
                            <ListItem>releaseYearStart (number)</ListItem>
                            <ListItem>releaseYearEnd (number, optionnel, ≥ releaseYearStart)</ListItem>
                            <ListItem>currentSeason (number)</ListItem>
                            <ListItem>quality (select &quot;HD&quot;, &quot;4K&quot; optionnel)</ListItem>
                            <ListItem>audio
                                (select,&quot;EN&quot;,&quot;FR&quot;,&quot;PT&quot;,&quot;DZ&quot; optionnel)</ListItem>
                            <ListItem>
                                image (file, optionnel, type image) — ⚠️ nécessite{" "}
                                <Code>enctype=&quot;multipart/form-data&quot;</Code> dans la balise{" "}
                                <Code>&lt;form&gt;</Code> et <Code>accept=&quot;image/*&quot; dans l&apos;input</Code>.
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        Si le formulaire n&apos;est pas valide (champs requis manquants ou{" "}
                        <Code>releaseYearEnd</Code> invalide), réafficher le formulaire avec les données saisies
                        (hors image).
                    </ListItem>

                    <ListItem>
                        Gérer l&apos;upload d&apos;image grâce au service{" "}
                        <Code>ImageService</Code> :
                        <CodeCard language="php">
                            {`// Exemple dans AdminSeriesController::create()
$imageService = new ImageService();

// Si un fichier image a été envoyé
if (!empty($_FILES['image']['name'])) {
    $imageName = $imageService->uploadFile($_FILES['image']);
    if ($imageName !== false) {
        $series->setImage($imageName);
    } else {
        $errors[] = "L'image n'a pas pu être téléchargée (format ou erreur d'upload).";
    }
}`}
                        </CodeCard>
                    </ListItem>

                    <ListItem>
                        Les champs <Code>createdAt</Code> et{" "}
                        <Code>updatedAt</Code> doivent être
                        initialisés automatiquement (dans le constructeur ou le repository)
                    </ListItem>

                    <ListItem>
                        Ajouter une méthode <Code>create(Series $series)</Code> dans le{" "}
                        <Code>SeriesRepository</Code> permettant l&apos;insertion dans la table{" "}
                        <Code>series</Code>.
                    </ListItem>

                    <ListItem>
                        Si le formulaire est valide, appeler le repository pour insérer la nouvelle série
                        dans la base de données.
                    </ListItem>
                </List>

                <Heading level={3}>2. Mise à jour</Heading>
                <List ordered>
                    <ListItem>
                        Dans le fichier <Code>public/admin.php</Code>, ajouter un nouveau cas dans le{" "}
                        <Code>switch</Code> :
                        <List>
                            <ListItem>
                                &apos;edit&apos; =&gt; <Code>AdminSeriesController::edit()</Code>
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        Ajouter la méthode <Code>edit()</Code> au <Code>AdminSeriesController</Code> :
                        <List>
                            <ListItem>
                                Récupérer l&apos;ID de la série depuis <Code>$_GET[&apos;id&apos;]</Code>.
                            </ListItem>
                            <ListItem>
                                Utiliser le <Code>SeriesRepository</Code> pour récupérer la série existante.
                            </ListItem>
                            <ListItem>
                                Si la série n&apos;existe pas, rediriger vers la liste.
                            </ListItem>
                            <ListItem>
                                Appeler la vue <Code>series_form</Code> en passant la série existante.
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        Modifier la vue <Code>series_form.html.php</Code> pour accepter un paramètre{" "}
                        <Code>$edit</Code> (booléen) permettant de gérer les deux modes :
                        <List>
                            <ListItem>
                                Adapter l&apos;attribut <Code>action</Code> du formulaire :
                                <CodeCard language="php">
                                    {`<form action="admin.php?action=<?= $edit ? 'edit&id=' . $series->getId() : 'create' ?>" method="post" enctype="multipart/form-data">`}
                                </CodeCard>
                            </ListItem>
                            <ListItem>
                                Adapter le titre du formulaire (&quot;Créer une série&quot; ou &quot;Modifier
                                une série&quot;) selon la valeur de <Code>$edit</Code>.
                            </ListItem>
                            <ListItem>
                                Les champs sont déjà pré-remplis avec les valeurs de <Code>$series</Code>{" "}
                                (existante en mode édition, ou contenant les données saisies en cas d&apos;erreur).
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        Compléter la méthode <Code>edit()</Code> du <Code>AdminSeriesController</Code> pour
                        traiter la soumission du formulaire :
                        <List>
                            <ListItem>
                                Vérifier si le formulaire a été soumis (méthode POST).
                            </ListItem>
                            <ListItem>
                                Récupérer la série existante depuis la base de données via son ID.
                            </ListItem>
                            <ListItem>
                                Valider les données du formulaire (mêmes règles que pour la création).
                            </ListItem>
                            <ListItem>
                                Mettre à jour les propriétés de la série avec les nouvelles valeurs.
                            </ListItem>
                            <ListItem>
                                Le champs <Code>updatedAt</Code> doivent être initialisés automatiquement dans le
                                repository
                            </ListItem>
                            <ListItem>
                                Pour l&apos;image : si une nouvelle image est uploadée, supprimer l&apos;ancienne
                                via <Code>$imageService-&gt;deleteFile($oldImageName)</Code> avant de sauvegarder
                                la nouvelle.
                            </ListItem>
                            <ListItem>
                                Si le formulaire n&apos;est pas valide, réafficher le formulaire avec les données
                                saisies et <Code>$edit = true</Code>.
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        Ajouter une méthode <Code>update(Series $series)</Code> dans le{" "}
                        <Code>SeriesRepository</Code> permettant la mise à jour dans la table{" "}
                        <Code>series</Code>.
                    </ListItem>
                </List>

            </section>
            <section>
                <Heading level={2} netflex>C – Les épisodes</Heading>

                <p>
                    Reproduire la même logique que pour les séries (création et modification) pour gérer
                    les épisodes. La classe <Code>Episode</Code> possède les attributs suivants :
                </p>

                <List>
                    <ListItem><Code>seriesId</Code> (int) – référence vers la série parente</ListItem>
                    <ListItem><Code>title</Code> (string)</ListItem>
                    <ListItem><Code>season</Code> (int)</ListItem>
                    <ListItem><Code>episodeNumber</Code> (int)</ListItem>
                    <ListItem><Code>duration</Code> (string, optionnel) – format recommandé : &quot;HH:MM:SS&quot;
                    </ListItem>
                    <ListItem><Code>releaseDate</Code> (DateTime, optionnel)</ListItem>
                    <ListItem><Code>createdAt</Code> (DateTime)</ListItem>
                    <ListItem><Code>updatedAt</Code> (DateTime)</ListItem>
                </List>

                <Heading level={3}>1. Création</Heading>
                <List ordered>
                    <ListItem>
                        Créer la vue <Code>episode_form.html.php</Code> avec un formulaire contenant :
                        <List>
                            <ListItem>
                                <Code>seriesId</Code> (select) – récupérer toutes les séries via{" "}
                                <Code>SeriesRepository::findAll()</Code>
                            </ListItem>
                            <ListItem>title (text, requis)</ListItem>
                            <ListItem>season (number, requis)</ListItem>
                            <ListItem>episodeNumber (number, requis)</ListItem>
                            <ListItem>duration (text, optionnel, placeholder &quot;HH:MM:SS&quot;)</ListItem>
                            <ListItem>releaseDate (date, optionnel)</ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        Implémenter la logique de création dans <Code>AdminEpisodesController::create()</Code> :
                        <List>
                            <ListItem>Valider les champs requis</ListItem>
                            <ListItem>
                                Créer une instance d&apos;<Code>Episode</Code> et la passer au{" "}
                                <Code>EpisodeRepository::create()</Code>
                            </ListItem>
                            <ListItem>
                                Les champs <Code>createdAt</Code> et{" "}<Code>updatedAt</Code> doivent être initialisés
                                automatiquement dans le repository
                            </ListItem>
                        </List>
                    </ListItem>
                </List>

                <Heading level={3}>2. Mise à jour</Heading>
                <List ordered>
                    <ListItem>Reprendre la même logique que pour les séries avec le
                        paramètre <Code>$edit</Code>.</ListItem>

                    <ListItem>
                        Adapter l&apos;action du formulaire selon le mode :
                        <CodeCard language="php">
                            {`<form action="admin.php?action=<?= $edit ? 'editEpisode&id=' . $episode->getId() : 'createEpisode' ?>" method="post">`}
                        </CodeCard>
                    </ListItem>

                    <ListItem>
                        Implémenter <Code>AdminEpisodesController::edit()</Code> et{" "}
                        <Code>EpisodeRepository::update(Episode $episode)</Code>.
                    </ListItem>

                    <ListItem>
                        Le champ <Code>updatedAt</Code> doit être automatiquement mis à jour lors de la
                        modification (dans le repository, avant l&apos;UPDATE).
                    </ListItem>
                </List>
            </section>
        </article>
    );
}
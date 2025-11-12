import Heading from "@/components/ui/Heading";
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import CodeCard from "@/components/Cards/CodeCard";
import {Text} from "@/components/ui/Text";
import Link from "next/link";

export default function TP() {
    return (
        <article>
            <section>
                <Heading level={2} netflex>A- Initialisation de la base & configuration de la connexion</Heading>

                <List ordered>
                    <ListItem>
                        Dans le dossier <Code>config/</Code>, modifiez le fichier <Code>config.php</Code>. afin d&apos;y
                        avoir les lignes suivantes :
                        <CodeCard language="php">
                            {`define('DB_HOST', 'woody');  // Hôte de la base de données (généralement localhost)
define('DB_NAME', 'LOGINLDAP');  // Nom de la base de données
define('DB_USER', 'LOGINLDAP');  // Nom d'utilisateur de la base de données
define('DB_PASS', 'PASSWORD');  // Mot de passe de la base de données
define('DB_PORT', '5432');  // Mot de passe de la base de données`}
                        </CodeCard>
                        ces constante seront utilisé dans la classe <Code>Repository</Code> pour initialiser la
                        connexion
                    </ListItem>

                    <ListItem>
                        Dans le dossier <Code>bd/</Code>, modifiez le fichier <Code>init.sql</Code>. afin d&apos;y avoir
                        les lignes suivantes :
                        <CodeCard language='sql' filename={'init.sql'} collapsible>
                            {`CREATE TABLE accounts
                              (
                                  id            SERIAL PRIMARY KEY,
                                  username      VARCHAR(50)  NOT NULL UNIQUE,
                                  email         VARCHAR(100) NOT NULL UNIQUE,
                                  password_hash VARCHAR(255) NOT NULL,
                                  created_at    TIMESTAMP DEFAULT NOW(),
                                  updated_at    TIMESTAMP DEFAULT NOW()
                              );

                            CREATE TABLE series
                            (
                                id                 SERIAL PRIMARY KEY,
                                title              VARCHAR(150) NOT NULL,
                                description        TEXT,
                                release_year_start INT,                 -- année de début
                                release_year_end   INT,                 -- année de fin (NULL si toujours en cours)
                                current_season     INT       DEFAULT 1, -- saison en cours
                                quality            VARCHAR(10),         -- ex: "HD", "4K"
                                audio              VARCHAR(20),         -- ex: "FR", "EN", "VO"
                                image              VARCHAR(255),        -- URL ou chemin vers l’image
                                tags               JSONB,               -- tags pour filtrage / catégories
                                created_at         TIMESTAMP DEFAULT NOW(),
                                updated_at         TIMESTAMP DEFAULT NOW()
                            );

                            CREATE TABLE episodes
                            (
                                id             SERIAL PRIMARY KEY,
                                series_id      INT          NOT NULL REFERENCES series (id) ON DELETE CASCADE,
                                title          VARCHAR(150) NOT NULL,
                                season         INT          NOT NULL,
                                episode_number INT          NOT NULL,
                                duration       INTERVAL, -- durée de l'épisode
                                release_date   DATE,
                                created_at     TIMESTAMP DEFAULT NOW(),
                                updated_at     TIMESTAMP DEFAULT NOW(),
                                UNIQUE (series_id, season, episode_number)
                            );

                            INSERT INTO series (id, title, release_year_start, release_year_end, tags, current_season)
                            VALUES (1, 'The Wire', 2002, 2008, '["crime", "drama", "police"]', 5),
                                   (2, 'House of Cards', 2013, 2018, '["political", "drama", "thriller"]', 6),
                                   (3, 'Chernobyl', 2019, 2019, '["historical", "drama", "disaster"]', 1),
                                   (4, 'Breaking Bad', 2008, 2013, '["crime", "drama", "thriller"]', 5),
                                   (5, 'The Office', 2005, 2013, '["comedy", "mockumentary", "workplace"]', 9),
                                   (6, 'The Queen''s Gambit', 2020, 2020, '["drama", "chess", "miniseries"]', 1),
                                   (7, 'The Handmaid''s Tale', 2017, 2023, '["dystopian", "drama", "thriller"]', 5),
                                   (8, '3%', 2016, 2020, '["sci-fi", "dystopian", "thriller"]', 4),
                                   (9, 'Wednesday', 2022, 2022, '["comedy", "horror", "mystery"]', 1),
                                   (10, 'You', 2018, 2023, '["thriller", "psychological", "crime"]', 4),
                                   (11, 'Stranger Things', 2016, 2022, '["sci-fi", "horror", "supernatural"]', 4);

                            -- ============================================
-- TABLE: episodes
-- ============================================

-- THE WIRE (60 épisodes)
                            INSERT INTO episodes (series_id, title, season, episode_number, duration, release_date)
                            VALUES
-- Saison 1
(1, 'The Target', 1, 1, '01:02:00', '2002-06-02'),
(1, 'The Detail', 1, 2, '00:58:00', '2002-06-09'),
(1, 'The Buys', 1, 3, '00:57:00', '2002-06-16'),
(1, 'Old Cases', 1, 4, '00:58:00', '2002-06-23'),
(1, 'The Pager', 1, 5, '00:59:00', '2002-06-30'),
(1, 'The Wire', 1, 6, '00:58:00', '2002-07-07'),
(1, 'One Arrest', 1, 7, '00:56:00', '2002-07-14'),
(1, 'Lessons', 1, 8, '00:57:00', '2002-07-21'),
(1, 'Game Day', 1, 9, '00:57:00', '2002-07-28'),
(1, 'The Cost', 1, 10, '00:57:00', '2002-08-04'),
(1, 'The Hunt', 1, 11, '00:58:00', '2002-08-11'),
(1, 'Cleaning Up', 1, 12, '00:58:00', '2002-08-18'),
(1, 'Sentencing', 1, 13, '00:57:00', '2002-09-08'),
-- Saison 2
(1, 'Ebb Tide', 2, 1, '00:59:00', '2003-06-01'),
(1, 'Collateral Damage', 2, 2, '00:58:00', '2003-06-08'),
(1, 'Hot Shots', 2, 3, '00:58:00', '2003-06-15'),
(1, 'Hard Cases', 2, 4, '00:59:00', '2003-06-22'),
(1, 'Undertow', 2, 5, '00:59:00', '2003-06-29'),
(1, 'All Prologue', 2, 6, '00:59:00', '2003-07-06'),
(1, 'Backwash', 2, 7, '00:57:00', '2003-07-13'),
(1, 'Duck and Cover', 2, 8, '00:58:00', '2003-07-20'),
(1, 'Stray Rounds', 2, 9, '00:58:00', '2003-07-27'),
(1, 'Storm Warnings', 2, 10, '00:58:00', '2003-08-03'),
(1, 'Bad Dreams', 2, 11, '00:58:00', '2003-08-10'),
(1, 'Port in a Storm', 2, 12, '01:00:00', '2003-08-24'),
-- Saison 3
(1, 'Time After Time', 3, 1, '00:58:00', '2004-09-19'),
(1, 'All Due Respect', 3, 2, '00:55:00', '2004-09-26'),
(1, 'Dead Soldiers', 3, 3, '00:57:00', '2004-10-03'),
(1, 'Hamsterdam', 3, 4, '00:58:00', '2004-10-10'),
(1, 'Straight and True', 3, 5, '00:58:00', '2004-10-17'),
(1, 'Homecoming', 3, 6, '00:57:00', '2004-10-31'),
(1, 'Back Burners', 3, 7, '00:58:00', '2004-11-07'),
(1, 'Moral Midgetry', 3, 8, '00:57:00', '2004-11-14'),
(1, 'Slapstick', 3, 9, '00:59:00', '2004-11-21'),
(1, 'Reformation', 3, 10, '00:58:00', '2004-11-28'),
(1, 'Middle Ground', 3, 11, '00:59:00', '2004-12-12'),
(1, 'Mission Accomplished', 3, 12, '01:33:00', '2004-12-19'),
-- Saison 4
(1, 'Boys of Summer', 4, 1, '01:13:00', '2006-09-10'),
(1, 'Soft Eyes', 4, 2, '00:58:00', '2006-09-17'),
(1, 'Home Rooms', 4, 3, '01:00:00', '2006-09-24'),
(1, 'Refugees', 4, 4, '00:59:00', '2006-10-01'),
(1, 'Alliances', 4, 5, '00:58:00', '2006-10-08'),
(1, 'Margin of Error', 4, 6, '00:58:00', '2006-10-15'),
(1, 'Unto Others', 4, 7, '00:58:00', '2006-10-22'),
(1, 'Corner Boys', 4, 8, '00:59:00', '2006-10-29'),
(1, 'Know Your Place', 4, 9, '00:58:00', '2006-11-05'),
(1, 'Misgivings', 4, 10, '00:59:00', '2006-11-12'),
(1, 'A New Day', 4, 11, '00:59:00', '2006-11-19'),
(1, 'That''s Got His Own', 4, 12, '01:18:00', '2006-12-03'),
(1, 'Final Grades', 4, 13, '01:18:00', '2006-12-10'),
-- Saison 5
(1, 'More with Less', 5, 1, '01:01:00', '2008-01-06'),
(1, 'Unconfirmed Reports', 5, 2, '00:58:00', '2008-01-13'),
(1, 'Not for Attribution', 5, 3, '00:59:00', '2008-01-20'),
(1, 'Transitions', 5, 4, '01:00:00', '2008-01-27'),
(1, 'React Quotes', 5, 5, '00:59:00', '2008-02-03'),
(1, 'The Dickensian Aspect', 5, 6, '00:59:00', '2008-02-10'),
(1, 'Took', 5, 7, '00:58:00', '2008-02-17'),
(1, 'Clarifications', 5, 8, '00:59:00', '2008-02-24'),
(1, 'Late Editions', 5, 9, '01:33:00', '2008-03-02'),
(1, '-30-', 5, 10, '01:33:00', '2008-03-09');

-- HOUSE OF CARDS (73 épisodes)
                            INSERT INTO episodes (series_id, title, season, episode_number, duration, release_date)
                            VALUES
-- Saison 1
(2, 'Chapter 1', 1, 1, '00:58:00', '2013-02-01'),
(2, 'Chapter 2', 1, 2, '00:53:00', '2013-02-01'),
(2, 'Chapter 3', 1, 3, '00:52:00', '2013-02-01'),
(2, 'Chapter 4', 1, 4, '00:52:00', '2013-02-01'),
(2, 'Chapter 5', 1, 5, '00:52:00', '2013-02-01'),
(2, 'Chapter 6', 1, 6, '00:51:00', '2013-02-01'),
(2, 'Chapter 7', 1, 7, '00:51:00', '2013-02-01'),
(2, 'Chapter 8', 1, 8, '00:52:00', '2013-02-01'),
(2, 'Chapter 9', 1, 9, '00:50:00', '2013-02-01'),
(2, 'Chapter 10', 1, 10, '00:51:00', '2013-02-01'),
(2, 'Chapter 11', 1, 11, '00:51:00', '2013-02-01'),
(2, 'Chapter 12', 1, 12, '00:50:00', '2013-02-01'),
(2, 'Chapter 13', 1, 13, '00:54:00', '2013-02-01'),
-- Saison 2
(2, 'Chapter 14', 2, 1, '00:57:00', '2014-02-14'),
(2, 'Chapter 15', 2, 2, '00:51:00', '2014-02-14'),
(2, 'Chapter 16', 2, 3, '00:52:00', '2014-02-14'),
(2, 'Chapter 17', 2, 4, '00:51:00', '2014-02-14'),
(2, 'Chapter 18', 2, 5, '00:52:00', '2014-02-14'),
(2, 'Chapter 19', 2, 6, '00:51:00', '2014-02-14'),
(2, 'Chapter 20', 2, 7, '00:51:00', '2014-02-14'),
(2, 'Chapter 21', 2, 8, '00:50:00', '2014-02-14'),
(2, 'Chapter 22', 2, 9, '00:51:00', '2014-02-14'),
(2, 'Chapter 23', 2, 10, '00:51:00', '2014-02-14'),
(2, 'Chapter 24', 2, 11, '00:51:00', '2014-02-14'),
(2, 'Chapter 25', 2, 12, '00:50:00', '2014-02-14'),
(2, 'Chapter 26', 2, 13, '00:52:00', '2014-02-14'),
-- Saison 3
(2, 'Chapter 27', 3, 1, '00:56:00', '2015-02-27'),
(2, 'Chapter 28', 3, 2, '00:54:00', '2015-02-27'),
(2, 'Chapter 29', 3, 3, '00:53:00', '2015-02-27'),
(2, 'Chapter 30', 3, 4, '00:52:00', '2015-02-27'),
(2, 'Chapter 31', 3, 5, '00:53:00', '2015-02-27'),
(2, 'Chapter 32', 3, 6, '00:53:00', '2015-02-27'),
(2, 'Chapter 33', 3, 7, '00:52:00', '2015-02-27'),
(2, 'Chapter 34', 3, 8, '00:53:00', '2015-02-27'),
(2, 'Chapter 35', 3, 9, '00:52:00', '2015-02-27'),
(2, 'Chapter 36', 3, 10, '00:53:00', '2015-02-27'),
(2, 'Chapter 37', 3, 11, '00:53:00', '2015-02-27'),
(2, 'Chapter 38', 3, 12, '00:52:00', '2015-02-27'),
(2, 'Chapter 39', 3, 13, '00:54:00', '2015-02-27'),
-- Saison 4
(2, 'Chapter 40', 4, 1, '00:53:00', '2016-03-04'),
(2, 'Chapter 41', 4, 2, '00:52:00', '2016-03-04'),
(2, 'Chapter 42', 4, 3, '00:52:00', '2016-03-04'),
(2, 'Chapter 43', 4, 4, '00:52:00', '2016-03-04'),
(2, 'Chapter 44', 4, 5, '00:52:00', '2016-03-04'),
(2, 'Chapter 45', 4, 6, '00:52:00', '2016-03-04'),
(2, 'Chapter 46', 4, 7, '00:52:00', '2016-03-04'),
(2, 'Chapter 47', 4, 8, '00:52:00', '2016-03-04'),
(2, 'Chapter 48', 4, 9, '00:52:00', '2016-03-04'),
(2, 'Chapter 49', 4, 10, '00:52:00', '2016-03-04'),
(2, 'Chapter 50', 4, 11, '00:52:00', '2016-03-04'),
(2, 'Chapter 51', 4, 12, '00:52:00', '2016-03-04'),
(2, 'Chapter 52', 4, 13, '00:56:00', '2016-03-04'),
-- Saison 5
(2, 'Chapter 53', 5, 1, '00:54:00', '2017-05-30'),
(2, 'Chapter 54', 5, 2, '00:54:00', '2017-05-30'),
(2, 'Chapter 55', 5, 3, '00:54:00', '2017-05-30'),
(2, 'Chapter 56', 5, 4, '00:55:00', '2017-05-30'),
(2, 'Chapter 57', 5, 5, '00:54:00', '2017-05-30'),
(2, 'Chapter 58', 5, 6, '00:54:00', '2017-05-30'),
(2, 'Chapter 59', 5, 7, '00:54:00', '2017-05-30'),
(2, 'Chapter 60', 5, 8, '00:54:00', '2017-05-30'),
(2, 'Chapter 61', 5, 9, '00:54:00', '2017-05-30'),
(2, 'Chapter 62', 5, 10, '00:54:00', '2017-05-30'),
(2, 'Chapter 63', 5, 11, '00:54:00', '2017-05-30'),
(2, 'Chapter 64', 5, 12, '00:54:00', '2017-05-30'),
(2, 'Chapter 65', 5, 13, '00:57:00', '2017-05-30'),
-- Saison 6
(2, 'Chapter 66', 6, 1, '00:55:00', '2018-11-02'),
(2, 'Chapter 67', 6, 2, '00:54:00', '2018-11-02'),
(2, 'Chapter 68', 6, 3, '00:54:00', '2018-11-02'),
(2, 'Chapter 69', 6, 4, '00:53:00', '2018-11-02'),
(2, 'Chapter 70', 6, 5, '00:54:00', '2018-11-02'),
(2, 'Chapter 71', 6, 6, '00:54:00', '2018-11-02'),
(2, 'Chapter 72', 6, 7, '00:54:00', '2018-11-02'),
(2, 'Chapter 73', 6, 8, '01:13:00', '2018-11-02');

-- CHERNOBYL (5 épisodes - minisérie)
                            INSERT INTO episodes (series_id, title, season, episode_number, duration, release_date)
                            VALUES (3, '1:23:45', 1, 1, '00:56:00', '2019-05-06'),
                                   (3, 'Please Remain Calm', 1, 2, '01:03:00', '2019-05-13'),
                                   (3, 'Open Wide, O Earth', 1, 3, '01:04:00', '2019-05-20'),
                                   (3, 'The Happiness of All Mankind', 1, 4, '01:08:00', '2019-05-27'),
                                   (3, 'Vichnaya Pamyat', 1, 5, '01:08:00', '2019-06-03');

-- BREAKING BAD (62 épisodes)
                            INSERT INTO episodes (series_id, title, season, episode_number, duration, release_date)
                            VALUES
-- Saison 1
(4, 'Pilot', 1, 1, '00:58:00', '2008-01-20'),
(4, 'Cat''s in the Bag...', 1, 2, '00:48:00', '2008-01-27'),
(4, '...And the Bag''s in the River', 1, 3, '00:48:00', '2008-02-10'),
(4, 'Cancer Man', 1, 4, '00:48:00', '2008-02-17'),
(4, 'Gray Matter', 1, 5, '00:48:00', '2008-02-24'),
(4, 'Crazy Handful of Nothin''', 1, 6, '00:48:00', '2008-03-02'),
(4, 'A No-Rough-Stuff-Type Deal', 1, 7, '00:48:00', '2008-03-09'),
-- Saison 2
(4, 'Seven Thirty-Seven', 2, 1, '00:47:00', '2009-03-08'),
(4, 'Grilled', 2, 2, '00:47:00', '2009-03-15'),
(4, 'Bit by a Dead Bee', 2, 3, '00:47:00', '2009-03-22'),
(4, 'Down', 2, 4, '00:47:00', '2009-03-29'),
(4, 'Breakage', 2, 5, '00:47:00', '2009-04-05'),
(4, 'Peekaboo', 2, 6, '00:47:00', '2009-04-12'),
(4, 'Negro y Azul', 2, 7, '00:47:00', '2009-04-19'),
(4, 'Better Call Saul', 2, 8, '00:47:00', '2009-04-26'),
(4, '4 Days Out', 2, 9, '00:47:00', '2009-05-03'),
(4, 'Over', 2, 10, '00:47:00', '2009-05-10'),
(4, 'Mandala', 2, 11, '00:47:00', '2009-05-17'),
(4, 'Phoenix', 2, 12, '00:47:00', '2009-05-24'),
(4, 'ABQ', 2, 13, '00:47:00', '2009-05-31'),
-- Saison 3
(4, 'No Más', 3, 1, '00:47:00', '2010-03-21'),
(4, 'Caballo Sin Nombre', 3, 2, '00:47:00', '2010-03-28'),
(4, 'I.F.T.', 3, 3, '00:47:00', '2010-04-04'),
(4, 'Green Light', 3, 4, '00:47:00', '2010-04-11'),
(4, 'Más', 3, 5, '00:47:00', '2010-04-18'),
(4, 'Sunset', 3, 6, '00:47:00', '2010-04-25'),
(4, 'One Minute', 3, 7, '00:47:00', '2010-05-02'),
(4, 'I See You', 3, 8, '00:47:00', '2010-05-09'),
(4, 'Kafkaesque', 3, 9, '00:47:00', '2010-05-16'),
(4, 'Fly', 3, 10, '00:47:00', '2010-05-23'),
(4, 'Abiquiú', 3, 11, '00:47:00', '2010-05-30'),
(4, 'Half Measures', 3, 12, '00:47:00', '2010-06-06'),
(4, 'Full Measure', 3, 13, '00:47:00', '2010-06-13'),
-- Saison 4
(4, 'Box Cutter', 4, 1, '00:47:00', '2011-07-17'),
(4, 'Thirty-Eight Snub', 4, 2, '00:47:00', '2011-07-24'),
(4, 'Open House', 4, 3, '00:47:00', '2011-07-31'),
(4, 'Bullet Points', 4, 4, '00:47:00', '2011-08-07'),
(4, 'Shotgun', 4, 5, '00:47:00', '2011-08-14'),
(4, 'Cornered', 4, 6, '00:47:00', '2011-08-21'),
(4, 'Problem Dog', 4, 7, '00:47:00', '2011-08-28'),
(4, 'Hermanos', 4, 8, '00:47:00', '2011-09-04'),
(4, 'Bug', 4, 9, '00:47:00', '2011-09-11'),
(4, 'Salud', 4, 10, '00:47:00', '2011-09-18'),
(4, 'Crawl Space', 4, 11, '00:47:00', '2011-09-25'),
(4, 'End Times', 4, 12, '00:47:00', '2011-10-02'),
(4, 'Face Off', 4, 13, '00:47:00', '2011-10-09'),
-- Saison 5
(4, 'Live Free or Die', 5, 1, '00:47:00', '2012-07-15'),
(4, 'Madrigal', 5, 2, '00:47:00', '2012-07-22'),
(4, 'Hazard Pay', 5, 3, '00:47:00', '2012-07-29'),
(4, 'Fifty-One', 5, 4, '00:47:00', '2012-08-05'),
(4, 'Dead Freight', 5, 5, '00:47:00', '2012-08-12'),
(4, 'Buyout', 5, 6, '00:47:00', '2012-08-19'),
(4, 'Say My Name', 5, 7, '00:47:00', '2012-08-26'),
(4, 'Gliding Over All', 5, 8, '00:47:00', '2012-09-02'),
(4, 'Blood Money', 5, 9, '00:47:00', '2013-08-11'),
(4, 'Buried', 5, 10, '00:47:00', '2013-08-18'),
(4, 'Confessions', 5, 11, '00:47:00', '2013-08-25'),
(4, 'Rabid Dog', 5, 12, '00:47:00', '2013-09-01'),
(4, 'To''hajiilee', 5, 13, '00:47:00', '2013-09-08'),
(4, 'Ozymandias', 5, 14, '00:47:00', '2013-09-15'),
(4, 'Granite State', 5, 15, '00:47:00', '2013-09-22'),
(4, 'Felina', 5, 16, '00:55:00', '2013-09-29');

                            -- THE OFFICE US (201 épisodes - sélection représentative des épisodes les plus notables)
-- Note: The Office a 201 épisodes. Pour la lisibilité, j'inclus les premiers et derniers épisodes de chaque saison
                            INSERT INTO episodes (series_id, title, season, episode_number, duration, release_date)
                            VALUES
-- Saison 1
(5, 'Pilot', 1, 1, '00:22:00', '2005-03-24'),
(5, 'Diversity Day', 1, 2, '00:22:00', '2005-03-29'),
(5, 'Health Care', 1, 3, '00:22:00', '2005-04-05'),
(5, 'The Alliance', 1, 4, '00:22:00', '2005-04-12'),
(5, 'Basketball', 1, 5, '00:22:00', '2005-04-19'),
(5, 'Hot Girl', 1, 6, '00:22:00', '2005-04-26'),
-- Saison 2
(5, 'The Dundies', 2, 1, '00:22:00', '2005-09-20'),
(5, 'Sexual Harassment', 2, 2, '00:22:00', '2005-09-27'),
(5, 'Office Olympics', 2, 3, '00:22:00', '2005-10-04'),
(5, 'The Fire', 2, 4, '00:22:00', '2005-10-11'),
(5, 'Halloween', 2, 5, '00:22:00', '2005-10-18'),
(5, 'The Fight', 2, 6, '00:22:00', '2005-11-01'),
(5, 'The Client', 2, 7, '00:22:00', '2005-11-08'),
(5, 'Performance Review', 2, 8, '00:22:00', '2005-11-15'),
(5, 'Email Surveillance', 2, 9, '00:22:00', '2005-11-22'),
(5, 'Christmas Party', 2, 10, '00:22:00', '2005-12-06'),
(5, 'Booze Cruise', 2, 11, '00:22:00', '2006-01-05'),
(5, 'The Injury', 2, 12, '00:22:00', '2006-01-12'),
(5, 'The Secret', 2, 13, '00:22:00', '2006-01-19'),
(5, 'The Carpet', 2, 14, '00:22:00', '2006-01-26'),
(5, 'Boys and Girls', 2, 15, '00:22:00', '2006-02-02'),
(5, 'Valentine''s Day', 2, 16, '00:22:00', '2006-02-09'),
(5, 'Dwight''s Speech', 2, 17, '00:22:00', '2006-03-02'),
(5, 'Take Your Daughter to Work Day', 2, 18, '00:22:00', '2006-03-16'),
(5, 'Michael''s Birthday', 2, 19, '00:22:00', '2006-03-30'),
(5, 'Drug Testing', 2, 20, '00:22:00', '2006-04-27'),
(5, 'Conflict Resolution', 2, 21, '00:22:00', '2006-05-04'),
(5, 'Casino Night', 2, 22, '00:28:00', '2006-05-11'),
-- Saison 3 (exemples clés)
(5, 'Gay Witch Hunt', 3, 1, '00:22:00', '2006-09-21'),
(5, 'The Convention', 3, 2, '00:22:00', '2006-09-28'),
(5, 'The Coup', 3, 3, '00:22:00', '2006-10-05'),
(5, 'Grief Counseling', 3, 4, '00:22:00', '2006-10-12'),
(5, 'Initiation', 3, 5, '00:22:00', '2006-10-19'),
(5, 'Diwali', 3, 6, '00:22:00', '2006-11-02'),
(5, 'Branch Closing', 3, 7, '00:22:00', '2006-11-09'),
(5, 'The Merger', 3, 8, '00:22:00', '2006-11-16'),
(5, 'The Convict', 3, 9, '00:22:00', '2006-11-30'),
(5, 'A Benihana Christmas', 3, 10, '00:28:00', '2006-12-14'),
(5, 'Back from Vacation', 3, 11, '00:22:00', '2007-01-04'),
(5, 'Traveling Salesmen', 3, 12, '00:22:00', '2007-01-11'),
(5, 'The Return', 3, 13, '00:22:00', '2007-01-18'),
(5, 'Ben Franklin', 3, 14, '00:22:00', '2007-02-01'),
(5, 'Phyllis'' Wedding', 3, 15, '00:22:00', '2007-02-08'),
(5, 'Business School', 3, 16, '00:22:00', '2007-02-15'),
(5, 'Cocktails', 3, 17, '00:22:00', '2007-02-22'),
(5, 'The Negotiation', 3, 18, '00:22:00', '2007-04-05'),
(5, 'Safety Training', 3, 19, '00:22:00', '2007-04-12'),
(5, 'Product Recall', 3, 20, '00:22:00', '2007-04-26'),
(5, 'Women''s Appreciation', 3, 21, '00:22:00', '2007-05-03'),
(5, 'Beach Games', 3, 22, '00:28:00', '2007-05-10'),
(5, 'The Job', 3, 23, '00:28:00', '2007-05-17'),
-- Saison 9 (dernière saison - épisodes notables)
(5, 'New Guys', 9, 1, '00:22:00', '2012-09-20'),
(5, 'Roy''s Wedding', 9, 2, '00:22:00', '2012-09-27'),
(5, 'Andy''s Ancestry', 9, 3, '00:22:00', '2012-10-04'),
(5, 'Work Bus', 9, 4, '00:22:00', '2012-10-18'),
(5, 'Here Comes Treble', 9, 5, '00:22:00', '2012-10-25'),
(5, 'The Boat', 9, 6, '00:22:00', '2012-11-08'),
(5, 'The Whale', 9, 7, '00:22:00', '2012-11-15'),
(5, 'The Target', 9, 8, '00:22:00', '2012-11-29'),
(5, 'Dwight Christmas', 9, 9, '00:22:00', '2012-12-06'),
(5, 'Lice', 9, 10, '00:22:00', '2013-01-10'),
(5, 'Suit Warehouse', 9, 11, '00:22:00', '2013-01-17'),
(5, 'Customer Loyalty', 9, 12, '00:22:00', '2013-01-24'),
(5, 'Junior Salesman', 9, 13, '00:22:00', '2013-01-31'),
(5, 'Vandalism', 9, 14, '00:22:00', '2013-02-07'),
(5, 'Couples Discount', 9, 15, '00:22:00', '2013-02-07'),
(5, 'Moving On', 9, 16, '00:22:00', '2013-02-14'),
(5, 'The Farm', 9, 17, '00:22:00', '2013-03-14'),
(5, 'Promos', 9, 18, '00:22:00', '2013-04-04'),
(5, 'Stairmageddon', 9, 19, '00:22:00', '2013-04-11'),
(5, 'Paper Airplane', 9, 20, '00:22:00', '2013-04-25'),
(5, 'Livin'' the Dream', 9, 21, '00:22:00', '2013-05-02'),
(5, 'A.A.R.M.', 9, 22, '00:22:00', '2013-05-09'),
(5, 'Finale', 9, 23, '00:53:00', '2013-05-16');

-- THE QUEEN'S GAMBIT (7 épisodes - minisérie)
                            INSERT INTO episodes (series_id, title, season, episode_number, duration, release_date)
                            VALUES (6, 'Openings', 1, 1, '00:59:00', '2020-10-23'),
                                   (6, 'Exchanges', 1, 2, '01:05:00', '2020-10-23'),
                                   (6, 'Doubled Pawns', 1, 3, '00:46:00', '2020-10-23'),
                                   (6, 'Middle Game', 1, 4, '00:48:00', '2020-10-23'),
                                   (6, 'Fork', 1, 5, '00:48:00', '2020-10-23'),
                                   (6, 'Adjournment', 1, 6, '01:00:00', '2020-10-23'),
                                   (6, 'End Game', 1, 7, '01:07:00', '2020-10-23');

-- THE HANDMAID'S TALE (56 épisodes)
                            INSERT INTO episodes (series_id, title, season, episode_number, duration, release_date)
                            VALUES
-- Saison 1
(7, 'Offred', 1, 1, '00:57:00', '2017-04-26'),
(7, 'Birth Day', 1, 2, '00:47:00', '2017-04-26'),
(7, 'Late', 1, 3, '00:53:00', '2017-04-26'),
(7, 'Nolite Te Bastardes Carborundorum', 1, 4, '00:53:00', '2017-05-03'),
(7, 'Faithful', 1, 5, '00:51:00', '2017-05-10'),
(7, 'A Woman''s Place', 1, 6, '00:50:00', '2017-05-17'),
(7, 'The Other Side', 1, 7, '00:49:00', '2017-05-24'),
(7, 'Jezebels', 1, 8, '00:52:00', '2017-05-31'),
(7, 'The Bridge', 1, 9, '00:49:00', '2017-06-07'),
(7, 'Night', 1, 10, '00:59:00', '2017-06-14'),
-- Saison 2
(7, 'June', 2, 1, '00:57:00', '2018-04-25'),
(7, 'Unwomen', 2, 2, '00:56:00', '2018-04-25'),
(7, 'Baggage', 2, 3, '00:50:00', '2018-05-02'),
(7, 'Other Women', 2, 4, '00:52:00', '2018-05-09'),
(7, 'Seeds', 2, 5, '00:51:00', '2018-05-16'),
(7, 'First Blood', 2, 6, '00:55:00', '2018-05-23'),
(7, 'After', 2, 7, '00:58:00', '2018-05-30'),
(7, 'Women''s Work', 2, 8, '00:58:00', '2018-06-06'),
(7, 'Smart Power', 2, 9, '00:51:00', '2018-06-13'),
(7, 'The Last Ceremony', 2, 10, '00:56:00', '2018-06-20'),
(7, 'Holly', 2, 11, '00:59:00', '2018-06-27'),
(7, 'Postpartum', 2, 12, '00:53:00', '2018-07-04'),
(7, 'The Word', 2, 13, '01:03:00', '2018-07-11'),
-- Saison 3
(7, 'Night', 3, 1, '00:51:00', '2019-06-05'),
(7, 'Mary and Martha', 3, 2, '00:46:00', '2019-06-05'),
(7, 'Useful', 3, 3, '00:51:00', '2019-06-05'),
(7, 'God Bless the Child', 3, 4, '00:52:00', '2019-06-12'),
(7, 'Unknown Caller', 3, 5, '00:44:00', '2019-06-19'),
(7, 'Household', 3, 6, '00:50:00', '2019-06-26'),
(7, 'Under His Eye', 3, 7, '00:47:00', '2019-07-03'),
(7, 'Unfit', 3, 8, '00:49:00', '2019-07-10'),
(7, 'Heroic', 3, 9, '00:52:00', '2019-07-17'),
(7, 'Bear Witness', 3, 10, '00:48:00', '2019-07-24'),
(7, 'Liars', 3, 11, '00:52:00', '2019-07-31'),
(7, 'Sacrifice', 3, 12, '00:52:00', '2019-08-07'),
(7, 'Mayday', 3, 13, '00:52:00', '2019-08-14'),
-- Saison 4
(7, 'Pigs', 4, 1, '00:56:00', '2021-04-28'),
(7, 'Nightshade', 4, 2, '00:48:00', '2021-04-28'),
(7, 'The Crossing', 4, 3, '00:51:00', '2021-04-28'),
(7, 'Milk', 4, 4, '00:47:00', '2021-05-05'),
(7, 'Chicago', 4, 5, '00:46:00', '2021-05-12'),
(7, 'Vows', 4, 6, '00:51:00', '2021-05-19'),
(7, 'Home', 4, 7, '00:51:00', '2021-05-26'),
(7, 'Testimony', 4, 8, '00:51:00', '2021-06-02'),
(7, 'Progress', 4, 9, '00:51:00', '2021-06-09'),
(7, 'The Wilderness', 4, 10, '01:05:00', '2021-06-16'),
-- Saison 5
(7, 'Morning', 5, 1, '00:53:00', '2022-09-14'),
(7, 'Ballet', 5, 2, '00:49:00', '2022-09-14'),
(7, 'Border', 5, 3, '00:47:00', '2022-09-21'),
(7, 'Dear Offred', 5, 4, '00:50:00', '2022-09-21'),
(7, 'Fairytale', 5, 5, '00:47:00', '2022-09-28'),
(7, 'Together', 5, 6, '00:48:00', '2022-10-05'),
(7, 'No Man''s Land', 5, 7, '00:47:00', '2022-10-12'),
(7, 'Motherland', 5, 8, '00:50:00', '2022-10-19'),
(7, 'Allegiance', 5, 9, '00:52:00', '2022-10-26'),
(7, 'Safe', 5, 10, '01:10:00', '2022-11-09');

-- 3% (33 épisodes)
                            INSERT INTO episodes (series_id, title, season, episode_number, duration, release_date)
                            VALUES
-- Saison 1
(8, 'Capítulo 01: Cubos', 1, 1, '00:46:00', '2016-11-25'),
(8, 'Capítulo 02: Moedas', 1, 2, '00:44:00', '2016-11-25'),
(8, 'Capítulo 03: Corredor', 1, 3, '00:46:00', '2016-11-25'),
(8, 'Capítulo 04: Portão', 1, 4, '00:51:00', '2016-11-25'),
(8, 'Capítulo 05: Água', 1, 5, '00:48:00', '2016-11-25'),
(8, 'Capítulo 06: Vidro', 1, 6, '00:50:00', '2016-11-25'),
(8, 'Capítulo 07: Aranha', 1, 7, '00:48:00', '2016-11-25'),
(8, 'Capítulo 08: Botão', 1, 8, '00:48:00', '2016-11-25'),
-- Saison 2
(8, 'Capítulo 01: Espelho', 2, 1, '00:46:00', '2018-04-27'),
(8, 'Capítulo 02: Pilar', 2, 2, '00:43:00', '2018-04-27'),
(8, 'Capítulo 03: Colar', 2, 3, '00:44:00', '2018-04-27'),
(8, 'Capítulo 04: Trevo', 2, 4, '00:45:00', '2018-04-27'),
(8, 'Capítulo 05: Fogo', 2, 5, '00:46:00', '2018-04-27'),
(8, 'Capítulo 06: Tear', 2, 6, '00:43:00', '2018-04-27'),
(8, 'Capítulo 07: Zona', 2, 7, '00:46:00', '2018-04-27'),
(8, 'Capítulo 08: Sangue', 2, 8, '00:44:00', '2018-04-27'),
(8, 'Capítulo 09: Abismo', 2, 9, '00:43:00', '2018-04-27'),
(8, 'Capítulo 10: Apagar', 2, 10, '00:51:00', '2018-04-27'),
-- Saison 3
(8, 'Capítulo 01: Velha Conhecida', 3, 1, '00:39:00', '2019-06-07'),
(8, 'Capítulo 02: Raiz', 3, 2, '00:40:00', '2019-06-07'),
(8, 'Capítulo 03: Plano B', 3, 3, '00:40:00', '2019-06-07'),
(8, 'Capítulo 04: Família', 3, 4, '00:42:00', '2019-06-07'),
(8, 'Capítulo 05: Traidor', 3, 5, '00:37:00', '2019-06-07'),
(8, 'Capítulo 06: Vozes', 3, 6, '00:35:00', '2019-06-07'),
(8, 'Capítulo 07: Salto', 3, 7, '00:36:00', '2019-06-07'),
(8, 'Capítulo 08: Tempestade', 3, 8, '00:42:00', '2019-06-07'),
-- Saison 4
(8, 'Capítulo 01: Lutar', 4, 1, '00:43:00', '2020-08-14'),
(8, 'Capítulo 02: Abrigo', 4, 2, '00:40:00', '2020-08-14'),
(8, 'Capítulo 03: Núcleo', 4, 3, '00:42:00', '2020-08-14'),
(8, 'Capítulo 04: Oásis', 4, 4, '00:41:00', '2020-08-14'),
(8, 'Capítulo 05: Vírus', 4, 5, '00:38:00', '2020-08-14'),
(8, 'Capítulo 06: Poder', 4, 6, '00:41:00', '2020-08-14'),
(8, 'Capítulo 07: Escolha', 4, 7, '00:45:00', '2020-08-14');

-- WEDNESDAY (8 épisodes)
                            INSERT INTO episodes (series_id, title, season, episode_number, duration, release_date)
                            VALUES (9, 'Wednesday''s Child Is Full of Woe', 1, 1, '00:55:00', '2022-11-23'),
                                   (9, 'Woe Is the Loneliest Number', 1, 2, '00:49:00', '2022-11-23'),
                                   (9, 'Friend or Woe', 1, 3, '00:50:00', '2022-11-23'),
                                   (9, 'Woe What a Night', 1, 4, '00:52:00', '2022-11-23'),
                                   (9, 'You Reap What You Woe', 1, 5, '00:48:00', '2022-11-23'),
                                   (9, 'Quid Pro Woe', 1, 6, '00:47:00', '2022-11-23'),
                                   (9, 'If You Don''t Woe Me by Now', 1, 7, '00:49:00', '2022-11-23'),
                                   (9, 'A Murder of Woes', 1, 8, '00:56:00', '2022-11-23');

-- YOU (40 épisodes)
                            INSERT INTO episodes (series_id, title, season, episode_number, duration, release_date)
                            VALUES
-- Saison 1
(10, 'Pilot', 1, 1, '00:45:00', '2018-09-09'),
(10, 'The Last Nice Guy in New York', 1, 2, '00:46:00', '2018-09-16'),
(10, 'Maybe', 1, 3, '00:44:00', '2018-09-23'),
(10, 'The Captain', 1, 4, '00:45:00', '2018-09-30'),
(10, 'Living with the Enemy', 1, 5, '00:44:00', '2018-10-07'),
(10, 'Amour Fou', 1, 6, '00:46:00', '2018-10-14'),
(10, 'Everythingship', 1, 7, '00:43:00', '2018-10-21'),
(10, 'You Got Me, Babe', 1, 8, '00:47:00', '2018-10-28'),
(10, 'Candace', 1, 9, '00:49:00', '2018-11-04'),
(10, 'Bluebeard''s Castle', 1, 10, '00:52:00', '2018-11-11'),
-- Saison 2
(10, 'A Fresh Start', 2, 1, '00:49:00', '2019-12-26'),
(10, 'Just the Tip', 2, 2, '00:48:00', '2019-12-26'),
(10, 'What Are Friends For?', 2, 3, '00:46:00', '2019-12-26'),
(10, 'The Good, the Bad & the Hendy', 2, 4, '00:46:00', '2019-12-26'),
(10, 'Have a Good Wellkend, Joe!', 2, 5, '00:46:00', '2019-12-26'),
(10, 'Goodbye, My Friend', 2, 6, '00:50:00', '2019-12-26'),
(10, 'Ex-istential Crisis', 2, 7, '00:48:00', '2019-12-26'),
(10, 'Fear and Loathing in Beverly Hills', 2, 8, '00:48:00', '2019-12-26'),
(10, 'P.I. Joe', 2, 9, '00:50:00', '2019-12-26'),
(10, 'Love, Actually', 2, 10, '00:54:00', '2019-12-26'),
-- Saison 3
(10, 'And They Lived Happily Ever After', 3, 1, '00:53:00', '2021-10-15'),
(10, 'So I Married an Axe Murderer', 3, 2, '00:47:00', '2021-10-15'),
(10, 'Missing White Woman Syndrome', 3, 3, '00:49:00', '2021-10-15'),
(10, 'Hands Across Madre Linda', 3, 4, '00:47:00', '2021-10-15'),
(10, 'Into the Woods', 3, 5, '00:49:00', '2021-10-15'),
(10, 'W.O.M.B.', 3, 6, '00:48:00', '2021-10-15'),
(10, 'We''re All Mad Here', 3, 7, '00:46:00', '2021-10-15'),
(10, 'Swing and a Miss', 3, 8, '00:48:00', '2021-10-15'),
(10, 'Red Flag', 3, 9, '00:51:00', '2021-10-15'),
(10, 'What Is Love?', 3, 10, '00:54:00', '2021-10-15'),
-- Saison 4
(10, 'Joe Takes a Holiday', 4, 1, '00:56:00', '2023-02-09'),
(10, 'Portrait of the Artist', 4, 2, '00:50:00', '2023-02-09'),
(10, 'Eat the Rich', 4, 3, '00:49:00', '2023-02-09'),
(10, 'Hampsie', 4, 4, '00:49:00', '2023-02-09'),
(10, 'The Fox and the Hound', 4, 5, '00:51:00', '2023-02-09'),
(10, 'Best of Friends', 4, 6, '00:46:00', '2023-03-09'),
(10, 'Good Man, Cruel World', 4, 7, '00:47:00', '2023-03-09'),
(10, 'Where Are You Going, Where Have You Been?', 4, 8, '00:48:00', '2023-03-09'),
(10, 'She''s Not There', 4, 9, '00:53:00', '2023-03-09'),
(10, 'The Death of Jonathan Moore', 4, 10, '00:55:00', '2023-03-09');

-- STRANGER THINGS (34 épisodes)
                            INSERT INTO episodes (series_id, title, season, episode_number, duration, release_date)
                            VALUES
-- Saison 1
(11, 'Chapter One: The Vanishing of Will Byers', 1, 1, '00:48:00', '2016-07-15'),
(11, 'Chapter Two: The Weirdo on Maple Street', 1, 2, '00:56:00', '2016-07-15'),
(11, 'Chapter Three: Holly, Jolly', 1, 3, '00:52:00', '2016-07-15'),
(11, 'Chapter Four: The Body', 1, 4, '00:51:00', '2016-07-15'),
(11, 'Chapter Five: The Flea and the Acrobat', 1, 5, '00:53:00', '2016-07-15'),
(11, 'Chapter Six: The Monster', 1, 6, '00:47:00', '2016-07-15'),
(11, 'Chapter Seven: The Bathtub', 1, 7, '00:42:00', '2016-07-15'),
(11, 'Chapter Eight: The Upside Down', 1, 8, '00:55:00', '2016-07-15'),
-- Saison 2
(11, 'Chapter One: MADMAX', 2, 1, '00:48:00', '2017-10-27'),
(11, 'Chapter Two: Trick or Treat, Freak', 2, 2, '00:56:00', '2017-10-27'),
(11, 'Chapter Three: The Pollywog', 2, 3, '00:51:00', '2017-10-27'),
(11, 'Chapter Four: Will the Wise', 2, 4, '00:46:00', '2017-10-27'),
(11, 'Chapter Five: Dig Dug', 2, 5, '00:57:00', '2017-10-27'),
(11, 'Chapter Six: The Spy', 2, 6, '00:52:00', '2017-10-27'),
(11, 'Chapter Seven: The Lost Sister', 2, 7, '00:45:00', '2017-10-27'),
(11, 'Chapter Eight: The Mind Flayer', 2, 8, '00:48:00', '2017-10-27'),
(11, 'Chapter Nine: The Gate', 2, 9, '01:02:00', '2017-10-27'),
-- Saison 3
(11, 'Chapter One: Suzie, Do You Copy?', 3, 1, '00:51:00', '2019-07-04'),
(11, 'Chapter Two: The Mall Rats', 3, 2, '00:49:00', '2019-07-04'),
(11, 'Chapter Three: The Case of the Missing Lifeguard', 3, 3, '00:51:00', '2019-07-04'),
(11, 'Chapter Four: The Sauna Test', 3, 4, '00:52:00', '2019-07-04'),
(11, 'Chapter Five: The Flayed', 3, 5, '00:55:00', '2019-07-04'),
(11, 'Chapter Six: E Pluribus Unum', 3, 6, '00:53:00', '2019-07-04'),
(11, 'Chapter Seven: The Bite', 3, 7, '00:52:00', '2019-07-04'),
(11, 'Chapter Eight: The Battle of Starcourt', 3, 8, '01:17:00', '2019-07-04'),
-- Saison 4
(11, 'Chapter One: The Hellfire Club', 4, 1, '01:16:00', '2022-05-27'),
(11, 'Chapter Two: Vecna''s Curse', 4, 2, '01:18:00', '2022-05-27'),
(11, 'Chapter Three: The Monster and the Superhero', 4, 3, '01:03:00', '2022-05-27'),
(11, 'Chapter Four: Dear Billy', 4, 4, '01:18:00', '2022-05-27'),
(11, 'Chapter Five: The Nina Project', 4, 5, '01:15:00', '2022-05-27'),
(11, 'Chapter Six: The Dive', 4, 6, '01:08:00', '2022-05-27'),
(11, 'Chapter Seven: The Massacre at Hawkins Lab', 4, 7, '01:38:00', '2022-05-27'),
(11, 'Chapter Eight: Papa', 4, 8, '01:25:00', '2022-07-01'),
(11, 'Chapter Nine: The Piggyback', 4, 9, '02:30:00', '2022-07-01');
                            `}
                        </CodeCard>
                    </ListItem>

                    <ListItem>
                        Dans un terminal executer la commande
                        <CodeCard language="SH">
                            {`psql -h woody -f bd/init.sql`}
                        </CodeCard>
                    </ListItem>

                    <ListItem>

                        <Text>créez un fichier <Code>public/test_connexion.php</Code> et ajoutez le code suivant
                            :</Text>
                        <CodeCard language="php">
                            {`<?php 
require_once '../config/config.php';
try {
    $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME;
    $pdo = new PDO($dsn, DB_USER, DB_PASS);
    echo "La connexion à la base de données est opérationnelle.";
} 
catch (PDOException $e) {
    echo "Erreur : " . $e->getMessage();
}`}
                        </CodeCard>
                        <Text>Testez la connexion sur <Link color="teal.500"
                                                            href="localhost:8000/test_connexion.php">localhost:8000/test_connexion.php</Link></Text>
                    </ListItem>
                </List>

            </section>
            <section>
                <Heading level={2} netflex>
                    B - Les séries
                </Heading>

                <Heading level={3}>1/ Classe <Code>Series</Code></Heading>
                <Text>
                    Dans le dossier <Code>app/entities</Code>, créez la classe <Code>Series</Code> avec les
                    propriétés suivantes :
                </Text>

                <List>
                    <ListItem><Text><Code>id</Code> — <em>int</em> — colonne <Code>id</Code></Text></ListItem>
                    <ListItem><Text><Code>title</Code> — <em>string</em> — colonne <Code>title</Code></Text></ListItem>
                    <ListItem><Text><Code>description</Code> — <em>string</em> — colonne <Code>description</Code></Text></ListItem>
                    <ListItem><Text><Code>releaseYearStart</Code> — <em>int</em> —
                        colonne <Code>release_year_start</Code></Text></ListItem>
                    <ListItem><Text><Code>releaseYearEnd</Code> — <em>int | null</em> —
                        colonne <Code>release_year_end</Code></Text></ListItem>
                    <ListItem><Text><Code>currentSeason</Code> — <em>int</em> —
                        colonne <Code>current_season</Code></Text></ListItem>
                    <ListItem><Text><Code>quality</Code> — <em>string</em> —
                        colonne <Code>quality</Code></Text></ListItem>
                    <ListItem><Text><Code>audio</Code> — <em>string</em> — colonne <Code>audio</Code></Text></ListItem>
                    <ListItem><Text><Code>image</Code> — <em>string</em> — colonne <Code>image</Code></Text></ListItem>
                    <ListItem><Text><Code>tags</Code> — <em>array</em> —
                        colonne <Code>tags</Code> (JSON)</Text></ListItem>
                    <ListItem><Text><Code>createdAt</Code> — <em>Date</em> —
                        colonne <Code>created_at</Code></Text></ListItem>
                    <ListItem><Text><Code>updatedAt</Code> — <em>Date</em> —
                        colonne <Code>updated_at</Code></Text></ListItem>
                </List>

                <Heading level={3}>2/ Classe <Code>SeriesRepository</Code></Heading>
                <Text>
                    Dans le dossier <Code>app/repositories</Code>, créez la
                    classe <Code>SeriesRepository</Code> contenant les méthodes :
                </Text>

                <List>
                    <ListItem>
                        <Text><Code>createSeriesFromRow(array $row): Series</Code> — transforme un tableau PDO en
                            objet <Code>Series</Code>.</Text>
                    </ListItem>
                    <ListItem>
                        <Text><Code>findAll(): array</Code> — renvoie un tableau d’objets <Code>Series</Code>.</Text>
                    </ListItem>
                </List>

                <Heading level={3}>3/ Modification du <Code>HomeController</Code></Heading>
                <Text>
                    Modifiez la classe <Code>HomeController</Code> pour remplacer le tableau de films par un appel
                    à <Code>findAll()</Code> du repository.
                </Text>

                <Heading level={3}>4/ Mise à jour de la vue <Code>home.html.php</Code></Heading>
                <Text>
                    Modifiez la vue <Code>home.html.php</Code> pour :
                </Text>
                <List>
                    <ListItem>
                        <Text>Remplacer la boucle actuelle et utiliser les objets <Code>Series</Code> pour
                            l&apos;affichage.</Text>
                    </ListItem>
                    <ListItem>
                        <Text>Ajouter un lien vers la page de détail de chaque série : <Code>&lt;a
                            href=&quot;series.php?id=&lt;?=$serie-&gt;getId() ?&gt;&quot;&gt;</Code></Text>
                    </ListItem>
                </List>
            </section>
            <section>
                <Heading level={2} netflex>
                    C - Page de détail d&apos;une série
                </Heading>

                <Heading level={3}>1/ Classe <Code>Episode</Code></Heading>
                <Text>
                    Dans le dossier <Code>app/entities</Code>, créez la classe <Code>Episode</Code> avec les
                    propriétés suivantes :
                </Text>

                <List>
                    <ListItem><Text><Code>id</Code> — <em>int</em> — colonne <Code>id</Code></Text></ListItem>
                    <ListItem><Text><Code>seriesId</Code> — <em>int</em> —
                        colonne <Code>series_id</Code></Text></ListItem>
                    <ListItem><Text><Code>title</Code> — <em>string</em> — colonne <Code>title</Code></Text></ListItem>
                    <ListItem><Text><Code>season</Code> — <em>int</em> — colonne <Code>season</Code></Text></ListItem>
                    <ListItem><Text><Code>episodeNumber</Code> — <em>int</em> —
                        colonne <Code>episode_number</Code></Text></ListItem>
                    <ListItem><Text><Code>duration</Code> — <em>string | null</em> —
                        colonne <Code>duration</Code></Text></ListItem>
                    <ListItem><Text><Code>releaseDate</Code> — <em>Date | null</em> — colonne <Code>release_date</Code></Text></ListItem>
                    <ListItem><Text><Code>createdAt</Code> — <em>Date</em> —
                        colonne <Code>created_at</Code></Text></ListItem>
                    <ListItem><Text><Code>updatedAt</Code> — <em>Date</em> —
                        colonne <Code>updated_at</Code></Text></ListItem>
                </List>

                <Heading level={3}>2/ Modification de <Code>SeriesRepository</Code></Heading>
                <Text>
                    Ajoutez la méthode suivante dans la classe <Code>SeriesRepository</Code> :
                </Text>

                <List>
                    <ListItem>
                        <Text><Code>findById(int $id): ?Series</Code> — renvoie un
                            objet <Code>Series</Code> correspondant à l&apos;ID ou <Code>null</Code> si non
                            trouvé.</Text>
                    </ListItem>
                </List>

                <Heading level={3}>3/ Création du <Code>SeriesController</Code></Heading>
                <Text>
                    Dans le dossier <Code>app/controllers</Code>, créez la classe <Code>SeriesController</Code> avec une
                    méthode <Code>show()</Code> qui :
                </Text>

                <List>
                    <ListItem>
                        <Text>Récupère l&apos;<Code>id</Code> depuis <Code>$_GET[&apos;id&apos;]</Code>.</Text>
                    </ListItem>
                    <ListItem>
                        <Text>Utilise <Code>SeriesRepository::findById()</Code> pour récupérer la série.</Text>
                    </ListItem>
                    <ListItem>
                        <Text>Si la série n&apos;existe pas, redirige vers la page d&apos;accueil.</Text>
                    </ListItem>
                    <ListItem>
                        <Text>Sinon, affiche la vue <Code>series.html.php</Code> en lui passant
                            l&apos;objet <Code>$series</Code>.</Text>
                    </ListItem>
                </List>

                <Heading level={3}>4/ Création de la page <Code>series.php</Code></Heading>
                <Text>
                    Créez le fichier <Code>public/series.php</Code> qui instancie <Code>SeriesController</Code> et
                    appelle la méthode <Code>show()</Code>.
                </Text>

                <Heading level={3}>5/ Création de la vue <Code>series.html.php</Code></Heading>
                <Text>
                    Copiez le HTML suinant dans un nouveau fichier <Code>views/series.html.php</Code>.</Text>
                    <CodeCard language="html" filename={"series.html.php"} collapsible>{`
                        <!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>__SERIES_TITLE__ - Netflex</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700;900&family=Spline+Sans:wght@400;500;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="style.css" rel="stylesheet"/>
</head>
<body>
<!-- HEADER -->
<header class="border-bottom border-dark px-4 py-3 d-flex justify-content-between align-items-center">
    <div class="d-flex align-items-center gap-3">
        <h1 class="logo m-0"><a href="index.php" class="text-decoration-none text-white">NETFLEX</a></h1>
    </div>
    <div class="d-flex align-items-center gap-3">
        <nav class="d-none d-md-flex gap-3">
            <a class="text-white text-decoration-none" href="index.php">Home</a>
            <a class="text-white text-decoration-none" href="#">Series</a>
            <a class="text-white text-decoration-none" href="#">Movies</a>
            <a class="text-white text-decoration-none" href="#">New & Popular</a>
            <a class="text-white text-decoration-none" href="#">My List</a>
        </nav>
    </div>
    <div class="d-flex align-items-center gap-3">
        <form class="d-none d-sm-block position-relative">
            <span class="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y ps-2 text-muted">search</span>
            <input class="form-control ps-5 bg-dark border-secondary text-white" type="search" placeholder="Search"/>
        </form>
        <i class="fa-regular fa-circle-user fa-2xl"></i>
    </div>
</header>

<!-- HERO SERIE -->
<section class="hero-home d-flex align-items-end text-white" style="background-image: linear-gradient(to top, rgba(20,20,20,0.9) 0%, rgba(20,20,20,0) 50%), url('img/__SERIES_IMAGE__');">
    <div class="container py-5">
        <h1 class="display-4 fw-bold">__SERIES_TITLE__</h1>
        <div class="d-flex gap-3 small text-white mb-3">
            <span>__RELEASE_YEAR_START__ - __RELEASE_YEAR_END__</span>
            <span>|</span>
            <span>__CURRENT_SEASON__ saison(s)</span>
            <span>|</span>
            <span class="border px-2">__QUALITY__</span>
            <span class="border px-2">__AUDIO__</span>
        </div>
        
        <!-- Tags -->
        <div class="d-flex gap-2 mb-3">
            __TAGS__
        </div>
        
        <p class="mt-3">
            __SERIES_DESCRIPTION__
        </p>
        
        <div class="d-flex gap-3 mt-4">
            <button class="btn btn-danger d-flex align-items-center gap-2">
                <i class="fas fa-play"></i> Lire
            </button>
            <button class="btn btn-outline-light d-flex align-items-center gap-2">
                <i class="fas fa-plus"></i> Ajouter à ma liste
            </button>
        </div>
    </div>
</section>

<main class="container py-5">
    <!-- Liste des épisodes -->
    <h2 class="text-white mb-4">Épisodes</h2>
    
    <!-- Saison 1 -->
    <div class="mb-5">
        <h3 class="text-white mb-3">Saison __SEASON_NUMBER__</h3>
        <div class="row g-3">
            <!-- Épisode -->
            <div class="col-12">
                <div class="card bg-dark text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="card-title">
                                    __EPISODE_NUMBER__. __EPISODE_TITLE__
                                </h5>
                                <p class="card-text small text-muted">
                                    <i class="far fa-clock"></i> __EPISODE_DURATION__
                                    <span class="ms-3"><i class="far fa-calendar"></i> __EPISODE_RELEASE_DATE__</span>
                                </p>
                            </div>
                            <button class="btn btn-danger btn-sm">
                                <i class="fas fa-play"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Répéter pour d'autres épisodes -->
        </div>
    </div>
    <!-- Répéter pour d'autres saisons -->
</main>

<footer>
    <p>&copy; 2025 Netflex Clone. <a href="#">Privacy</a> | <a href="#">Terms</a></p>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`}</CodeCard>

                <Text>
                    Modifiez la section HERO pour afficher les informations de la série (titre, image, description,
                    années, saison actuelle, qualité, audio, tags) en utilisant l&apos;objet <Code>$series</Code>.
                </Text>

                <Heading level={3}>6/ Classe <Code>EpisodeRepository</Code></Heading>
                <Text>
                    Dans le dossier <Code>app/repositories</Code>, créez la
                    classe <Code>EpisodeRepository</Code> contenant les méthodes :
                </Text>

                <List>
                    <ListItem>
                        <Text><Code>createEpisodeFromRow(array $row): Episode</Code> — transforme un tableau PDO en
                            objet <Code>Episode</Code>.</Text>
                    </ListItem>
                    <ListItem>
                        <Text><Code>findBySeriesId(int $seriesId): array</Code> — renvoie un tableau
                            d&apos;objets <Code>Episode</Code> pour une série donnée, triés par saison et numéro
                            d&apos;épisode (<Code>ORDER BY season ASC, episode_number ASC</Code>).</Text>
                    </ListItem>
                </List>

                <Heading level={3}>7/ Affichage des épisodes</Heading>
                <Text>
                    Modifiez le <Code>SeriesController</Code> pour récupérer les épisodes
                    avec <Code>EpisodeRepository::findBySeriesId()</Code> et les passer à la vue.
                </Text>

                <Text>
                    Il aurait été plus propre d&apos;avoir une table <Code>seasons</Code> en plus
                    de <Code>series</Code> et <Code>episodes</Code> pour stocker les informations de chaque saison.
                    Cependant, cela ajouterait de la complexité lors de la réalisation de la partie Administration
                    (gestion des relations entre trois tables au lieu de deux). nous allons donc, dans le controller,
                    ajouter ce code pour recréer le tableau de saisons :
                </Text>

                <CodeCard language="php">{`// Grouper les épisodes par saison
$episodesBySeason = [];
foreach ($episodes as $episode) {
    $episodesBySeason[$episode->getSeason()][] = $episode;

// Afficher chaque saison
foreach ($episodesBySeason as $seasonNumber => $seasonEpisodes) {
// Boucler sur $seasonEpisodes pour afficher chaque épisode`}
                </CodeCard>

                <Text>
                    Dans la vue <Code>series.html.php</Code>, modifié le main <Code>&lt;main&gt;</Code> pour afficher
                    les épisodes groupés par saison.
                </Text>
            </section>
            {/*<section>
                <Heading level={2} netflex>
                    D - Administration des séries
                </Heading>
                <Heading level={3}>1/ Templates d&apos;administration</Heading>

                <Heading level={4}>Création du header admin</Heading>
                <Text>
                    Dans le dossier <Code>views/_template/</Code>, créez le fichier <Code>header_admin.html.php</Code> :
                </Text>
                <CodeCard language="php" filename="header_admin.html.php" collapsible>
                    {`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title><?= $title ?? 'Administration' ?> - Netflex Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700;900&family=Spline+Sans:wght@400;500;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="style.css" rel="stylesheet"/>
</head>
<body class="bg-dark">
    <!-- HEADER ADMIN -->
    <header class="bg-black border-bottom border-danger px-4 py-3">
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-4">
                    <h1 class="logo m-0">
                        <a href="index.php" class="text-decoration-none text-white">NETFLEX</a>
                        <span class="badge bg-danger ms-2">ADMIN</span>
                    </h1>
                    <nav class="d-none d-md-flex gap-3">
                        <a class="text-white text-decoration-none" href="admin_series.php">
                            <i class="fas fa-tv me-1"></i> Séries
                        </a>
                        <a class="text-white text-decoration-none" href="#">
                            <i class="fas fa-film me-1"></i> Films
                        </a>
                        <a class="text-white text-decoration-none" href="#">
                            <i class="fas fa-users me-1"></i> Utilisateurs
                        </a>
                    </nav>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <a href="index.php" class="btn btn-outline-light btn-sm">
                        <i class="fas fa-arrow-left me-1"></i> Retour au site
                    </a>
                    <i class="fa-regular fa-circle-user fa-2xl text-white"></i>
                </div>
            </div>
        </div>
    </header>`}
                </CodeCard>
                <Heading level={4}>Création du footer admin</Heading>
                <Text>
                    Dans le dossier <Code>views/_template/</Code>, créez le fichier <Code>footer_admin.html.php</Code> :
                </Text>
                <CodeCard language="php" filename="footer_admin.html.php">
                    {`    <footer class="bg-black text-white py-4 mt-5">
<div class="container-fluid text-center">
<p class="mb-0">
© 2025 Netflex Admin -
<a href="#" class="text-danger text-decoration-none">Documentation</a> |
<a href="#" class="text-danger text-decoration-none">Support</a>
</p>
</div>
</footer>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`}
                </CodeCard>

                <Heading level={3}>4/ Création du <Code>AdminSeriesController</Code></Heading>

                <Heading level={3}>5/ Création de la page <Code>admin_series.php</Code></Heading>
                <Text>
                    Créez le fichier <Code>public/admin_series.php</Code> :
                </Text>
                <CodeCard language="php" filename="admin_series.php">
                    {`<?php
require_once DIR . '/../app/controllers/AdminSeriesController.php';
$controller = new AdminSeriesController();
// Gestion des actions
$action = $_GET['action'] ?? 'index';
switch ($action) {
case 'episodes':
$controller->episodes();
break;
case 'delete':
$controller->delete();
break;
default:
$controller->index();
break;
}`}
                </CodeCard>
                <Heading level={3}>6/ Création de la vue <Code>admin/series_list.html.php</Code></Heading>
                <Text>
                    Dans le dossier <Code>views/admin/</Code>, créez le fichier <Code>series_list.html.php</Code> :
                </Text>
                <CodeCard language="php" filename="series_list.html.php" collapsible>
                    {`<?php require_once __DIR__ . '/../_template/header_admin.html.php'; ?>
<main class="container-fluid py-4">
    <div class="row mb-4">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h2 class="text-white mb-2">
                        <i class="fas fa-tv text-danger me-2"></i>
                        Gestion des séries
                    </h2>
                    <p class="text-muted mb-0">
                        <?= count($series) ?> série(s) au total
                    </p>
                </div>
                <a href="admin_series.php?action=create" class="btn btn-danger">
                    <i class="fas fa-plus me-2"></i>
                    Ajouter une série
                </a>
            </div>
        </div>
    </div>
<?php if (isset($_GET['success']) && $_GET['success'] === 'deleted'): ?>
<div class="alert alert-success alert-dismissible fade show" role="alert">
    <i class="fas fa-check-circle me-2"></i>
    La série a été supprimée avec succès.
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
<?php endif; ?>

<!-- Tableau des séries -->
<div class="card bg-dark text-white border-secondary">
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-dark table-hover mb-0">
                <thead class="border-bottom border-danger">
                    <tr>
                        <th style="width: 60px;">ID</th>
                        <th>Titre</th>
                        <th style="width: 120px;">Années</th>
                        <th style="width: 100px;">Saisons</th>
                        <th style="width: 100px;">Épisodes</th>
                        <th style="width: 100px;">Qualité</th>
                        <th style="width: 150px;">Créé le</th>
                        <th style="width: 200px;" class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($series as $serie): ?>
                    <tr>
                        <td class="align-middle">
                            <span class="badge bg-secondary">#<?= $serie->getId() ?></span>
                        </td>
                        <td class="align-middle">
                            <div class="d-flex align-items-center">
                                <?php if ($serie->getImage()): ?>
                                <img src="img/<?= htmlspecialchars($serie->getImage()) ?>"
                                     alt="<?= htmlspecialchars($serie->getTitle()) ?>"
                                     class="rounded me-3"
                                     style="width: 60px; height: 40px; object-fit: cover;">
                                <?php endif; ?>
                                <strong><?= htmlspecialchars($serie->getTitle()) ?></strong>
                            </div>
                        </td>
                        <td class="align-middle">
                            <?= $serie->getReleaseYearStart() ?> -
                            <?= $serie->getReleaseYearEnd() ?? 'En cours' ?>
                        </td>
                        <td class="align-middle text-center">
                            <span class="badge bg-info"><?= $serie->getCurrentSeason() ?></span>
                        </td>
                        <td class="align-middle text-center">
                            <span class="badge bg-primary"><?= $serie->episodeCount ?></span>
                        </td>
                        <td class="align-middle">
                            <span class="badge bg-success"><?= htmlspecialchars($serie->getQuality() ?? 'N/A') ?></span>
                        </td>
                        <td class="align-middle text-muted small">
                            <?= $serie->getCreatedAt()->format('d/m/Y') ?>
                        </td>
                        <td class="align-middle text-end">
                            <div class="btn-group btn-group-sm" role="group">
                                <a href="admin_series.php?action=episodes&id=<?= $serie->getId() ?>"
                                   class="btn btn-outline-info"
                                   title="Voir les épisodes">
                                    <i class="fas fa-list"></i>
                                </a>
                                <a href="admin_series.php?action=edit&id=<?= $serie->getId() ?>"
                                   class="btn btn-outline-warning"
                                   title="Modifier">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <a href="admin_series.php?action=delete&id=<?= $serie->getId() ?>"
                                   class="btn btn-outline-danger"
                                   title="Supprimer"
                                   onclick="return confirm('Êtes-vous sûr de vouloir supprimer cette série et tous ses épisodes ?')">
                                    <i class="fas fa-trash"></i>
                                </a>
                            </div>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
</main>
<?php require_once __DIR__ . '/../_template/footer_admin.html.php'; ?>`}
                </CodeCard>

                <Heading level={3}>7/ Création de la vue <Code>admin/episodes_list.html.php</Code></Heading>
                <Text>
                    Dans le dossier <Code>views/admin/</Code>, créez le fichier <Code>episodes_list.html.php</Code> :
                </Text>
                <CodeCard language="php" filename="episodes_list.html.php" collapsible>
                    {`<?php require_once __DIR__ . '/../_template/header_admin.html.php'; ?>
<main class="container-fluid py-4">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
            <li class="breadcrumb-item">
                <a href="admin_series.php" class="text-danger text-decoration-none">Séries</a>
            </li>
            <li class="breadcrumb-item active text-white" aria-current="page">
                <?= htmlspecialchars($series->getTitle()) ?>
            </li>
        </ol>
    </nav>
<!-- En-tête -->
<div class="row mb-4">
    <div class="col-12">
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <h2 class="text-white mb-2">
                    <i class="fas fa-list text-danger me-2"></i>
                    Épisodes - <?= htmlspecialchars($series->getTitle()) ?>
                </h2>
                <div class="d-flex gap-3 text-muted">
                    <span><i class="fas fa-calendar me-1"></i>
                        <?= $series->getReleaseYearStart() ?> - <?= $series->getReleaseYearEnd() ?? 'En cours' ?>
                    </span>
                    <span><i class="fas fa-layer-group me-1"></i>
                        <?= $series->getCurrentSeason() ?> saison(s)
                    </span>
                    <span><i class="fas fa-film me-1"></i>
                        <?= count($episodes) ?> épisode(s)
                    </span>
                </div>
            </div>
            <a href="admin_series.php?action=create_episode&series_id=<?= $series->getId() ?>"
               class="btn btn-danger">
                <i class="fas fa-plus me-2"></i>
                Ajouter un épisode
            </a>
        </div>
    </div>
</div>

<!-- Épisodes par saison -->
<?php foreach ($episodesBySeason as $seasonNumber => $seasonEpisodes): ?>
<div class="mb-4">
    <div class="card bg-dark text-white border-secondary">
        <div class="card-header bg-black border-danger d-flex justify-content-between align-items-center">
            <h4 class="mb-0">
                <i class="fas fa-layer-group text-danger me-2"></i>
                Saison <?= $seasonNumber ?>
            </h4>
            <span class="badge bg-danger"><?= count($seasonEpisodes) ?> épisode(s)</span>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-dark table-hover mb-0">
                    <thead class="border-bottom border-secondary">
                        <tr>
                            <th style="width: 80px;">N°</th>
                            <th>Titre</th>
                            <th style="width: 120px;">Durée</th>
                            <th style="width: 150px;">Date de sortie</th>
                            <th style="width: 150px;" class="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($seasonEpisodes as $episode): ?>
                        <tr>
                            <td class="align-middle">
                                <span class="badge bg-info">E<?= str_pad($episode->getEpisodeNumber(), 2, '0', STR_PAD_LEFT) ?></span>
                            </td>
                            <td class="align-middle">
                                <strong><?= htmlspecialchars($episode->getTitle()) ?></strong>
                            </td>
                            <td class="align-middle text-muted">
                                <i class="far fa-clock me-1"></i>
                                <?= $episode->getDuration() ?? 'N/A' ?>
                            </td>
                            <td class="align-middle text-muted">
                                <i class="far fa-calendar me-1"></i>
                                <?= $episode->getReleaseDate() ? $episode->getReleaseDate()->format('d/m/Y') : 'N/A' ?>
                            </td>
                            <td class="align-middle text-end">
                                <div class="btn-group btn-group-sm" role="group">
                                    <a href="admin_series.php?action=edit_episode&id=<?= $episode->getId() ?>"
                                       class="btn btn-outline-warning"
                                       title="Modifier">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <a href="admin_series.php?action=delete_episode&id=<?= $episode->getId() ?>&series_id=<?= $series->getId() ?>"
                                       class="btn btn-outline-danger"
                                       title="Supprimer"
                                       onclick="return confirm('Êtes-vous sûr de vouloir supprimer cet épisode ?')">
                                        <i class="fas fa-trash"></i>
                                    </a>
                                </div>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
<?php endforeach; ?>

<?php if (empty($episodes)): ?>
<div class="alert alert-warning" role="alert">
    <i class="fas fa-exclamation-triangle me-2"></i>
    Aucun épisode n'a été ajouté pour cette série.
</div>
<?php endif; ?>
</main>
<?php require_once __DIR__ . '/../_template/footer_admin.html.php'; ?>`}
                </CodeCard>

                <Heading level={3}>8/ Ajout du lien d&apos;administration</Heading>
                <Text>
                    Dans le header principal (<Code>header.html.php</Code> ou directement
                    dans <Code>home.html.php</Code>), ajoutez un lien vers l&apos;administration :
                </Text>
                <CodeCard language="html">
                    {`<a href="admin_series.php" className="text-white text-decoration-none"> <i
                        className="fas fa-cog me-1"></i> Admin </a>`}
                </CodeCard>
                <div className="alert alert-info mt-4">
                    <h5 className="alert-heading">
                        <i className="fas fa-lightbulb me-2"></i>
                        Points importants
                    </h5>
                    <List>
                        <ListItem>
                            Les templates admin utilisent un design cohérent avec le site principal (thème sombre
                            Netflix)
                        </ListItem>
                        <ListItem>
                            Le badge &quot;ADMIN&quot; distingue clairement l&apos;interface d&apos;administration
                        </ListItem>
                        <ListItem>
                            Les tableaux utilisent Bootstrap pour un affichage responsive
                        </ListItem>
                        <ListItem>
                            Les actions de suppression incluent une confirmation JavaScript
                        </ListItem>
                        <ListItem>
                            Les épisodes sont groupés par saison pour une meilleure lisibilité
                        </ListItem>
                        <ListItem>
                            Les compteurs d&apos;épisodes sont ajoutés dynamiquement pour chaque série
                        </ListItem>
                        <ListItem>
                            Le breadcrumb facilite la navigation entre les pages d&apos;administration
                        </ListItem>
                    </List>
                </div>
            </section>*/}
        </article>
    );
}
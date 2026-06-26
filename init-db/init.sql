-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : sam. 06 juin 2026 à 11:31
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12
USE db_cim;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `db_cim`
--

-- --------------------------------------------------------

--
-- Structure de la table `annonces`
--

CREATE TABLE `annonces` (
  `id` bigint(20) NOT NULL,
  `contenu` text DEFAULT NULL,
  `date_expiration` datetime(6) DEFAULT NULL,
  `date_publication` datetime(6) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `piece_jointe` varchar(255) DEFAULT NULL,
  `priorite` varchar(255) DEFAULT NULL,
  `statut` enum('BROUILLON','PUBLIE','ARCHIVEE') DEFAULT NULL,
  `titre` varchar(255) NOT NULL,
  `admin_id` bigint(20) DEFAULT NULL,
  `pole_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `annonces`
--

INSERT INTO `annonces` (`id`, `contenu`, `date_expiration`, `date_publication`, `image`, `piece_jointe`, `priorite`, `statut`, `titre`, `admin_id`, `pole_id`) VALUES
(2, 'Inscriptions ouvertes pour l\'incubateur CIM.\n', '2026-06-14 10:05:00.000000', '2026-05-15 10:05:02.000000', '', '', 'NORMAL', 'PUBLIE', 'Nouveau programme d\'incubation', 3, 2),
(3, '<p>Annonce en préparation.</p>', NULL, NULL, NULL, NULL, 'INFO', 'BROUILLON', 'Brouillon - Événement à venir', 3, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` bigint(20) NOT NULL,
  `content` varchar(5000) NOT NULL,
  `date` datetime(6) NOT NULL,
  `role` varchar(255) NOT NULL,
  `session_id` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `equipements`
--

CREATE TABLE `equipements` (
  `id` bigint(20) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `disponible` bit(1) DEFAULT NULL,
  `nom` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `equipements`
--

INSERT INTO `equipements` (`id`, `description`, `disponible`, `nom`) VALUES
(1, 'Projecteur HD', b'1', 'Vidéoprojecteur'),
(2, 'Routeur fibre', b'1', 'Wifi Haut Débit'),
(3, 'Écran tactile', b'1', 'Tableau Interactif');

-- --------------------------------------------------------

--
-- Structure de la table `evenements`
--

CREATE TABLE `evenements` (
  `id` bigint(20) NOT NULL,
  `contenu` text DEFAULT NULL,
  `date_debut` datetime(6) DEFAULT NULL,
  `date_expiration` datetime(6) DEFAULT NULL,
  `date_fin` datetime(6) DEFAULT NULL,
  `date_publication` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `image_principale` varchar(255) DEFAULT NULL,
  `lieu` varchar(255) DEFAULT NULL,
  `nombre_places_limitee` bit(1) DEFAULT NULL,
  `nombre_places_max` int(11) DEFAULT NULL,
  `statut` enum('BROUILLON','PUBLIE','ARCHIVEE') NOT NULL DEFAULT 'BROUILLON',
  `titre` varchar(255) NOT NULL,
  `admin_id` bigint(20) DEFAULT NULL,
  `type_evenement` enum('REUNION','FORMATION','CONFERENCE','AUTRE') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `evenements`
--

INSERT INTO `evenements` (`id`, `contenu`, `date_debut`, `date_expiration`, `date_fin`, `date_publication`, `description`, `image_principale`, `lieu`, `nombre_places_limitee`, `nombre_places_max`, `statut`, `titre`, `admin_id`, `type_evenement`) VALUES
(2, '', '2026-06-04 10:05:00.000000', NULL, '2026-06-04 14:05:00.000000', '2026-05-28 20:28:11.000000', 'Création de startup', '', 'Espace Coworking', b'1', 40, 'PUBLIE', 'Atelier Entrepreneuriat', 3, 'FORMATION'),
(3, NULL, '2026-06-19 10:05:02.000000', NULL, '2026-06-19 13:05:02.000000', '2026-05-28 18:58:22.000000', 'Données ouvertes et recherche', NULL, 'Amphithéâtre', b'0', NULL, 'PUBLIE', 'Conférence Open Data', 3, NULL),
(4, NULL, '2026-06-01 11:00:00.000000', NULL, '2026-06-03 13:00:00.000000', '2026-05-19 09:54:04.000000', '', NULL, 'M', b'1', 20, 'BROUILLON', 'hackathon', 3, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `evenement_galerie_images`
--

CREATE TABLE `evenement_galerie_images` (
  `evenement_id` bigint(20) NOT NULL,
  `galerie_images` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `evenement_galerie_images`
--

INSERT INTO `evenement_galerie_images` (`evenement_id`, `galerie_images`) VALUES
(2, 'http://localhost:8080/uploads/evenements/646ef69b-1340-4aba-bfb4-a4c5c88ec84f.jpg');

-- --------------------------------------------------------

--
-- Structure de la table `inscriptions_evenements`
--

CREATE TABLE `inscriptions_evenements` (
  `id` bigint(20) NOT NULL,
  `confirme_presence` bit(1) DEFAULT NULL,
  `date_inscription` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `etablissement` varchar(255) DEFAULT NULL,
  `filiere` varchar(255) DEFAULT NULL,
  `niveau` varchar(255) DEFAULT NULL,
  `niveau_etudes` varchar(255) DEFAULT NULL,
  `nom` varchar(255) NOT NULL,
  `numero_inscription` varchar(255) DEFAULT NULL,
  `prenom` varchar(255) NOT NULL,
  `source` varchar(255) DEFAULT NULL,
  `statut` varchar(255) DEFAULT NULL,
  `telephone` varchar(255) DEFAULT NULL,
  `token_confirmation` varchar(255) DEFAULT NULL,
  `evenement_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `local_equipements`
--

CREATE TABLE `local_equipements` (
  `local_id` bigint(20) NOT NULL,
  `equipement` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `local_equipements`
--

INSERT INTO `local_equipements` (`local_id`, `equipement`) VALUES
(1, 'Vidéoprojecteur'),
(1, 'Visioconférence'),
(1, 'Wifi Haut Débit'),
(1, 'hp'),
(15, 'Vidéoprojecteur'),
(15, 'Wifi Haut Débit'),
(15, 'Tableau Interactif'),
(16, 'Wifi Haut Débit'),
(16, 'Vidéoprojecteur'),
(16, 'Visioconférence');

-- --------------------------------------------------------

--
-- Structure de la table `local_images`
--

CREATE TABLE `local_images` (
  `local_id` bigint(20) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `local_images`
--

INSERT INTO `local_images` (`local_id`, `image_url`) VALUES
(1, 'http://localhost:8080/uploads/locaux/5bedb54a-c0dd-44a1-bc00-b0d2b5a217e2.jpg'),
(1, 'http://localhost:8080/uploads/locaux/d3fcb4c7-3095-4fc7-84b1-0e3d9d82c437.jpg'),
(4, 'http://localhost:8080/uploads/locaux/23bc2bcf-4771-4ec7-8fb4-ceb085ee5386.jpg'),
(4, 'http://localhost:8080/uploads/locaux/ea84981e-91bf-4321-87fc-f24abb3654f1.jpg'),
(4, 'http://localhost:8080/uploads/locaux/2c8a473e-4cec-4b46-9596-acf010ebab77.jpg'),
(4, 'http://localhost:8080/uploads/locaux/b2d953a8-cad7-45bf-86a7-d7b07b9699dd.jpg'),
(9, 'http://localhost:8080/uploads/locaux/99be5526-80aa-4dde-b439-0830ee626071.jpg'),
(9, 'http://localhost:8080/uploads/locaux/5182ee53-0e2c-4f5a-aac8-c84dddcb6bae.jpg'),
(15, 'http://localhost:8080/uploads/locaux/dc5f2223-eb49-4416-9492-62e75c27e7c0.jpg'),
(15, 'http://localhost:8080/uploads/locaux/4077c806-8c3f-4955-ba96-b7fb8dbb7511.jpg'),
(15, 'http://localhost:8080/uploads/locaux/1f3fd0ed-815f-4f83-ad04-68c164ea9e72.jpg'),
(15, 'http://localhost:8080/uploads/locaux/233b1463-e200-47e9-a203-b3bab824b0f7.jpg'),
(15, 'http://localhost:8080/uploads/locaux/a65e728f-f593-401d-8c86-6ee7137b8058.jpg'),
(16, 'http://localhost:8080/uploads/locaux/2522594d-1b35-4ae4-943f-c2a38c36978a.jpg'),
(16, 'http://localhost:8080/uploads/locaux/575fde08-9426-49fd-adcc-22d448b19f7c.jpg'),
(16, 'http://localhost:8080/uploads/locaux/1f2cee83-1323-49df-af22-afd4027dbcab.jpg'),
(16, 'http://localhost:8080/uploads/locaux/6d62833d-42a6-4c3e-8884-386618becfe0.jpg'),
(17, 'http://localhost:8080/uploads/locaux/704a61ef-e64a-4cc5-a262-d1b5afb3b588.jpg'),
(17, 'http://localhost:8080/uploads/locaux/d3195bc8-c37b-4fb6-bb30-c98f0bec8072.jpg'),
(17, 'http://localhost:8080/uploads/locaux/c4d60bc7-df6e-4deb-9941-1c19da83ae1a.jpg'),
(19, 'http://localhost:8080/uploads/locaux/97e2301c-c636-4f5c-92f1-5216088dd39e.jpg'),
(19, 'http://localhost:8080/uploads/locaux/4d85b082-f393-4330-8be0-19a64f02f574.jpg'),
(19, 'http://localhost:8080/uploads/locaux/eb917fe6-248e-4edc-b593-207ede1ec66d.jpg'),
(19, 'http://localhost:8080/uploads/locaux/b5bcd658-4702-43da-9745-ae3b1e444e7c.jpg'),
(20, 'http://localhost:8080/uploads/locaux/4ea1345d-f29c-4a50-823a-2d9e4b7be799.jpg'),
(20, 'http://localhost:8080/uploads/locaux/7a68ec58-a6f7-40fb-8955-7ce335eb205c.jpg'),
(20, 'http://localhost:8080/uploads/locaux/55a4e7e4-b43f-4ed2-b485-c63ffaa27f86.jpg'),
(20, 'http://localhost:8080/uploads/locaux/5f0b8f6c-9b00-40f4-9515-054f9b7da957.jpg'),
(20, 'http://localhost:8080/uploads/locaux/a3277eaf-4ff3-411c-b413-cabe4e956cb2.jpg');

-- --------------------------------------------------------

--
-- Structure de la table `locaux`
--

CREATE TABLE `locaux` (
  `id` bigint(20) NOT NULL,
  `capacite` int(11) DEFAULT NULL,
  `code` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `localisation` varchar(255) DEFAULT NULL,
  `nom` varchar(255) NOT NULL,
  `raison_indisponibilite` varchar(255) DEFAULT NULL,
  `statut` enum('DISPONIBLE','MAINTENANCE','HORS_SERVICE') NOT NULL,
  `tarif_externe` double DEFAULT NULL,
  `tarif_interne` double DEFAULT NULL,
  `etage` int(11) DEFAULT NULL,
  `panorama_url` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `disposition` enum('U','CLASSE','THEATRE','BOARDROOM','LIBRE') DEFAULT NULL,
  `type_local` enum('SALLE_CONFERENCE','CELLULE_RD','BUREAU_INCUBATION','LABORATOIRE','AMPHITHEATRE','COWORKING','ATELIER','SALLE_REUNION') DEFAULT NULL,
  `pole_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `locaux`
--

INSERT INTO `locaux` (`id`, `capacite`, `code`, `description`, `localisation`, `nom`, `raison_indisponibilite`, `statut`, `tarif_externe`, `tarif_interne`, `etage`, `panorama_url`, `video_url`, `disposition`, `type_local`, `pole_id`) VALUES
(1, 200, 'CONF-01', 'Grande salle polyvalente', 'RDC', 'Salle de Conférence Principale', '', 'DISPONIBLE', 0, 0, 0, 'https://pannellum.org/images/alma.jpg', '', 'THEATRE', 'SALLE_CONFERENCE', 1),
(4, 28, 'LAB-01', 'Espace d\'entrée et buvette ', 'RDC', 'Buvette et entrée', 'Maintenance équipements', 'DISPONIBLE', 0, 0, 0, '', '', 'LIBRE', NULL, 2),
(9, 15, '', '', '1èr étage', 'Salle de réunion', '', 'DISPONIBLE', 0, 0, 1, '', '', 'BOARDROOM', 'SALLE_REUNION', 2),
(15, 70, 'LOC-01', '', '3ème étage', 'Espace ouvert', '', 'DISPONIBLE', 0, 0, 3, '', '', 'LIBRE', 'ATELIER', 1),
(16, 20, 'SA-01', '', '2ème étage', 'salle de réunion', '', 'DISPONIBLE', 0, 0, 2, '', '', 'BOARDROOM', 'SALLE_REUNION', 2),
(17, 100, 'ESP-06', '', '5ème étage', 'Espace ouvert', '', 'DISPONIBLE', 0, 0, 5, '', '', 'LIBRE', 'ATELIER', 1),
(19, 20, 'CON-02', '', 'RDC', 'VIP', '', 'DISPONIBLE', 0, 0, 0, '', '', NULL, 'SALLE_CONFERENCE', 2),
(20, 47, 'ESP-01', '', '4ème étage', 'Espace jeux', '', 'DISPONIBLE', 0, 0, 4, '', '', 'LIBRE', 'COWORKING', 1);

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) NOT NULL,
  `date_envoi` datetime(6) DEFAULT NULL,
  `date_lecture` datetime(6) DEFAULT NULL,
  `lien_action` varchar(255) DEFAULT NULL,
  `lue` bit(1) DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `titre` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `utilisateur_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `notifications`
--

INSERT INTO `notifications` (`id`, `date_envoi`, `date_lecture`, `lien_action`, `lue`, `message`, `titre`, `type`, `utilisateur_id`) VALUES
(1, '2026-05-19 09:45:36.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale est en attente de validation.', 'Réservation soumise', 'RESERVATION', 4),
(2, '2026-05-19 09:46:46.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été validée.', 'Réservation validée ✅', 'RESERVATION', 4),
(3, '2026-05-20 17:37:41.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale est en attente de validation.', 'Réservation soumise', 'RESERVATION', 4),
(4, '2026-05-21 14:38:19.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Réunion A est en attente de validation.', 'Réservation soumise', 'RESERVATION', 4),
(5, '2026-05-21 16:59:32.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été validée.', 'Réservation validée ✅', 'RESERVATION', 4),
(6, '2026-05-21 16:59:53.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été annulée par l\'administration.', 'Réservation annulée', 'RESERVATION', 4),
(7, '2026-05-25 13:48:10.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été annulée par l\'administration.', 'Réservation annulée', 'RESERVATION', 4),
(8, '2026-05-28 15:45:08.000000', '2026-05-29 13:15:10.000000', '/admin/reservations', b'1', 'f f a demandé : Salle de Conférence Principale', 'Nouvelle demande de réservation', 'ADMIN', 2),
(9, '2026-05-28 18:50:34.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été annulée par l\'administration.', 'Réservation annulée', 'RESERVATION', 4),
(10, '2026-05-28 18:50:40.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été annulée par l\'administration.', 'Réservation annulée', 'RESERVATION', 4),
(11, '2026-05-28 18:50:54.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été annulée par l\'administration.', 'Réservation annulée', 'RESERVATION', 4),
(12, '2026-05-28 18:54:53.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été annulée par l\'administration.', 'Réservation annulée', 'RESERVATION', 4),
(13, '2026-05-28 18:55:22.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été annulée par l\'administration.', 'Réservation annulée', 'RESERVATION', 4),
(14, '2026-05-29 00:16:51.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été validée.', 'Réservation validée', 'RESERVATION', 4),
(15, '2026-05-29 00:16:54.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été annulée par l\'administration.', 'Réservation annulée', 'RESERVATION', 4),
(16, '2026-05-29 00:17:06.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été refusée. Motif : nn', 'Réservation refusée', 'RESERVATION', 4),
(17, '2026-05-29 00:17:21.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été validée.', 'Réservation validée', 'RESERVATION', 4),
(18, '2026-05-29 19:49:22.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été annulée par l\'administration.', 'Réservation annulée', 'RESERVATION', 4),
(19, '2026-05-29 19:49:40.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été validée.', 'Réservation validée', 'RESERVATION', 4),
(20, '2026-05-29 19:49:48.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été annulée par l\'administration.', 'Réservation annulée', 'RESERVATION', 4),
(21, '2026-06-01 09:21:34.000000', '2026-06-01 09:22:10.000000', '/admin/reservations', b'1', 'h j a demandé : Salle de Conférence Principale', 'Nouvelle demande de réservation', 'ADMIN', 2),
(22, '2026-06-02 10:55:59.000000', '2026-06-02 10:56:40.000000', '/admin/reservations', b'1', 'h g a demandé : Salle de Conférence Principale', 'Nouvelle demande de réservation', 'ADMIN', 2),
(23, '2026-06-04 09:14:31.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été annulée par l\'administration.', 'Réservation annulée', 'RESERVATION', 4),
(24, '2026-06-04 09:14:44.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été validée.', 'Réservation validée', 'RESERVATION', 4),
(25, '2026-06-04 09:39:10.000000', NULL, '/demandeur/mes-reservations', b'0', 'Votre réservation du local Salle de Conférence Principale a été refusée. Motif : f', 'Réservation refusée', 'RESERVATION', 4),
(26, '2026-06-04 11:07:34.000000', '2026-06-04 15:35:51.000000', '/admin/reservations', b'1', 'n n a demandé : Salle de Conférence Principale', 'Nouvelle demande de réservation', 'ADMIN', 2);

-- --------------------------------------------------------

--
-- Structure de la table `poles`
--

CREATE TABLE `poles` (
  `id` bigint(20) NOT NULL,
  `description` text DEFAULT NULL,
  `nom` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `couleur` varchar(255) DEFAULT NULL,
  `ordre` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `poles`
--

INSERT INTO `poles` (`id`, `description`, `nom`, `code`, `couleur`, `ordre`) VALUES
(1, 'Pôle numérique et IA', 'Technologies', '', NULL, NULL),
(2, 'Pôle innovation et startups', 'Entrepreneuriat', '', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `reservations`
--

CREATE TABLE `reservations` (
  `id` bigint(20) NOT NULL,
  `date_debut` datetime(6) DEFAULT NULL,
  `date_demande` datetime(6) DEFAULT NULL,
  `date_fin` datetime(6) DEFAULT NULL,
  `date_rejet` datetime(6) DEFAULT NULL,
  `date_validation` datetime(6) DEFAULT NULL,
  `motif` text DEFAULT NULL,
  `motif_rejet` varchar(255) DEFAULT NULL,
  `nombre_participants` int(11) DEFAULT NULL,
  `prix_total` double DEFAULT NULL,
  `rejet_par` varchar(255) DEFAULT NULL,
  `statut` enum('EN_ATTENTE','VALIDEE','REJETEE','ANNULEE','CONFIRMEE','TERMINEE','ARCHIVEE') DEFAULT NULL,
  `valide_par` varchar(255) DEFAULT NULL,
  `demandeur_id` bigint(20) DEFAULT NULL,
  `local_id` bigint(20) DEFAULT NULL,
  `demandeur_email` varchar(255) DEFAULT NULL,
  `demandeur_matricule` varchar(255) DEFAULT NULL,
  `demandeur_nom` varchar(255) DEFAULT NULL,
  `demandeur_organisme` varchar(255) DEFAULT NULL,
  `demandeur_prenom` varchar(255) DEFAULT NULL,
  `demandeur_telephone` varchar(255) DEFAULT NULL,
  `demandeur_type` enum('INTERNE','EXTERNE') DEFAULT NULL,
  `mode_reglement` varchar(255) DEFAULT NULL,
  `public_recu` varchar(255) DEFAULT NULL,
  `type_evenement` enum('REUNION','FORMATION','CONFERENCE','AUTRE') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `reservations`
--

INSERT INTO `reservations` (`id`, `date_debut`, `date_demande`, `date_fin`, `date_rejet`, `date_validation`, `motif`, `motif_rejet`, `nombre_participants`, `prix_total`, `rejet_par`, `statut`, `valide_par`, `demandeur_id`, `local_id`, `demandeur_email`, `demandeur_matricule`, `demandeur_nom`, `demandeur_organisme`, `demandeur_prenom`, `demandeur_telephone`, `demandeur_type`, `mode_reglement`, `public_recu`, `type_evenement`) VALUES
(2, '2026-05-18 15:00:00.000000', '2026-05-20 17:37:40.000000', '2026-05-18 15:30:00.000000', '2026-06-04 09:39:10.000000', '2026-06-04 15:41:06.000000', '11E', 'f', 1, NULL, 'reservation@uca.ma', 'VALIDEE', 'reservation@uca.ma', 4, 1, 'interne@uca.ma', NULL, 'Demandeur', 'UCA', 'Interne', '', NULL, 'Gratuit', '', 'CONFERENCE'),
(7, '2027-01-19 00:00:00.000000', '2026-06-01 09:21:34.000000', '2027-01-19 00:30:00.000000', NULL, '2026-06-02 10:50:46.000000', '=== DEMANDEUR ===\nNom: h j\nEmail: j@gmail.com\nTéléphone: 0786543289\nType: INTERNE\nOrganisme: uca\nÉtablissement: fst\nVille établissement: kech\nLogo organisme: /uploads/reservations/da098cf9-271c-438f-bee0-7f8ecf577e0e.jpg\n\n=== ÉVÉNEMENT ===\nType d\'événement: Réunion\nPublic reçu: Membres\nParticipants: 5\nÉquipements demandés: Micro pour conférencier\nDescription logistique: jj\n\n=== PROGRAMME / AFFICHE ===\nFichier: /uploads/reservations/a4eaa68c-51b7-4693-a416-a3951c1b8d6c.pdf\nLien: j\n\n=== RÉSERVATION ===\nMotif: hh', NULL, 5, NULL, NULL, 'VALIDEE', 'reservation@uca.ma', NULL, 1, 'j@gmail.com', NULL, 'h', 'uca', 'j', '0786543289', 'INTERNE', NULL, NULL, NULL),
(8, '2026-06-02 10:30:00.000000', '2026-06-02 10:55:59.000000', '2026-06-02 11:00:00.000000', NULL, '2026-06-02 10:56:46.000000', '=== DEMANDEUR ===\nNom: h g\nEmail: h@gmail.com\nTéléphone: 0765423456\nType: INTERNE\nOrganisme: UCA\nÉtablissement: FST\nVille établissement: KECH\n\n=== ÉVÉNEMENT ===\nType d\'événement: Autre: H\nPublic reçu: Membres\nParticipants: 3\nÉquipements demandés: Rallonge électrique\nDescription logistique: H\n\n=== PROGRAMME / AFFICHE ===\nFichier: /uploads/reservations/2b435158-67bd-4a09-94d2-fe12c6439c62.pdf\n\n=== RÉSERVATION ===\nMotif: H', NULL, 3, NULL, NULL, 'VALIDEE', 'reservation@uca.ma', NULL, 1, 'h@gmail.com', NULL, 'h', 'UCA', 'g', '0765423456', 'INTERNE', NULL, NULL, NULL),
(9, '2026-06-04 23:30:00.000000', '2026-06-04 11:07:33.000000', '2026-06-05 00:00:00.000000', '2026-06-04 11:29:41.000000', '2026-06-04 11:27:50.000000', '\nMotif: ICI', 'salle indisponible', 5, NULL, 'reservation@uca.ma', 'EN_ATTENTE', 'reservation@uca.ma', NULL, 1, 'nessaiba1792003@gmail.com', NULL, 'n', 'UCA', 'n', '0762525226', 'INTERNE', 'Gratuit', '', 'AUTRE');

-- --------------------------------------------------------

--
-- Structure de la table `reservation_equipements`
--

CREATE TABLE `reservation_equipements` (
  `reservation_id` bigint(20) NOT NULL,
  `equipement_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` bigint(20) NOT NULL,
  `actif` bit(1) NOT NULL,
  `date_creation` datetime(6) DEFAULT NULL,
  `derniere_connexion` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `matricule` varchar(255) DEFAULT NULL,
  `nom` varchar(255) DEFAULT NULL,
  `organisme` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `prenom` varchar(255) DEFAULT NULL,
  `role` enum('SUPER_ADMIN','DEMANDEUR','ADMIN_RES','ADMIN_EVT','ADMIN_SEC') NOT NULL,
  `telephone` varchar(255) DEFAULT NULL,
  `type` enum('INTERNE','EXTERNE') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `actif`, `date_creation`, `derniere_connexion`, `email`, `matricule`, `nom`, `organisme`, `password`, `prenom`, `role`, `telephone`, `type`) VALUES
(1, b'1', '2026-05-15 10:05:01.000000', '2026-05-15 10:54:43.000000', 'admin@uca.ma', NULL, 'Système', NULL, '$2a$10$utvcazS9u7DwluJOZXGAve/MdD79GARL4QOpz6sdBSwFBNGLKTijm', 'Admin', 'SUPER_ADMIN', NULL, NULL),
(2, b'1', '2026-05-15 10:05:02.000000', '2026-06-05 22:46:29.000000', 'reservation@uca.ma', NULL, 'Admin', NULL, '$2a$10$x3lntt29HGIWdTQO/pFCTOsHzQBckCk2x2xDF6Hv1qT1iZGK498Iy', 'Réservation', 'ADMIN_RES', NULL, NULL),
(3, b'1', '2026-05-15 10:05:02.000000', '2026-06-04 14:34:55.000000', 'evenement@uca.ma', NULL, 'Admin', NULL, '$2a$10$P6Qc2piHNXIbWXpOPrPCdOOF1VcKizRuDIQEOK/A4NooeY3Y5bLRG', 'Événements', 'ADMIN_EVT', NULL, NULL),
(4, b'1', '2026-05-15 10:05:02.000000', '2026-05-23 21:40:52.000000', 'interne@uca.ma', 'UCA-2026-001', 'Demandeur', 'UCA', '$2a$10$zCc/z.swV/K3PfqSyx1e8.B32A/yn6nLGNUZJ81eH4I8Sk851bDqi', 'Interne', 'DEMANDEUR', NULL, 'INTERNE'),
(5, b'1', '2026-05-15 10:05:02.000000', '2026-05-15 12:03:00.000000', 'externe@test.ma', NULL, 'Demandeur', 'Entreprise Partenaire', '$2a$10$XXUs2IXGaNTx69C2YVzRs.f788b75IGRytkmMNA2NVgpoKRVQr.bG', 'Externe', 'DEMANDEUR', NULL, 'EXTERNE'),
(6, b'1', '2026-05-15 15:31:29.000000', NULL, 'h@gmail.com', 'HGI1', 'hZZ', '', '$2a$10$AO9uSKt1jYR.XQCloD20XOZk0DiPL6u94gPT2DUvR6gjcNu5JvvVS', 'hZZ', 'DEMANDEUR', '0929282827', 'INTERNE');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `annonces`
--
ALTER TABLE `annonces`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKob9wii6awtfsm1evmw7v48l9n` (`admin_id`),
  ADD KEY `FK5b5enpk5eq5gkotdug8kl22kv` (`pole_id`);

--
-- Index pour la table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `equipements`
--
ALTER TABLE `equipements`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `evenements`
--
ALTER TABLE `evenements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK2fekysxmqykrtpjfxv6m4vi40` (`admin_id`);

--
-- Index pour la table `evenement_galerie_images`
--
ALTER TABLE `evenement_galerie_images`
  ADD KEY `FKhs56s5xqhj290liusjpoq37wn` (`evenement_id`);

--
-- Index pour la table `inscriptions_evenements`
--
ALTER TABLE `inscriptions_evenements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK8f2wqwkreo8q7dc2joe6ees5u` (`evenement_id`);

--
-- Index pour la table `local_equipements`
--
ALTER TABLE `local_equipements`
  ADD KEY `FK438yrjl9vdfwy0pleyphru1nn` (`local_id`);

--
-- Index pour la table `local_images`
--
ALTER TABLE `local_images`
  ADD KEY `FKc0xrr6xg9d8ld8idja86awaou` (`local_id`);

--
-- Index pour la table `locaux`
--
ALTER TABLE `locaux`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_g25c7ebhb3g3otxpe94tnblxg` (`code`),
  ADD KEY `FKpa84mqr4yyl5ma0ftao35ynxu` (`pole_id`);

--
-- Index pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKsoq6jchv8p6wnydvsnf6ubw4y` (`utilisateur_id`);

--
-- Index pour la table `poles`
--
ALTER TABLE `poles`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK27k23d4kre1cqdhrri8tajcv1` (`demandeur_id`),
  ADD KEY `FKr9lwbum9jddtwj8g9ws4hri6f` (`local_id`);

--
-- Index pour la table `reservation_equipements`
--
ALTER TABLE `reservation_equipements`
  ADD KEY `FKnxaall28q48eg44tsfbwbg4gg` (`equipement_id`),
  ADD KEY `FK5rnus2woq0iq3eoy2wv830jqa` (`reservation_id`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_6ldvumu3hqvnmmxy1b6lsxwqy` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `annonces`
--
ALTER TABLE `annonces`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `equipements`
--
ALTER TABLE `equipements`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `evenements`
--
ALTER TABLE `evenements`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `inscriptions_evenements`
--
ALTER TABLE `inscriptions_evenements`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `locaux`
--
ALTER TABLE `locaux`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT pour la table `poles`
--
ALTER TABLE `poles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `annonces`
--
ALTER TABLE `annonces`
  ADD CONSTRAINT `FK5b5enpk5eq5gkotdug8kl22kv` FOREIGN KEY (`pole_id`) REFERENCES `poles` (`id`),
  ADD CONSTRAINT `FKob9wii6awtfsm1evmw7v48l9n` FOREIGN KEY (`admin_id`) REFERENCES `utilisateurs` (`id`);

--
-- Contraintes pour la table `evenements`
--
ALTER TABLE `evenements`
  ADD CONSTRAINT `FK2fekysxmqykrtpjfxv6m4vi40` FOREIGN KEY (`admin_id`) REFERENCES `utilisateurs` (`id`);

--
-- Contraintes pour la table `evenement_galerie_images`
--
ALTER TABLE `evenement_galerie_images`
  ADD CONSTRAINT `FKhs56s5xqhj290liusjpoq37wn` FOREIGN KEY (`evenement_id`) REFERENCES `evenements` (`id`);

--
-- Contraintes pour la table `inscriptions_evenements`
--
ALTER TABLE `inscriptions_evenements`
  ADD CONSTRAINT `FK8f2wqwkreo8q7dc2joe6ees5u` FOREIGN KEY (`evenement_id`) REFERENCES `evenements` (`id`);

--
-- Contraintes pour la table `local_equipements`
--
ALTER TABLE `local_equipements`
  ADD CONSTRAINT `FK438yrjl9vdfwy0pleyphru1nn` FOREIGN KEY (`local_id`) REFERENCES `locaux` (`id`);

--
-- Contraintes pour la table `local_images`
--
ALTER TABLE `local_images`
  ADD CONSTRAINT `FKc0xrr6xg9d8ld8idja86awaou` FOREIGN KEY (`local_id`) REFERENCES `locaux` (`id`);

--
-- Contraintes pour la table `locaux`
--
ALTER TABLE `locaux`
  ADD CONSTRAINT `FKpa84mqr4yyl5ma0ftao35ynxu` FOREIGN KEY (`pole_id`) REFERENCES `poles` (`id`);

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `FKsoq6jchv8p6wnydvsnf6ubw4y` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`);

--
-- Contraintes pour la table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `FK27k23d4kre1cqdhrri8tajcv1` FOREIGN KEY (`demandeur_id`) REFERENCES `utilisateurs` (`id`),
  ADD CONSTRAINT `FKr9lwbum9jddtwj8g9ws4hri6f` FOREIGN KEY (`local_id`) REFERENCES `locaux` (`id`);

--
-- Contraintes pour la table `reservation_equipements`
--
ALTER TABLE `reservation_equipements`
  ADD CONSTRAINT `FK5rnus2woq0iq3eoy2wv830jqa` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`),
  ADD CONSTRAINT `FKnxaall28q48eg44tsfbwbg4gg` FOREIGN KEY (`equipement_id`) REFERENCES `equipements` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : dim. 21 déc. 2025 à 15:52
-- Version du serveur : 10.4.24-MariaDB
-- Version de PHP : 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `projet_soutenances_simplifie`
--

-- --------------------------------------------------------

--
-- Structure de la table `evaluations`
--
-- CORRECTION: Ajout de soutenance_id pour lier correctement jury -> soutenance -> rapport
--

CREATE TABLE `evaluations` (
  `id` bigint(20) NOT NULL,
  `soutenance_id` bigint(20) NOT NULL,
  `jury_id` bigint(20) NOT NULL,
  `statut` varchar(20) DEFAULT 'pending',
  `final_note` float DEFAULT NULL,
  `global_comment` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `evaluations`
-- CORRECTION: Une seule évaluation par jury par soutenance
--

INSERT INTO `evaluations` (`id`, `soutenance_id`, `jury_id`, `statut`, `final_note`, `global_comment`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'pending', NULL, NULL, '2025-12-21 13:50:07', '2025-12-21 13:50:07');

-- --------------------------------------------------------

--
-- Structure de la table `evaluation_criteria`
--

CREATE TABLE `evaluation_criteria` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `max_score` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `evaluation_criteria`
--

INSERT INTO `evaluation_criteria` (`id`, `name`, `description`, `max_score`) VALUES
(1, 'Qualité du rapport', 'Structure, orthographe, clarté', 5),
(2, 'Présentation orale', 'Aisance, clarté, temps', 5),
(3, 'Maîtrise du sujet', 'Réponses aux questions, profondeur', 5),
(4, 'Travail réalisé', 'Pertinence, complexité, résultats', 5);

-- --------------------------------------------------------

--
-- Structure de la table `evaluation_grades`
--

CREATE TABLE `evaluation_grades` (
  `id` bigint(20) NOT NULL,
  `evaluation_id` bigint(20) NOT NULL,
  `criterion_id` int(11) NOT NULL,
  `score` float DEFAULT NULL,
  `comment` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `juries`
--

CREATE TABLE `juries` (
  `id` bigint(20) NOT NULL,
  `soutenance_id` bigint(20) NOT NULL,
  `teacher_id` bigint(20) NOT NULL,
  `role` enum('president','member','supervisor') DEFAULT 'member'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `juries`
--

INSERT INTO `juries` (`id`, `soutenance_id`, `teacher_id`, `role`) VALUES
(1, 1, 1, 'president');

-- --------------------------------------------------------

--
-- Structure de la table `plagiat_analyses`
--

CREATE TABLE `plagiat_analyses` (
  `id` bigint(20) NOT NULL,
  `rapport_id` int(11) NOT NULL,
  `similarity_score` float DEFAULT 0.0,
  `originality_score` float DEFAULT 100.0,
  `risk_level` varchar(50) DEFAULT 'none',
  `total_matches` int(11) DEFAULT 0,
  `sources_count` int(11) DEFAULT 0,
  `status` varchar(50) DEFAULT 'pending',
  `error_message` text DEFAULT NULL,
  `analyzed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `ai_score` float DEFAULT 0.0,
  `chunks_analyzed` int(11) DEFAULT 0,
  `chunks_with_matches` int(11) DEFAULT 0,
  `word_count` int(11) DEFAULT 0,
  `unique_words` int(11) DEFAULT 0,
  `readability_score` float DEFAULT 0.0,
  `detection_time` float DEFAULT 0.0,
  `character_count` int(11) DEFAULT 0,
  `paragraph_count` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `plagiat_analyses`
--

INSERT INTO `plagiat_analyses` (`id`, `rapport_id`, `similarity_score`, `originality_score`, `risk_level`, `total_matches`, `sources_count`, `status`, `error_message`, `analyzed_at`, `created_at`, `ai_score`, `chunks_analyzed`, `chunks_with_matches`, `word_count`, `unique_words`, `readability_score`, `detection_time`, `character_count`, `paragraph_count`) VALUES
(1, 1, 25.5, 74.5, 'medium', 5, 3, 'completed', NULL, '2025-12-21 13:53:59', '2025-12-21 13:53:59', 15, 50, 5, 135, 101, 7.35, 2.5, 1034, 6);

-- --------------------------------------------------------

--
-- Structure de la table `plagiat_matches`
--

CREATE TABLE `plagiat_matches` (
  `id` bigint(20) NOT NULL,
  `analysis_id` bigint(20) NOT NULL,
  `text` text DEFAULT NULL,
  `matched_text` text DEFAULT NULL,
  `original_text` text DEFAULT NULL,
  `source_url` varchar(500) DEFAULT NULL,
  `source` varchar(100) DEFAULT 'web',
  `similarity` float DEFAULT NULL,
  `score` float DEFAULT NULL,
  `page` int(11) DEFAULT NULL,
  `chunk_index` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `rapports`
--

CREATE TABLE `rapports` (
  `id` int(11) NOT NULL,
  `auteur_id` bigint(20) NOT NULL,
  `titre` varchar(255) DEFAULT NULL,
  `filename` varchar(200) NOT NULL,
  `storage_path` varchar(300) NOT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `rapports`
--

INSERT INTO `rapports` (`id`, `auteur_id`, `titre`, `filename`, `storage_path`, `status`, `created_at`) VALUES
(1, 2, 'rapport', '270efdc3b8c64f0c902f1d6633a93f1a_rapporte_de_erpEnsiasd.pdf', 'C:\\Users\\21261\\python-project-\\Back-end\\app\\uploads\\rapport_demo.txt', 'pending', '2025-12-21 12:54:09'),
(3, 3, 'rapport de reda', '18dc6e1eb0c348f9a511c3f15eecd657_Rapport_de_stage.pdf', 'C:\\Users\\21261\\python-project-\\Back-end\\app\\uploads\\18dc6e1eb0c348f9a511c3f15eecd657_Rapport_de_stage.pdf', 'pending', '2025-12-21 14:33:31');

-- --------------------------------------------------------

--
-- Structure de la table `salles`
--

CREATE TABLE `salles` (
  `id` bigint(20) NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `soutenances`
--

CREATE TABLE `soutenances` (
  `id` bigint(20) NOT NULL,
  `student_id` bigint(20) NOT NULL,
  `salle_id` bigint(20) DEFAULT NULL,
  `rapport_id` int(11) DEFAULT NULL,
  `date_soutenance` date NOT NULL,
  `heure_debut` time NOT NULL,
  `duree_minutes` int(11) DEFAULT 15,
  `statut` enum('planned','done','cancelled') DEFAULT 'planned',
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `soutenances`
--

INSERT INTO `soutenances` (`id`, `student_id`, `salle_id`, `rapport_id`, `date_soutenance`, `heure_debut`, `duree_minutes`, `statut`, `created_at`) VALUES
(1, 2, NULL, 1, '2025-12-21', '14:00:00', 15, 'planned', '2025-12-21 13:48:55');

-- --------------------------------------------------------

--
-- Structure de la table `students`
--

CREATE TABLE `students` (
  `user_id` bigint(20) NOT NULL,
  `cin` varchar(20) NOT NULL,
  `cne` varchar(20) NOT NULL,
  `tel` varchar(20) DEFAULT NULL,
  `filiere` varchar(100) DEFAULT NULL,
  `niveau` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `students`
--

INSERT INTO `students` (`user_id`, `cin`, `cne`, `tel`, `filiere`, `niveau`) VALUES
(2, 'x234', 'x3556', '0674547234', 'SITCN', '3ème année'),
(3, 'p34465214', 'p56892403', '7792392945', 'SITCN', '1ère année');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `prenom` varchar(150) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(200) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','teacher','jury','admin','chef') NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `prenom`, `name`, `email`, `password_hash`, `role`, `created_at`, `updated_at`) VALUES
(1, 'reda', 'reda', 'reda@gmail.com', 'scrypt:32768:8:1$Y1smxDDaKme4GroB$78628d3bf7add2b724d1f1c9849e0101839f49be8f56d3e8804d8eb632793204d4829ec9f92a9a588e9cd1b62a86beb800ffdf331f3a10f7e30f80999b55d34d', 'teacher', '2025-12-21 13:50:50', NULL),
(2, 'med', 'med reda', 'med@edu.uiz.ac.ma', 'scrypt:32768:8:1$oKk95YtVjbIpdq74$8909f6be4bfb90ccbce00bd319a100934a72e9a44169ba918b4e64d82ee4b008484288c6a911d69f309fab2c818ad6a8193d296fa11ca338e121d56b925d5b6e', 'student', '2025-12-21 13:53:37', NULL),
(3, 'reda', 'Reda', 'reda@edu.uiz.ac.ma', 'scrypt:32768:8:1$NXXHNvASeW4miZcL$0aa84c268e00dd2ceae8c746085d981273757417fa370b4572a097ecb8d3ed36a103add979c70ec9d0e8a7c939bf9274648592a3621bcd84e7e72fca8e03fc17', 'student', '2025-12-21 15:32:57', NULL);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_evaluation_per_jury_soutenance` (`soutenance_id`, `jury_id`),
  ADD KEY `jury_id` (`jury_id`),
  ADD KEY `soutenance_id` (`soutenance_id`);

--
-- Index pour la table `evaluation_criteria`
--
ALTER TABLE `evaluation_criteria`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `evaluation_grades`
--
ALTER TABLE `evaluation_grades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `evaluation_id` (`evaluation_id`),
  ADD KEY `criterion_id` (`criterion_id`);

--
-- Index pour la table `juries`
--
ALTER TABLE `juries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_jury_per_soutenance` (`soutenance_id`, `teacher_id`),
  ADD KEY `soutenance_id` (`soutenance_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Index pour la table `plagiat_analyses`
--
ALTER TABLE `plagiat_analyses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_analysis_per_rapport` (`rapport_id`),
  ADD KEY `rapport_id` (`rapport_id`);

--
-- Index pour la table `plagiat_matches`
--
ALTER TABLE `plagiat_matches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `analysis_id` (`analysis_id`);

--
-- Index pour la table `rapports`
--
ALTER TABLE `rapports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `auteur_id` (`auteur_id`);

--
-- Index pour la table `salles`
--
ALTER TABLE `salles`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `soutenances`
--
ALTER TABLE `soutenances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_rapport_per_soutenance` (`rapport_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `salle_id` (`salle_id`);

--
-- Index pour la table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `cin` (`cin`),
  ADD UNIQUE KEY `cne` (`cne`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `evaluations`
--
ALTER TABLE `evaluations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `evaluation_criteria`
--
ALTER TABLE `evaluation_criteria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `evaluation_grades`
--
ALTER TABLE `evaluation_grades`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `juries`
--
ALTER TABLE `juries`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `plagiat_analyses`
--
ALTER TABLE `plagiat_analyses`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `plagiat_matches`
--
ALTER TABLE `plagiat_matches`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `rapports`
--
ALTER TABLE `rapports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `salles`
--
ALTER TABLE `salles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `soutenances`
--
ALTER TABLE `soutenances`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `evaluations`
--
ALTER TABLE `evaluations`
  ADD CONSTRAINT `evaluations_ibfk_1` FOREIGN KEY (`soutenance_id`) REFERENCES `soutenances` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `evaluations_ibfk_2` FOREIGN KEY (`jury_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `evaluation_grades`
--
ALTER TABLE `evaluation_grades`
  ADD CONSTRAINT `evaluation_grades_ibfk_1` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `evaluation_grades_ibfk_2` FOREIGN KEY (`criterion_id`) REFERENCES `evaluation_criteria` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `juries`
--
ALTER TABLE `juries`
  ADD CONSTRAINT `juries_ibfk_1` FOREIGN KEY (`soutenance_id`) REFERENCES `soutenances` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `juries_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `plagiat_analyses`
--
ALTER TABLE `plagiat_analyses`
  ADD CONSTRAINT `plagiat_analyses_ibfk_1` FOREIGN KEY (`rapport_id`) REFERENCES `rapports` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `plagiat_matches`
--
ALTER TABLE `plagiat_matches`
  ADD CONSTRAINT `plagiat_matches_ibfk_1` FOREIGN KEY (`analysis_id`) REFERENCES `plagiat_analyses` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `rapports`
--
ALTER TABLE `rapports`
  ADD CONSTRAINT `rapports_ibfk_1` FOREIGN KEY (`auteur_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `soutenances`
--
ALTER TABLE `soutenances`
  ADD CONSTRAINT `soutenances_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `soutenances_ibfk_2` FOREIGN KEY (`salle_id`) REFERENCES `salles` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `soutenances_ibfk_3` FOREIGN KEY (`rapport_id`) REFERENCES `rapports` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

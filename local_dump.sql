CREATE DATABASE IF NOT EXISTS `ecole2026` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ecole2026`;

DROP TABLE IF EXISTS `ActionsLog`;
CREATE TABLE `ActionsLog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(120) DEFAULT NULL,
  `userLabel` varchar(180) DEFAULT NULL,
  `action` varchar(60) NOT NULL,
  `targetType` varchar(60) DEFAULT NULL,
  `targetId` varchar(120) DEFAULT NULL,
  `details` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `ActionsLog` (`id`, `userId`, `userLabel`, `action`, `targetType`, `targetId`, `details`, `created_at`) VALUES 
(1, '1', 'admin@ecole.fr', 'reactivate', 'Eleve', '2', NULL, '2026-05-18 03:10:06'),
(2, '1', 'admin@ecole.fr', 'update', 'Inscription', '1', '{"idFrequente":1,"matricule":1,"idSalle":1,"idAcademi":1,"eleveNom":"Atangana","elevePrenom":"paul","classe":"SIL","salle":"Salle 1","annee":"2023-2024"}', '2026-05-18 06:54:16'),
(3, '1', 'admin@ecole.fr', 'create', 'Inscription', '2', '{"idFrequente":2,"matricule":1,"idSalle":2,"idAcademi":2,"eleveNom":"Atangana","elevePrenom":"paul","classe":"CP","salle":"Salle A2","annee":"2024-2025"}', '2026-05-18 06:54:43'),
(4, '1', 'admin@ecole.fr', 'update', 'Inscription', '2', '{"idFrequente":2,"matricule":1,"idSalle":2,"idAcademi":2,"eleveNom":"Atangana","elevePrenom":"paul","classe":"CP","salle":"Salle A2","annee":"2024-2025"}', '2026-05-18 06:54:57'),
(5, '1000', 'admin', 'update', 'Eleve', '8', '{"matricule":8,"nom":"roland","prenom":"jude ","dateNaissance":"2014-12-30T23:00:00.000Z","lieuNaissance":"Douala","sexe":1,"langue":"NON DEFINI","photoURL":"INDEFINI","actif":0,"idVilleNaissance":1,"idAdmin":1,"created_at":"2026-05-19T09:23:49.000Z","isDelete":0,"salle":"Salle 8","classe":"Classe 8"}', '2026-05-19 22:25:36'),
(6, '1000', 'admin', 'reactivate', 'Eleve', '8', NULL, '2026-05-19 22:25:45'),
(7, '1000', 'admin', 'create', 'Inscription', '11', '{"idFrequente":11,"matricule":8,"idSalle":1,"idAcademi":1,"eleveNom":"roland","elevePrenom":"jude ","classe":"Classe 1","salle":"Salle 1","annee":"2020-2021"}', '2026-05-19 22:34:22'),
(8, '1000', 'admin', 'update', 'Eleve', '20260004', '{"matricule":20260004,"nom":"HELLO","prenom":"HELLO","dateNaissance":"2014-12-30T23:00:00.000Z","lieuNaissance":"Douala","sexe":0,"langue":"NON DEFINI","photoURL":"INDEFINI","actif":0,"idVilleNaissance":1,"idAdmin":1,"created_at":"2026-05-19T09:23:46.000Z","isDelete":0,"salle":"Salle 4","classe":"Classe 4"}', '2026-05-20 08:08:16'),
(9, '1000', 'admin', 'create', 'Inscription', '12', '{"idFrequente":12,"matricule":9,"idSalle":1,"idAcademi":3,"eleveNom":"NomEleve9","elevePrenom":"PrenomEleve9","classe":"Classe 1","salle":"Salle 1","annee":"2022-2023"}', '2026-05-20 08:33:53'),
(10, '22', 'jude', 'create', 'Inscription', '161', '{"idFrequente":161,"matricule":15290484,"idSalle":11,"idAcademi":5,"eleveNom":"miguel","elevePrenom":"andy","classe":"SIL","salle":"A","annee":"2024-2025"}', '2026-07-08 12:32:50'),
(11, '22', 'jude', 'create', 'Inscription', '162', '{"idFrequente":162,"matricule":15290484,"idSalle":11,"idAcademi":11,"eleveNom":"miguel","elevePrenom":"andy","classe":"SIL","salle":"A","annee":"2025-2026"}', '2026-07-08 12:42:35'),
(12, '22', 'jude', 'create', 'Inscription', '163', '{"idFrequente":163,"matricule":20260009,"idSalle":15,"idAcademi":5,"eleveNom":"eleve","elevePrenom":"bon","classe":"CM2","salle":"A","annee":"2024-2025"}', '2026-07-08 12:57:19'),
(13, '22', 'jude', 'create', 'Inscription', '164', '{"idFrequente":164,"matricule":15290484,"idSalle":21,"idAcademi":1,"eleveNom":"miguel","elevePrenom":"andy","classe":"cp 2","salle":"s1","annee":"2020-2021"}', '2026-07-08 13:04:57'),
(14, '22', 'jude', 'create', 'Inscription', '219', '{"idFrequente":219,"matricule":"28078493","idSalle":15,"idAcademi":11,"eleveNom":"klaus","elevePrenom":"miguel","classe":"CM2","salle":"A","annee":"2025-2026"}', '2026-07-08 15:30:52'),
(15, '22', 'jude', 'delete', 'Inscription', '192', NULL, '2026-07-08 15:34:42'),
(16, '22', 'jude', 'delete', 'Inscription', '160', NULL, '2026-07-08 15:34:56'),
(17, '22', 'jude', 'delete', 'Inscription', '162', NULL, '2026-07-08 15:35:05'),
(18, '22', 'jude', 'delete', 'Inscription', '165', NULL, '2026-07-08 15:35:22'),
(19, '22', 'jude', 'delete', 'Inscription', '219', NULL, '2026-07-08 15:35:35'),
(20, '22', 'jude', 'delete', 'Inscription', '218', NULL, '2026-07-08 15:35:44'),
(21, '22', 'jude', 'delete', 'Inscription', '142', NULL, '2026-07-08 15:36:13'),
(22, '22', 'jude', 'delete', 'Inscription', '145', NULL, '2026-07-08 15:36:24'),
(23, '22', 'jude', 'delete', 'Inscription', '198', NULL, '2026-07-08 15:36:28'),
(24, '22', 'jude', 'delete', 'Inscription', '143', NULL, '2026-07-08 15:36:39'),
(25, '22', 'jude', 'delete', 'Inscription', '169', NULL, '2026-07-08 15:36:47'),
(26, '22', 'jude', 'delete', 'Inscription', '206', NULL, '2026-07-08 15:36:57'),
(27, '22', 'jude', 'delete', 'Inscription', '205', NULL, '2026-07-08 15:37:03'),
(28, '22', 'jude', 'delete', 'Inscription', '207', NULL, '2026-07-08 15:37:35'),
(29, '22', 'jude', 'delete', 'Inscription', '177', NULL, '2026-07-08 15:37:54'),
(30, '22', 'jude', 'delete', 'Inscription', '203', NULL, '2026-07-08 15:38:12'),
(31, '22', 'jude', 'delete', 'Inscription', '208', NULL, '2026-07-08 15:38:48'),
(32, '22', 'jude', 'delete', 'Inscription', '147', NULL, '2026-07-08 15:39:34'),
(33, '22', 'jude', 'delete', 'Inscription', '168', NULL, '2026-07-08 15:39:48'),
(34, '22', 'jude', 'delete', 'Inscription', '167', NULL, '2026-07-08 15:40:00'),
(35, '22', 'jude', 'delete', 'Inscription', '194', NULL, '2026-07-08 15:40:11'),
(36, '22', 'jude', 'delete', 'Inscription', '144', NULL, '2026-07-08 15:40:31'),
(37, '22', 'jude', 'delete', 'Inscription', '170', NULL, '2026-07-08 15:40:38'),
(38, '22', 'jude', 'delete', 'Inscription', '193', NULL, '2026-07-08 15:40:54'),
(39, '22', 'jude', 'delete', 'Inscription', '140', NULL, '2026-07-08 15:41:41'),
(40, '22', 'jude', 'delete', 'Inscription', '175', NULL, '2026-07-08 15:41:56'),
(41, '22', 'jude', 'create', 'Inscription', '220', '{"idFrequente":220,"matricule":"28078493","idSalle":15,"idAcademi":11,"eleveNom":"klaus","elevePrenom":"miguel","classe":"CM2","salle":"A","annee":"2025-2026"}', '2026-07-08 15:43:23'),
(42, '22', 'jude', 'create', 'Inscription', '223', '{"idFrequente":223,"matricule":"28078493","idSalle":30,"idAcademi":11,"eleveNom":"klaus","elevePrenom":"miguel","classe":"CM2","salle":"A","annee":"2025-2026"}', '2026-07-08 17:42:50');

DROP TABLE IF EXISTS `Admin`;
CREATE TABLE `Admin` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `typeAdmin` tinyint NOT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `isDelete` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `langue` varchar(10) NOT NULL DEFAULT 'fr',
  `nom` varchar(100) NOT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `alanyaID` varchar(15) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Admin` (`ID`, `username`, `password`, `typeAdmin`, `actif`, `isDelete`, `createdAt`, `updatedAt`, `langue`, `nom`, `mobile`, `alanyaID`, `created_at`) VALUES 
(1, 'admin_root', '$2a$12$VxKWf8A7hz2omtjG14ySTOXfYCTqF4V8dHR2zXlNzffnv89570QSq', 0, 1, 0, '2026-06-16 07:09:20', '2026-07-08 06:05:41', 'fr', '', NULL, NULL, NULL),
(2, 'admin_insc', '$2a$12$EvJF2nKoALGL.tXUp2j7OehjWJR/ba54VjOIS9GQ9fgfr0CR7UK5y', 1, 1, 0, '2026-06-16 07:09:21', '2026-07-08 06:05:45', 'fr', '', NULL, NULL, NULL),
(3, 'admin_scol', '$2a$12$GIvVX/TK0ef/y0BeYr7b1.WiDUTgTY417A1A2v.FcEnQ470mlFmVa', 2, 1, 0, '2026-06-16 07:09:22', '2026-07-08 06:05:48', 'fr', '', NULL, NULL, NULL),
(4, 'admin_fond', '$2a$12$fiSOzuYadwpc/ibMIV.6tuXpdM/rWcUzn.WR9ogIiBALzGrM6/G0.', 3, 1, 0, '2026-06-16 07:09:23', '2026-07-08 06:05:53', 'fr', '', NULL, NULL, NULL),
(5, 'admin_dir', '$2a$12$GUc2GVrD7DuGBopA2mY23O.kqCHY.IL5woZCQVMSyMsgtjUJWad7q', 4, 1, 0, '2026-06-16 07:09:24', '2026-07-08 06:05:55', 'en', '', NULL, NULL, NULL),
(15, NULL, '$2b$12$poCxhGq/jiB1xBMJuoNkheBeK9YPtfPLPM64RagrwPY5M4BtZBogO', 1, 1, 0, '2026-06-22 21:08:29', '2026-06-22 21:08:29', 'fr', '', NULL, NULL, NULL),
(16, NULL, '$2b$12$N0xW9nPgk5k.ykxQRKM1Q.FZXAg2DSTimzApKiZd8mUHLItKgIAVW', 2, 1, 0, '2026-06-22 21:08:29', '2026-06-22 21:08:29', 'fr', '', NULL, NULL, NULL),
(17, NULL, '$2b$12$Bw7aRCCGswTgjFJKmqFlMePVIDDxYAGxd42BlEDagWc/0nn7r2EwS', 3, 1, 0, '2026-06-22 21:08:29', '2026-06-22 21:08:29', 'fr', '', NULL, NULL, NULL),
(22, 'jude', '$2b$10$IVhVQdnt6fy4rrqZCpXBkOtbEWi7mAClZWLcPtPOXF5W./8imhDYi', 2, 1, 0, '2026-07-08 11:14:02', '2026-07-08 11:14:02', 'fr', 'Jude', '', NULL, '2026-07-08 11:14:02');

DROP TABLE IF EXISTS `AnneeAcademique`;
CREATE TABLE `AnneeAcademique` (
  `idAnnee` int unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(200) NOT NULL,
  `periode` varchar(255) NOT NULL,
  `created_at` date NOT NULL,
  `idAdmin` int unsigned NOT NULL,
  `isDelete` tinyint(1) DEFAULT '0',
  `actif` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idAnnee`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `AnneeAcademique` (`idAnnee`, `libelle`, `periode`, `created_at`, `idAdmin`, `isDelete`, `actif`) VALUES 
(1, '2020-2021', 'Trimestre 1', '2026-05-18 23:00:00', 1, 0, 0),
(2, '2021-2022', 'Trimestre 1', '2026-05-18 23:00:00', 1, 0, 0),
(3, '2022-2023', 'Trimestre 1', '2026-05-18 23:00:00', 1, 0, 0),
(4, '2023-2024', 'Trimestre 1', '2026-05-18 23:00:00', 1, 0, 0),
(5, '2024-2025', 'Trimestre 1', '2026-05-18 23:00:00', 1, 0, 0),
(6, '2025-2026', 'Trimestre 1', '2026-05-18 23:00:00', 1, 0, 1),
(7, '2026-2027', 'Trimestre 1', '2026-05-18 23:00:00', 1, 0, 0),
(8, '2027-2028', 'Trimestre 1', '2026-05-18 23:00:00', 1, 0, 0),
(9, '2028-2029', 'Trimestre 1', '2026-05-18 23:00:00', 1, 0, 0),
(10, '2029-2030', 'Trimestre 1', '2026-05-18 23:00:00', 1, 0, 0),
(17, '2019-2020', '', '2026-07-07 23:00:00', 1, 0, 0),
(18, '2019-2020', '', '2026-07-07 23:00:00', 1, 1, 0),
(20, '2031-2032', '', '2026-07-07 23:00:00', 1, 0, 0),
(21, '2019-2020', '', '2026-07-07 23:00:00', 1, 1, 0);

DROP TABLE IF EXISTS `Bulletins`;
CREATE TABLE `Bulletins` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `matricule` int unsigned NOT NULL,
  `idTrimestre` int unsigned NOT NULL,
  `moyenne` float DEFAULT '0',
  `rang` int unsigned DEFAULT NULL,
  `valide` tinyint DEFAULT '0',
  `urlPdf` varchar(255) DEFAULT NULL,
  `generatedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
DROP TABLE IF EXISTS `ChatMessage`;
CREATE TABLE `ChatMessage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idConv` int NOT NULL,
  `senderId` varchar(100) DEFAULT NULL,
  `senderNom` varchar(255) DEFAULT NULL,
  `content` text,
  `status` enum('sent','delivered','read') DEFAULT 'sent',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idConv` (`idConv`),
  CONSTRAINT `ChatMessage_ibfk_1` FOREIGN KEY (`idConv`) REFERENCES `Conversation` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
DROP TABLE IF EXISTS `Classe`;
CREATE TABLE `Classe` (
  `idClasse` int unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(100) NOT NULL DEFAULT 'INDEFINI',
  `idCycle` int unsigned NOT NULL,
  `titulaire` int DEFAULT NULL,
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idClasse`),
  KEY `Classe_idCycle_Cycle_idCycle_fk` (`idCycle`),
  CONSTRAINT `associer` FOREIGN KEY (`idCycle`) REFERENCES `Cycle` (`idCycle`) ON UPDATE CASCADE,
  CONSTRAINT `Classe_idCycle_Cycle_idCycle_fk` FOREIGN KEY (`idCycle`) REFERENCES `Cycle` (`idCycle`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Classe` (`idClasse`, `libelle`, `idCycle`, `titulaire`, `idAdmin`, `created_at`, `isDelete`) VALUES 
(33, '1ère Année A', 11, NULL, 1, '2026-06-22 21:08:29', 1),
(34, '2ème Année B', 11, NULL, 1, '2026-06-22 21:08:29', 1),
(36, 'cp 2', 11, NULL, 22, '2026-07-08 12:12:27', 1),
(47, 'SIL', 21, NULL, 1, '2026-07-08 16:40:49', 0),
(57, 'CP', 21, 1, 1, '2026-07-08 16:51:23', 0),
(58, 'CE1', 21, NULL, 1, '2026-07-08 16:51:23', 0),
(59, 'CE2', 21, NULL, 1, '2026-07-08 16:51:24', 0),
(60, 'CM1', 21, NULL, 1, '2026-07-08 16:51:24', 0),
(61, 'CM2', 21, NULL, 1, '2026-07-08 16:51:24', 0),
(62, 'Class 1', 22, NULL, 1, '2026-07-08 16:51:25', 0),
(63, 'Class 2', 22, NULL, 1, '2026-07-08 16:51:25', 0),
(64, 'Class 3', 22, NULL, 1, '2026-07-08 16:51:25', 0),
(65, 'Class 4', 22, NULL, 1, '2026-07-08 16:51:26', 0),
(66, 'Class 5', 22, NULL, 1, '2026-07-08 16:51:26', 0),
(67, 'Class 6', 22, NULL, 1, '2026-07-08 16:51:26', 0);

DROP TABLE IF EXISTS `ConvParticipant`;
CREATE TABLE `ConvParticipant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idConv` int NOT NULL,
  `userId` varchar(100) NOT NULL,
  `userType` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idConv` (`idConv`),
  CONSTRAINT `ConvParticipant_ibfk_1` FOREIGN KEY (`idConv`) REFERENCES `Conversation` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
DROP TABLE IF EXISTS `Conversation`;
CREATE TABLE `Conversation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('direct','group') NOT NULL,
  `nom` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
DROP TABLE IF EXISTS `Cours`;
CREATE TABLE `Cours` (
  `idCours` int unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) NOT NULL,
  `coefficient` float unsigned NOT NULL DEFAULT '1',
  `description` text,
  `idClasse` int unsigned NOT NULL,
  `actif` tinyint unsigned NOT NULL DEFAULT '1',
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  `note` float DEFAULT '1',
  `idEnseignant` int DEFAULT NULL,
  `heures` int DEFAULT NULL,
  `idSalle` int DEFAULT NULL,
  `couleur` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`idCours`),
  KEY `lier` (`idClasse`),
  CONSTRAINT `lier` FOREIGN KEY (`idClasse`) REFERENCES `Classe` (`idClasse`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Cours` (`idCours`, `libelle`, `coefficient`, `description`, `idClasse`, `actif`, `idAdmin`, `created_at`, `isDelete`, `note`, `idEnseignant`, `heures`, `idSalle`, `couleur`) VALUES 
(29, 'English', 3, '', 47, 1, 1, '2026-07-08 17:27:04', 0, 1, NULL, NULL, NULL, NULL),
(30, 'Math', 1, '', 62, 1, 1, '2026-07-08 17:29:04', 0, 1, NULL, NULL, NULL, NULL),
(31, 'Anglais', 1, '', 57, 1, 1, '2026-07-08 17:31:37', 0, 1, NULL, NULL, NULL, NULL),
(32, 'Science', 1, '', 57, 1, 1, '2026-07-08 17:33:42', 0, 1, 17, NULL, NULL, NULL),
(33, 'histoire', 1, '', 62, 1, 22, '2026-07-08 23:57:24', 0, 1, 53, 1, 21, NULL);

DROP TABLE IF EXISTS `Cycle`;
CREATE TABLE `Cycle` (
  `idCycle` int unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) NOT NULL,
  `description` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `idAdmin` int unsigned NOT NULL,
  `created` datetime NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idCycle`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Cycle` (`idCycle`, `libelle`, `description`, `idAdmin`, `created`, `isDelete`) VALUES 
(11, 'maternelle anglophone', 'petite, moyenne et grande section', 1005, '2026-07-08 15:24:16', 1),
(12, 'maternelle francophone', 'petite, moyenne et grande section', 1005, '2026-07-08 15:24:16', 1),
(13, 'primaire francophone', 'de la SIL au CM2', 1005, '2026-07-08 15:24:16', 1),
(14, 'primaire anglophone', 'de class 1 à class 6', 1005, '2026-07-08 15:24:16', 1),
(15, 'Cycle 1', 'Cycle primaire', 1, '2026-07-08 15:24:16', 1),
(16, 'Cycle 2', 'Cycle secondaire', 1, '2026-07-08 15:24:16', 1),
(17, 'Primaire', 'Cycle primaire (1ère à 5ème)', 1, '2026-07-08 15:24:16', 1),
(18, 'Moyen', 'Cycle moyen (6ème à 9ème)', 1, '2026-07-08 15:24:16', 1),
(19, 'Secondaire', 'Cycle secondaire', 1, '2026-07-08 15:24:16', 1),
(20, 'Cycle Test', '', 15, '2026-07-08 15:24:16', 1),
(21, 'Cycle Francophone', 'Cycle francophone', 1, '2026-07-08 15:24:14', 0),
(22, 'Cycle Anglophone', 'Cycle anglophone', 1, '2026-07-08 15:24:15', 0),
(23, 'TestCycle', '', 1, '2026-07-08 15:29:04', 1);

DROP TABLE IF EXISTS `Discipline`;
CREATE TABLE `Discipline` (
  `ID` int unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `points` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID` DESC)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Discipline` (`ID`, `libelle`, `points`) VALUES 
(29, 'd', 1),
(28, 'd', 1),
(27, 'dfd', 2),
(26, 'Retard', 2),
(25, 'Retard', 2),
(24, 'Retard', 2),
(23, 'punition', 2),
(22, 'Test discipline', 2),
(21, 'Tableau d\'honneur', 5),
(20, 'Félicitation', 2),
(19, 'Exclusion temporaire', 5),
(18, 'Blâme', 3),
(17, 'Avertissement', 1),
(16, 'vol', 20),
(15, 'bagarre', 10),
(14, 'vandalisme', 8),
(13, 'injure', 5),
(12, 'retard', 1),
(11, 'absence', 3);

DROP TABLE IF EXISTS `Eleve`;
CREATE TABLE `Eleve` (
  `matricule` int unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(60) NOT NULL,
  `prenom` varchar(60) NOT NULL,
  `dateNaissance` date NOT NULL,
  `lieuNaissance` varchar(30) NOT NULL,
  `sexe` smallint unsigned NOT NULL DEFAULT '0' COMMENT '0 = fille, 1 = garcon, 2 = autres',
  `langue` varchar(30) NOT NULL DEFAULT 'NON DEFINI',
  `photoURL` longtext,
  `actif` tinyint unsigned NOT NULL DEFAULT '0',
  `idVilleNaissance` int unsigned NOT NULL,
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  `idCycle` int DEFAULT NULL,
  PRIMARY KEY (`matricule`),
  KEY `Eleve_idVilleNaissance_VilleNaissance_idVille_fk` (`idVilleNaissance`),
  CONSTRAINT `Eleve_idVilleNaissance_VilleNaissance_idVille_fk` FOREIGN KEY (`idVilleNaissance`) REFERENCES `VilleNaissance` (`idVille`),
  CONSTRAINT `lieuNaiss` FOREIGN KEY (`idVilleNaissance`) REFERENCES `VilleNaissance` (`idVille`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=96534674 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Eleve` (`matricule`, `nom`, `prenom`, `dateNaissance`, `lieuNaissance`, `sexe`, `langue`, `photoURL`, `actif`, `idVilleNaissance`, `idAdmin`, `created_at`, `isDelete`, `idCycle`) VALUES 
(15290484, 'miguel', 'andy', '2005-07-16 23:00:00', 'yaounde', 1, 'Bilingue', '', 0, 96, 22, '2026-07-08 11:54:51', 0, NULL),
(20260004, 'HELLO', 'HELLO', '2014-12-30 23:00:00', 'Douala', 1, 'NON DEFINI', 'INDEFINI', 1, 1, 1, '2026-05-19 09:23:46', 0, NULL),
(20260005, 'test', 'test', '2006-03-11 23:00:00', 'hopital', 2, 'French', 'INDEFINI', 1, 2, 3697806282, '2026-05-29 14:07:05', 0, NULL),
(20260006, 'toto', 'toto', '2000-03-11 23:00:00', 'Yaounde', 1, 'Anglais', '/uploads/eleves/photo-1780074478474-322509334.png', 1, 110, 3697806282, '2026-05-29 16:07:59', 0, NULL),
(20260007, 'yes', 'yes', '2000-03-11 23:00:00', 'Yaounde', 2, 'Français', '/uploads/eleves/photo-1780077357744-840758960.png', 1, 96, 3697806282, '2026-05-29 16:55:58', 0, NULL),
(20260008, 'samuel', 'samuel', '2000-03-11 23:00:00', 'hôpital de district', 1, 'Français', 'INDEFINI', 1, 55, 3697806282, '2026-05-29 17:08:56', 0, NULL),
(20260009, 'eleve', 'bon', '2000-03-11 23:00:00', 'hôpital de district', 2, 'Anglais', '/uploads/eleves/photo-1780078578794-258482835.png', 1, 110, 3697806282, '2026-05-29 17:16:20', 0, NULL),
(20260010, 'têtu', 'têtu', '2002-03-11 23:00:00', 'hôpital de district', 1, 'Anglais', 'INDEFINI', 1, 17, 12, '2026-06-15 20:06:35', 0, NULL),
(20260011, 'MBARGA', 'Jean', '2015-03-14 23:00:00', 'Yaoundé', 1, 'FR', NULL, 1, 1, 1, '2026-06-19 13:44:54', 0, NULL),
(20260012, 'BIDJAN', 'Marie', '2016-07-21 23:00:00', 'Douala', 2, 'FR', NULL, 1, 1, 1, '2026-06-19 13:44:54', 0, NULL),
(20260013, 'TCHINDA', 'Paul', '2014-11-07 23:00:00', 'Bafoussam', 1, 'EN', NULL, 1, 1, 1, '2026-06-19 13:44:54', 0, NULL),
(20260014, 'KENFACK', 'Alice', '2015-05-29 23:00:00', 'Garoua', 2, 'FR', NULL, 1, 1, 1, '2026-06-19 13:44:54', 0, NULL),
(20260015, 'FOUDA', 'Pierre', '2016-01-17 23:00:00', 'Bamenda', 1, 'EN', NULL, 1, 1, 1, '2026-06-19 13:44:54', 0, NULL),
(20260016, 'NJIKAM', 'Sarah', '2014-09-11 23:00:00', 'Maroua', 2, 'FR', NULL, 1, 1, 1, '2026-06-19 13:44:54', 0, NULL),
(20260017, 'TCHOUPOU', 'David', '2015-12-24 23:00:00', 'Ngaoundéré', 1, 'FR', NULL, 1, 1, 1, '2026-06-19 13:44:54', 0, NULL),
(20260018, 'EYANGO', 'Esther', '2016-04-02 23:00:00', 'Kribi', 2, 'EN', NULL, 1, 1, 1, '2026-06-19 13:44:54', 0, NULL),
(20260019, 'BELA', 'François', '2014-06-16 23:00:00', 'Bertoua', 1, 'FR', NULL, 1, 1, 1, '2026-06-19 13:44:54', 0, NULL),
(20260020, 'MENDJO', 'Grace', '2015-10-28 23:00:00', 'Ebolowa', 2, 'FR', NULL, 1, 1, 1, '2026-06-19 13:44:54', 0, NULL),
(20260021, 'TEST', 'Student', '2015-05-31 23:00:00', 'Yaoundé', 1, 'FR', NULL, 1, 1, 1, '2026-06-19 13:44:54', 0, NULL),
(20260022, 'Fedjio', 'Guenole', '2026-06-18 23:00:00', 'Centre', 1, 'FR', NULL, 1, 1, 1, '2026-06-19 13:44:54', 0, NULL),
(20260023, 'NDONGO', 'Simon', '2015-04-19 23:00:00', 'Yaoundé', 1, 'FR', NULL, 1, 1, 1, '2026-06-19 13:44:54', 0, NULL),
(20260024, 'EYANGO', 'Julie', '2016-11-02 23:00:00', 'Douala', 2, 'EN', NULL, 1, 1, 1, '2026-06-19 13:44:54', 0, NULL),
(20260040, 's', 's', '2026-07-01 23:00:00', 's', 1, 'FR', NULL, 1, 1, 1, '2026-07-08 22:14:39', 0, NULL),
(20260041, 's', 's', '2026-06-30 23:00:00', 's', 1, 'FR', NULL, 1, 1, 1, '2026-07-08 22:48:42', 0, NULL),
(28078493, 'klaus', 'miguel', '2005-07-17 23:00:00', 'ebolowa', 1, 'Francais', '', 1, 96, 22, '2026-07-08 15:27:59', 0, NULL),
(58496404, 'paul', 'atangana', '2026-06-01 23:00:00', 'yaounde', 1, 'Francais', '', 0, 96, 14, '2026-06-20 11:28:17', 0, NULL),
(58497381, 'paul', 'atangana', '2026-06-01 23:00:00', 'yaounde', 1, 'Francais', '', 0, 96, 14, '2026-06-20 11:28:18', 0, NULL),
(58499821, 'paul', 'atangana', '2026-06-10 23:00:00', 'yaounde', 1, 'Francais', '', 1, 96, 14, '2026-06-20 11:28:20', 0, NULL),
(58501265, 'paul', 'atangana', '2026-06-10 23:00:00', 'yaounde', 1, 'Francais', '', 1, 96, 14, '2026-06-20 11:28:21', 0, NULL),
(58501295, 'paul', 'atangana', '2026-06-10 23:00:00', 'yaounde', 1, 'Francais', '', 1, 96, 14, '2026-06-20 11:28:21', 0, NULL),
(58502040, 'paul', 'atangana', '2026-06-10 23:00:00', 'yaounde', 1, 'Francais', '', 1, 96, 14, '2026-06-20 11:28:22', 0, NULL),
(58502495, 'paul', 'atangana', '2026-06-10 23:00:00', 'yaounde', 1, 'Francais', '', 1, 96, 14, '2026-06-20 11:28:22', 0, NULL),
(58502647, 'paul', 'atangana', '2026-06-10 23:00:00', 'yaounde', 1, 'Francais', '', 1, 96, 14, '2026-06-20 11:28:23', 0, NULL),
(58502763, 'paul', 'atangana', '2026-06-10 23:00:00', 'yaounde', 1, 'Francais', '', 1, 96, 14, '2026-06-20 11:28:23', 0, NULL),
(58503552, 'paul', 'atangana', '2026-06-10 23:00:00', 'yaounde', 1, 'Francais', '', 1, 96, 14, '2026-06-20 11:28:23', 0, NULL),
(58503982, 'paul', 'atangana', '2026-06-10 23:00:00', 'yaounde', 1, 'Francais', '', 1, 96, 14, '2026-06-20 11:28:24', 0, NULL),
(93448874, 'TEST_ELEVE', 'Nouveau', '2014-12-31 23:00:00', 'Yaoundé', 1, 'Francais', '', 1, 96, 1, '2026-06-19 17:24:08', 0, NULL),
(93742048, 'TEST_ELEVE', 'Nouveau', '2014-12-31 23:00:00', 'Yaoundé', 1, 'Francais', '', 1, 96, 1, '2026-06-19 17:29:02', 0, NULL),
(94102274, 'TEST_ELEVE', 'Nouveau', '2014-12-31 23:00:00', 'Yaoundé', 1, 'Francais', '', 1, 96, 1, '2026-06-19 17:35:02', 0, NULL),
(94177338, 'TEST_ELEVE', 'Nouveau', '2014-12-31 23:00:00', 'Yaoundé', 1, 'Francais', '', 1, 96, 1, '2026-06-19 17:36:17', 0, NULL);

DROP TABLE IF EXISTS `EmploiDuTemps`;
CREATE TABLE `EmploiDuTemps` (
  `idTemps` int unsigned NOT NULL AUTO_INCREMENT,
  `jour` varchar(30) NOT NULL,
  `heure` varchar(6) NOT NULL,
  `idClasse` int unsigned NOT NULL,
  `idCours` int unsigned NOT NULL,
  `idSalle` int unsigned DEFAULT NULL,
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `idEnseignant` int DEFAULT NULL,
  PRIMARY KEY (`idTemps`),
  KEY `classes` (`idClasse`),
  KEY `EmploiDuTemps_idCours_Cours_idCours_fk` (`idCours`),
  CONSTRAINT `classes` FOREIGN KEY (`idClasse`) REFERENCES `Classe` (`idClasse`) ON UPDATE CASCADE,
  CONSTRAINT `cours` FOREIGN KEY (`idCours`) REFERENCES `Cours` (`idCours`) ON UPDATE CASCADE,
  CONSTRAINT `EmploiDuTemps_idCours_Cours_idCours_fk` FOREIGN KEY (`idCours`) REFERENCES `Cours` (`idCours`)
) ENGINE=InnoDB AUTO_INCREMENT=1022 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `EmploiDuTemps` (`idTemps`, `jour`, `heure`, `idClasse`, `idCours`, `idSalle`, `idAdmin`, `created_at`, `idEnseignant`) VALUES 
(1020, 'Lundi', '07:00', 47, 29, 26, 1, '2026-07-08 20:05:56', 2),
(1021, 'Mardi', '11:00', 62, 33, 21, 1, '2026-07-08 23:58:54', 116);

DROP TABLE IF EXISTS `Enseignant`;
CREATE TABLE `Enseignant` (
  `idEnseignant` int unsigned NOT NULL AUTO_INCREMENT,
  `idPers` int unsigned NOT NULL,
  `idCours` int unsigned NOT NULL,
  `Actif` tinyint unsigned NOT NULL DEFAULT '1',
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  `photoURL` varchar(512) DEFAULT NULL COMMENT 'URL de la photo de profil',
  PRIMARY KEY (`idEnseignant`),
  KEY `enseignant` (`idPers`),
  KEY `Enseignant_idCours_Cours_idCours_fk` (`idCours`),
  CONSTRAINT `enseignant` FOREIGN KEY (`idPers`) REFERENCES `Personne` (`idPers`) ON UPDATE CASCADE,
  CONSTRAINT `Enseignant_idCours_Cours_idCours_fk` FOREIGN KEY (`idCours`) REFERENCES `Cours` (`idCours`),
  CONSTRAINT `enseigner` FOREIGN KEY (`idCours`) REFERENCES `Cours` (`idCours`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Enseignant` (`idEnseignant`, `idPers`, `idCours`, `Actif`, `idAdmin`, `created_at`, `isDelete`, `photoURL`) VALUES 
(53, 116, 31, 1, 22, '2026-07-08 17:39:59', 0, NULL),
(54, 117, 30, 1, 22, '2026-07-08 18:09:15', 0, NULL);

DROP TABLE IF EXISTS `EnseignantAffectation`;
CREATE TABLE `EnseignantAffectation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idEnseignant` int NOT NULL,
  `idSalle` int DEFAULT NULL,
  `idCours` int DEFAULT NULL,
  `idAdmin` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `EnseignantAffectation` (`id`, `idEnseignant`, `idSalle`, `idCours`, `idAdmin`, `created_at`) VALUES 
(1, 45, 11, NULL, 14, '2026-06-21 06:04:46'),
(2, 52, 21, NULL, 22, '2026-07-08 16:00:45'),
(3, 53, 21, NULL, 22, '2026-07-08 20:47:06');

DROP TABLE IF EXISTS `Epreuve`;
CREATE TABLE `Epreuve` (
  `idEpreuve` int unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) NOT NULL,
  `urlDoc` varchar(255) NOT NULL DEFAULT 'INDEFINI',
  `auteur` varchar(255) NOT NULL DEFAULT 'INDEFINI',
  `idNature` int unsigned NOT NULL,
  `idPers` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`idEpreuve`),
  KEY `Epreuve_idNature_NatureEpreuve_idNature_fk` (`idNature`),
  KEY `Epreuve_idPers_Personne_idPers_fk` (`idPers`),
  CONSTRAINT `Epreuve_idNature_NatureEpreuve_idNature_fk` FOREIGN KEY (`idNature`) REFERENCES `NatureEpreuve` (`idNature`),
  CONSTRAINT `Epreuve_idPers_Personne_idPers_fk` FOREIGN KEY (`idPers`) REFERENCES `Personne` (`idPers`),
  CONSTRAINT `natu` FOREIGN KEY (`idNature`) REFERENCES `NatureEpreuve` (`idNature`)
) ENGINE=InnoDB AUTO_INCREMENT=1030 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Epreuve` (`idEpreuve`, `libelle`, `urlDoc`, `auteur`, `idNature`, `idPers`, `created_at`, `isDelete`) VALUES 
(1000, 'devoir reseau', '/uploads/epreuves/document-1781614669340-663471006.pdf', 'chounfouen c', 1, 81, '2026-06-16 11:57:49', NULL);

DROP TABLE IF EXISTS `Evaluation`;
CREATE TABLE `Evaluation` (
  `idEval` int unsigned NOT NULL AUTO_INCREMENT,
  `note` float NOT NULL DEFAULT '0',
  `appreciation` varchar(255) NOT NULL,
  `matricule` int unsigned NOT NULL,
  `idEpreuve` int unsigned NOT NULL,
  `idCours` int unsigned NOT NULL,
  `idSession` int unsigned NOT NULL,
  `idPers` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idEval`),
  KEY `matr` (`matricule`),
  KEY `epre` (`idEpreuve`),
  KEY `Evaluation_idCours_Cours_idCours_fk` (`idCours`),
  KEY `Evaluation_idSession_Session_idSession_fk` (`idSession`),
  CONSTRAINT `epre` FOREIGN KEY (`idEpreuve`) REFERENCES `Epreuve` (`idEpreuve`) ON UPDATE CASCADE,
  CONSTRAINT `Evaluation_idCours_Cours_idCours_fk` FOREIGN KEY (`idCours`) REFERENCES `Cours` (`idCours`),
  CONSTRAINT `Evaluation_idSession_Session_idSession_fk` FOREIGN KEY (`idSession`) REFERENCES `Session` (`idSession`),
  CONSTRAINT `matiere` FOREIGN KEY (`idCours`) REFERENCES `Cours` (`idCours`) ON UPDATE CASCADE,
  CONSTRAINT `matr` FOREIGN KEY (`matricule`) REFERENCES `Eleve` (`matricule`) ON UPDATE CASCADE,
  CONSTRAINT `session` FOREIGN KEY (`idSession`) REFERENCES `Session` (`idSession`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1004 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
DROP TABLE IF EXISTS `EvaluationProgramme`;
CREATE TABLE `EvaluationProgramme` (
  `id` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) NOT NULL,
  `type` varchar(60) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `duree` int DEFAULT NULL,
  `coeff` decimal(8,2) DEFAULT NULL,
  `classe` int DEFAULT NULL,
  `cours_id` int DEFAULT NULL,
  `idSalle` int DEFAULT NULL,
  `enseignant_id` int DEFAULT NULL,
  `note_max` decimal(8,2) NOT NULL DEFAULT '20.00',
  `description` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `EvaluationProgramme` (`id`, `libelle`, `type`, `date`, `duree`, `coeff`, `classe`, `cours_id`, `idSalle`, `enseignant_id`, `note_max`, `description`, `created_at`, `updated_at`) VALUES 
(1, 'premire sequence ', 'Examen', NULL, 2, '1.00', 12, 13, NULL, NULL, '20.00', '', '2026-06-24 10:58:49', NULL),
(2, 'premiere sequence', 'Examen', NULL, 2, '2.00', 12, 12, NULL, NULL, '20.00', 'tout etudiant devra faire cette evaluation sous peine  de redoubler ', '2026-06-24 11:02:51', NULL),
(3, 'premiere sequence', 'Contrôle', '2026-06-26 23:00:00', 120, '1.00', 12, 1, NULL, 1, '20.00', '', '2026-06-24 11:22:12', NULL),
(4, 'premiere evaluation', 'Examen', NULL, 120, '4.00', 12, 13, NULL, NULL, '20.00', 'ok', '2026-06-24 11:38:20', NULL),
(5, 'Évaluation examen', 'examen', '2026-07-24 23:00:00', NULL, NULL, 12, 13, 11, NULL, '20.00', 'Programmée par l’enseignant', '2026-07-08 12:02:46', NULL),
(6, 'cc', 'Devoir', '2026-07-11 23:00:00', NULL, '1.00', 17, 6, NULL, 5, '20.00', '', '2026-07-08 13:11:12', NULL),
(7, 'sn', 'Contrôle', '2025-07-11 23:00:00', NULL, '1.00', 17, 6, NULL, 5, '20.00', '', '2026-07-08 13:44:21', NULL),
(8, 'Évaluation controle', 'controle', '2026-07-11 23:00:00', NULL, NULL, 12, 13, 11, NULL, '20.00', 'Programmée par l’enseignant', '2026-07-08 14:00:22', NULL);

DROP TABLE IF EXISTS `Frequente`;
CREATE TABLE `Frequente` (
  `idFrequente` int unsigned NOT NULL AUTO_INCREMENT,
  `idSalle` int unsigned NOT NULL,
  `idAcademi` int unsigned NOT NULL,
  `matricule` varchar(255) NOT NULL,
  `commentaire` varchar(255) NOT NULL DEFAULT 'RAS',
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `idScolarite` int DEFAULT NULL,
  PRIMARY KEY (`idFrequente`),
  KEY `freq` (`matricule`),
  KEY `liers` (`idSalle`),
  KEY `Frequente_idAcademi_AnneeAcademique_idAnnee_fk` (`idAcademi`),
  CONSTRAINT `Acad` FOREIGN KEY (`idAcademi`) REFERENCES `AnneeAcademique` (`idAnnee`) ON UPDATE CASCADE,
  CONSTRAINT `Frequente_idAcademi_AnneeAcademique_idAnnee_fk` FOREIGN KEY (`idAcademi`) REFERENCES `AnneeAcademique` (`idAnnee`),
  CONSTRAINT `liers` FOREIGN KEY (`idSalle`) REFERENCES `Salle` (`idSalle`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=227 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Frequente` (`idFrequente`, `idSalle`, `idAcademi`, `matricule`, `commentaire`, `idAdmin`, `created_at`, `idScolarite`) VALUES 
(2, 2, 10, '2', 'RAS', 1, '2026-05-19 09:23:50', NULL),
(3, 3, 10, '3', 'RAS', 1, '2026-05-19 09:23:50', NULL),
(4, 4, 10, '4', 'RAS', 1, '2026-05-19 09:23:51', NULL),
(5, 5, 10, '5', 'RAS', 1, '2026-05-19 09:23:51', NULL),
(6, 6, 10, '6', 'RAS', 1, '2026-05-19 09:23:51', NULL),
(7, 7, 10, '7', 'RAS', 1, '2026-05-19 09:23:52', NULL),
(8, 1, 10, '8', 'RAS', 1, '2026-05-19 09:23:52', NULL),
(9, 9, 10, '9', 'RAS', 1, '2026-05-19 09:23:52', NULL),
(10, 10, 10, '10', 'RAS', 1, '2026-05-19 09:23:53', NULL),
(11, 1, 1, '8', 'tres pontuel et studieux', 1000, '2026-05-19 22:34:21', NULL),
(12, 1, 3, '9', '', 1000, '2026-05-20 08:33:52', NULL),
(13, 4, 1, '72215111', 'RAS', 1000, '2026-05-20 09:16:56', NULL),
(164, 21, 1, '15290484', 'ras', 22, '2026-07-08 13:04:34', NULL),
(223, 30, 6, '28078493', '', 22, '2026-07-08 17:42:49', NULL),
(224, 24, 7, '20260040', 'RAS', 2, '2026-07-08 18:59:55', 1006),
(225, 28, 7, '20260041', 'RAS', 2, '2026-07-08 19:22:46', 1006),
(226, 21, 21, '15290484', 'RAS', 116, '2026-07-08 23:00:00', NULL);

DROP TABLE IF EXISTS `GroupMessages`;
CREATE TABLE `GroupMessages` (
  `idMsg` int NOT NULL AUTO_INCREMENT,
  `groupId` int NOT NULL,
  `senderRole` varchar(30) DEFAULT NULL,
  `senderId` varchar(120) DEFAULT NULL,
  `senderLabel` varchar(160) DEFAULT NULL,
  `content` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idMsg`),
  KEY `groupId` (`groupId`),
  CONSTRAINT `GroupMessages_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `MessageGroups` (`idGroup`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `GroupMessages` (`idMsg`, `groupId`, `senderRole`, `senderId`, `senderLabel`, `content`, `created_at`) VALUES 
(1, 1, 'system', 'system', 'Système', 'Bonjour et bienvenue dans ce groupe. Utilisez cet espace pour partager les informations importantes liées aux activités de l\'école.', '2026-05-19 22:35:40'),
(2, 1, 'admin', 'admin', 'Admin Fondateur', 'salut tout le monde', '2026-05-19 22:36:04'),
(3, 2, 'system', 'system', 'Système', 'Bonjour et bienvenue dans ce groupe. Utilisez cet espace pour partager les informations importantes liées aux activités de l\'école.', '2026-05-27 15:28:36'),
(4, 3, 'system', 'system', 'Système', 'Bonjour et bienvenue dans ce groupe. Utilisez cet espace pour partager les informations importantes liées aux activités de l\'école.', '2026-05-27 15:28:40');

DROP TABLE IF EXISTS `JourSemaine`;
CREATE TABLE `JourSemaine` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(15) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `JourSemaine` (`ID`, `libelle`) VALUES 
(2, 'Lundi'),
(3, 'Mardi'),
(4, 'Mercredi'),
(5, 'Jeudi'),
(6, 'Vendredi');

DROP TABLE IF EXISTS `Livres`;
CREATE TABLE `Livres` (
  `idLivre` int unsigned NOT NULL AUTO_INCREMENT,
  `titre` varchar(255) NOT NULL,
  `auteurs` varchar(255) NOT NULL DEFAULT 'INDEFINI',
  `prix` float unsigned NOT NULL DEFAULT '0',
  `idSpecialite` int unsigned NOT NULL,
  `edition` varchar(255) NOT NULL DEFAULT 'INDEFINI',
  `annee_parution` date DEFAULT NULL,
  `totalCopie` smallint unsigned NOT NULL DEFAULT '1',
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idLivre`),
  KEY `special` (`idSpecialite`),
  CONSTRAINT `special` FOREIGN KEY (`idSpecialite`) REFERENCES `Specialite` (`idSpecialite`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1003 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Livres` (`idLivre`, `titre`, `auteurs`, `prix`, `idSpecialite`, `edition`, `annee_parution`, `totalCopie`, `idAdmin`, `created_at`) VALUES 
(1000, 'Maths 1', 'Auteur A', 45, 1000, '1ère', '2023-12-31 23:00:00', 1, 1, '2026-06-20 08:22:56'),
(1001, 'Physique 1', 'Auteur B', 40, 1001, '2ème', '2022-12-31 23:00:00', 1, 1, '2026-06-20 08:22:57'),
(1002, 'Français 1', 'Auteur C', 35, 1002, '1ère', '2023-12-31 23:00:00', 1, 1, '2026-06-20 08:22:57');

DROP TABLE IF EXISTS `MessageGroups`;
CREATE TABLE `MessageGroups` (
  `idGroup` int NOT NULL AUTO_INCREMENT,
  `name` varchar(160) NOT NULL,
  `description` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idGroup`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `MessageGroups` (`idGroup`, `name`, `description`, `created_at`) VALUES 
(1, 'les frerots', 'un pour tous et tous pour un', '2026-05-19 22:35:39'),
(2, 'judd', 'jde', '2026-05-27 15:28:35'),
(3, 'judd', 'jde', '2026-05-27 15:28:36');

DROP TABLE IF EXISTS `Messages`;
CREATE TABLE `Messages` (
  `idMessages` int unsigned NOT NULL AUTO_INCREMENT,
  `idExp_Pers` int unsigned NOT NULL,
  `senderRole` varchar(30) DEFAULT NULL,
  `senderId` varchar(120) DEFAULT NULL,
  `senderLabel` varchar(160) DEFAULT NULL,
  `receiverRole` varchar(30) DEFAULT NULL,
  `receiverId` varchar(120) DEFAULT NULL,
  `receiverLabel` varchar(160) DEFAULT NULL,
  `idParent` int unsigned NOT NULL,
  `objet` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL DEFAULT '',
  `content` text,
  `information` text NOT NULL,
  `type_message` smallint unsigned NOT NULL DEFAULT '0' COMMENT '0 = individuel, 1= tous les parents , 2 = tous les parents pour paiement',
  `AnneeAcade` varchar(15) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `valider` tinyint unsigned NOT NULL DEFAULT '0',
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `readAt` datetime DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idMessages`),
  KEY `Messages_idParent_Parents_idParent_fk` (`idParent`),
  KEY `idx_messages_created_at` (`created_at`),
  KEY `idx_messages_idExp` (`idExp_Pers`),
  KEY `idx_messages_annee` (`AnneeAcade`),
  CONSTRAINT `mess` FOREIGN KEY (`idParent`) REFERENCES `Parents` (`idParent`) ON UPDATE CASCADE,
  CONSTRAINT `Messages_idParent_Parents_idParent_fk` FOREIGN KEY (`idParent`) REFERENCES `Parents` (`idParent`)
) ENGINE=InnoDB AUTO_INCREMENT=3704838758 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Messages` (`idMessages`, `idExp_Pers`, `senderRole`, `senderId`, `senderLabel`, `receiverRole`, `receiverId`, `receiverLabel`, `idParent`, `objet`, `subject`, `content`, `information`, `type_message`, `AnneeAcade`, `created_at`, `valider`, `isRead`, `readAt`, `updated_at`) VALUES 
(3704833845, 3697806280, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'Rappel de paiement de scolarité', '', NULL, 'Votre paiement de scolarité est en retard. Merci de régulariser.', 2, '1', '2026-05-25 10:27:13', 1, 0, NULL, '2026-05-25 10:27:14'),
(3704836215, 3697806280, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'Rappel de paiement de scolarité', '', NULL, 'Votre paiement de scolarité est en retard. Merci de régulariser.', 2, '1', '2026-05-25 10:27:16', 1, 0, NULL, '2026-05-25 10:27:17'),
(3704838741, 1, NULL, NULL, NULL, 'parent', '1', 'Zali das', 1, 'Test broadcast', '', NULL, 'Message à tous', 0, '12', '2026-07-08 16:51:51', 0, 0, NULL, '2026-07-08 16:51:51'),
(3704838742, 1, NULL, NULL, NULL, 'teacher', '2', 'Zali das', 1, 'Test broadcast', '', NULL, 'Message à tous', 0, '12', '2026-07-08 16:51:51', 0, 0, NULL, '2026-07-08 16:51:51'),
(3704838743, 1, NULL, NULL, NULL, 'teacher', '3', 'Mohamadou Salim', 1, 'Test broadcast', '', NULL, 'Message à tous', 0, '12', '2026-07-08 16:51:51', 0, 0, NULL, '2026-07-08 16:51:51'),
(3704838744, 1, NULL, NULL, NULL, 'teacher', '4', 'Dupont Jean', 1, 'Test broadcast', '', NULL, 'Message à tous', 0, '12', '2026-07-08 16:51:51', 0, 0, NULL, '2026-07-08 16:51:51'),
(3704838745, 1, NULL, NULL, NULL, 'teacher', '5', 'MBIA Fatou', 1, 'Test broadcast', '', NULL, 'Message à tous', 0, '12', '2026-07-08 16:51:51', 0, 0, NULL, '2026-07-08 16:51:51'),
(3704838746, 1, NULL, NULL, NULL, 'teacher', '6', 'Tamgo carl', 1, 'Test broadcast', '', NULL, 'Message à tous', 0, '12', '2026-07-08 16:51:51', 0, 0, NULL, '2026-07-08 16:51:51'),
(3704838747, 1, NULL, NULL, NULL, 'teacher', '7', 'Test Teacher', 1, 'Test broadcast', '', NULL, 'Message à tous', 0, '12', '2026-07-08 16:51:51', 0, 0, NULL, '2026-07-08 16:51:51'),
(3704838748, 1, NULL, NULL, NULL, 'teacher', '20', 'Demo Teacher', 1, 'Test broadcast', '', NULL, 'Message à tous', 0, '12', '2026-07-08 16:51:51', 0, 0, NULL, '2026-07-08 16:51:51'),
(3704838749, 1, NULL, NULL, NULL, 'teacher', '30', 'Ndiop Fanta', 1, 'Test broadcast', '', NULL, 'Message à tous', 0, '12', '2026-07-08 16:51:51', 0, 0, NULL, '2026-07-08 16:51:51'),
(3704838750, 1, NULL, NULL, NULL, 'teacher', '31', 'Ndiop Fanta', 1, 'Test broadcast', '', NULL, 'Message à tous', 0, '12', '2026-07-08 16:51:51', 0, 0, NULL, '2026-07-08 16:51:51'),
(3704838751, 1, NULL, NULL, NULL, 'teacher', '32', 'Ndiop Fanta', 1, 'Test broadcast', '', NULL, 'Message à tous', 0, '12', '2026-07-08 16:51:51', 0, 0, NULL, '2026-07-08 16:51:51'),
(3704838752, 1, NULL, NULL, NULL, 'teacher', '33', 'Ndiop Fanta', 1, 'Test broadcast', '', NULL, 'Message à tous', 0, '12', '2026-07-08 16:51:51', 0, 0, NULL, '2026-07-08 16:51:51'),
(3704838753, 1, NULL, NULL, NULL, 'teacher', '35', 'hello world', 1, 'Test broadcast', '', NULL, 'Message à tous', 0, '12', '2026-07-08 16:51:51', 0, 0, NULL, '2026-07-08 16:51:51'),
(3704838754, 1, NULL, NULL, NULL, 'teacher', '36', 'hello world', 1, 'Test broadcast', '', NULL, 'Message à tous', 0, '12', '2026-07-08 16:51:51', 0, 0, NULL, '2026-07-08 16:51:51'),
(3704838755, 1, NULL, NULL, NULL, 'teacher', '37', 'Kemda Marie', 1, 'Test broadcast', '', NULL, 'Message à tous', 0, '12', '2026-07-08 16:51:51', 0, 0, NULL, '2026-07-08 16:51:51'),
(3704838756, 1, NULL, NULL, NULL, 'teacher', '38', 'TCHOKOTE  Roland', 1, 'Test broadcast', '', NULL, 'Message à tous', 0, '12', '2026-07-08 16:51:51', 0, 0, NULL, '2026-07-08 16:51:51'),
(3704838757, 1, NULL, NULL, NULL, 'parent', '1', 'Test Parent', 1, 'Test individuel', '', NULL, 'Test', 0, '12', '2026-07-08 16:52:06', 0, 0, NULL, '2026-07-08 16:52:06');

DROP TABLE IF EXISTS `Mode`;
CREATE TABLE `Mode` (
  `idMode` int unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(100) NOT NULL DEFAULT 'INDEFINI',
  `information` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `actif` tinyint unsigned NOT NULL DEFAULT '1',
  `idFondateur` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idMode`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Mode` (`idMode`, `libelle`, `information`, `actif`, `idFondateur`, `created_at`) VALUES 
(1, 'Espèces', 'Information pour Espèces', 1, 1, '2026-05-19 09:23:53'),
(2, 'Express Union', 'Information pour Mobile Money', 0, 1, '2026-05-19 09:23:53'),
(3, 'Orange Money', 'Information pour Orange Money', 1, 1, '2026-05-19 09:23:54'),
(4, 'Virement Bancaire', 'Information pour Virement Bancaire', 1, 1, '2026-05-19 09:23:54'),
(5, 'Chèque', 'Information pour Chèque', 1, 1, '2026-05-19 09:23:54'),
(6, 'Carte Bancaire', 'Information pour Carte Bancaire', 1, 1, '2026-05-19 09:23:55'),
(7, 'MTN MoMo', 'Information pour MTN MoMo', 1, 1, '2026-05-19 09:23:55'),
(8, 'PayPal', 'Information pour PayPal', 1, 1, '2026-05-19 09:23:55'),
(9, 'Western Union', 'Information pour Western Union', 1, 1, '2026-05-19 09:23:55'),
(10, 'Express Union', 'Information pour Express Union', 1, 1, '2026-05-19 09:23:56');

DROP TABLE IF EXISTS `NatureEpreuve`;
CREATE TABLE `NatureEpreuve` (
  `idNature` int unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) NOT NULL DEFAULT 'INDEFINI' COMMENT 'Controle Continu, Examen, Devoir Mercredi, Devoir Week End',
  `description` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`idNature`)
) ENGINE=InnoDB AUTO_INCREMENT=1005 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `NatureEpreuve` (`idNature`, `libelle`, `description`) VALUES 
(1, 'Contrôle Continu', 'Evaluation chaque vendredi'),
(1000, 'evaluation séquentielle', 'Evaluation de la séquence'),
(1001, 'devoir congé', 'devoir à faire durant les congés'),
(1002, 'Devoir', NULL),
(1003, 'Composition', NULL),
(1004, 'Examen', NULL);

DROP TABLE IF EXISTS `Paiement`;
CREATE TABLE `Paiement` (
  `idPaie` int unsigned NOT NULL AUTO_INCREMENT,
  `matricule` int unsigned NOT NULL,
  `idAca` int unsigned NOT NULL,
  `montant` float NOT NULL,
  `url` varchar(255) NOT NULL DEFAULT 'INDEFINI',
  `comentaire` varchar(255) NOT NULL DEFAULT 'INDEFINI',
  `idMode` int unsigned NOT NULL,
  `operation_ID` varchar(30) NOT NULL DEFAULT 'INDEFINI',
  `idPers` int unsigned NOT NULL,
  `datePaie` date NOT NULL,
  `dateEnregistrer` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idPaie`),
  KEY `enf` (`matricule`),
  KEY `Paiement_idAca_AnneeAcademique_idAnnee_fk` (`idAca`),
  KEY `Paiement_idMode_Mode_idMode_fk` (`idMode`),
  CONSTRAINT `annee` FOREIGN KEY (`idAca`) REFERENCES `AnneeAcademique` (`idAnnee`) ON UPDATE CASCADE,
  CONSTRAINT `enf` FOREIGN KEY (`matricule`) REFERENCES `Eleve` (`matricule`) ON UPDATE CASCADE,
  CONSTRAINT `Paiement_idAca_AnneeAcademique_idAnnee_fk` FOREIGN KEY (`idAca`) REFERENCES `AnneeAcademique` (`idAnnee`),
  CONSTRAINT `Paiement_idMode_Mode_idMode_fk` FOREIGN KEY (`idMode`) REFERENCES `Mode` (`idMode`),
  CONSTRAINT `via` FOREIGN KEY (`idMode`) REFERENCES `Mode` (`idMode`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Paiement` (`idPaie`, `matricule`, `idAca`, `montant`, `url`, `comentaire`, `idMode`, `operation_ID`, `idPers`, `datePaie`, `dateEnregistrer`) VALUES 
(1, 20260004, 10, 50000, 'INDEFINI', 'INDEFINI', 1, 'INDEFINI', 1, '2026-05-18 23:00:00', '2026-05-19 10:23:57'),
(2, 2, 10, 50000, 'INDEFINI', 'INDEFINI', 2, 'INDEFINI', 1, '2026-05-18 23:00:00', '2026-05-19 10:23:57'),
(3, 3, 10, 50000, 'INDEFINI', 'INDEFINI', 3, 'INDEFINI', 1, '2026-05-18 23:00:00', '2026-05-19 10:23:58'),
(4, 4, 10, 50000, 'INDEFINI', 'INDEFINI', 4, 'INDEFINI', 1, '2026-05-18 23:00:00', '2026-05-19 10:23:58'),
(5, 5, 10, 50000, 'INDEFINI', 'INDEFINI', 5, 'INDEFINI', 1, '2026-05-18 23:00:00', '2026-05-19 10:23:58'),
(6, 6, 10, 50000, 'INDEFINI', 'INDEFINI', 6, 'INDEFINI', 1, '2026-05-18 23:00:00', '2026-05-19 10:23:59'),
(7, 7, 10, 50000, 'INDEFINI', 'INDEFINI', 7, 'INDEFINI', 1, '2026-05-18 23:00:00', '2026-05-19 10:23:59'),
(8, 8, 10, 50000, 'INDEFINI', 'INDEFINI', 8, 'INDEFINI', 1, '2026-05-18 23:00:00', '2026-05-19 10:23:59'),
(9, 9, 10, 50000, 'INDEFINI', 'INDEFINI', 9, 'INDEFINI', 1, '2026-05-18 23:00:00', '2026-05-19 10:24:00'),
(10, 10, 10, 50000, 'INDEFINI', 'INDEFINI', 10, 'INDEFINI', 1, '2026-05-18 23:00:00', '2026-05-19 10:24:00'),
(11, 20260004, 6, 150000, 'INDEFINI', 'INDEFINI', 1, 'INDEFINI', 11, '2026-06-18 23:00:00', '2026-06-19 12:25:17'),
(20, 20260040, 6, 153334, 'INDEFINI', 'INDEFINI', 1, 'INDEFINI', 2, '2026-07-23 23:00:00', '2026-07-08 22:14:40'),
(21, 20260040, 6, 153334, 'INDEFINI', 'INDEFINI', 4, 'INDEFINI', 2, '2026-07-23 23:00:00', '2026-07-08 22:30:37'),
(22, 20260040, 6, 76667, 'INDEFINI', 'INDEFINI', 7, 'INDEFINI', 2, '2026-07-24 23:00:00', '2026-07-08 22:39:34'),
(23, 20260041, 6, 493334, 'INDEFINI', 'INDEFINI', 1, 'INDEFINI', 2, '2026-07-16 23:00:00', '2026-07-08 22:48:43');

DROP TABLE IF EXISTS `PaiementTranche`;
CREATE TABLE `PaiementTranche` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idPaie` int NOT NULL,
  `idTranche` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_paie_tranche` (`idPaie`,`idTranche`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `PaiementTranche` (`id`, `idPaie`, `idTranche`) VALUES 
(1, 21, 1017),
(2, 21, 1018),
(3, 22, 1019),
(4, 23, 1020),
(5, 23, 1021);

DROP TABLE IF EXISTS `ParentEleve`;
CREATE TABLE `ParentEleve` (
  `idParentEleve` int NOT NULL AUTO_INCREMENT,
  `idPers` int NOT NULL,
  `matricule` varchar(60) NOT NULL,
  PRIMARY KEY (`idParentEleve`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `ParentEleve` (`idParentEleve`, `idPers`, `matricule`) VALUES 
(1, 5, 'CM-2026-004'),
(2, 5, 'CM-2026-001'),
(3, 1, '20260004'),
(4, 42, '58499821'),
(5, 112, '58499821');

DROP TABLE IF EXISTS `Parents`;
CREATE TABLE `Parents` (
  `idParent` int unsigned NOT NULL AUTO_INCREMENT,
  `idPers` int unsigned NOT NULL,
  `matricule` varchar(255) NOT NULL,
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idParent`),
  UNIQUE KEY `uniqueParent` (`idPers`,`matricule`) USING BTREE,
  UNIQUE KEY `parents_id_pers_matricule` (`idPers`,`matricule`),
  KEY `enft` (`matricule`),
  CONSTRAINT `parents` FOREIGN KEY (`idPers`) REFERENCES `Personne` (`idPers`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1022 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Parents` (`idParent`, `idPers`, `matricule`, `idAdmin`, `created_at`, `isDelete`) VALUES 
(1, 1, '1', 1, '2026-05-25 07:19:49', 0),
(1004, 42, '58499821', 1000, '2026-05-29 08:10:00', 0),
(1017, 112, '58499821', 22, '2026-07-08 14:42:18', 0);

DROP TABLE IF EXISTS `PaymentModes`;
CREATE TABLE `PaymentModes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
DROP TABLE IF EXISTS `Personne`;
CREATE TABLE `Personne` (
  `idPers` int unsigned NOT NULL AUTO_INCREMENT,
  `typePersonne` tinyint NOT NULL,
  `password` varchar(255) NOT NULL,
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  `sexe` smallint unsigned DEFAULT '0' COMMENT '0 = femme, 1 = homme 2 = autres',
  `photoURL` varchar(255) DEFAULT '/uploads/anonym.png',
  `email` varchar(255) DEFAULT NULL,
  `login` varchar(100) DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `langue` varchar(10) NOT NULL DEFAULT 'fr',
  `nom` varchar(60) DEFAULT NULL,
  `prenom` varchar(60) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `dateNaissance` date DEFAULT NULL,
  `lieuNaissance` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`idPers`),
  UNIQUE KEY `login` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Personne` (`idPers`, `typePersonne`, `password`, `idAdmin`, `created_at`, `isDelete`, `sexe`, `photoURL`, `email`, `login`, `actif`, `createdAt`, `updatedAt`, `langue`, `nom`, `prenom`, `mobile`, `phone`, `username`, `dateNaissance`, `lieuNaissance`) VALUES 
(26, 1, '$2b$10$BbZOpKM38X2ox50xflpbkeEsfOHgJr/g3VnoYRCYvMCUMykGM2VPO', 1005, '2026-05-28 13:20:20', 0, 0, 'INDEFINI', 'test@gmail.com', 'user_26', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', NULL, NULL, NULL, NULL, 'admin', NULL, NULL),
(27, 1, 'testeur', 1005, '2026-05-28 13:20:20', 0, 0, 'INDEFINI', 'testeur@gmail.com', 'user_27', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(30, 1, 'tat', 1005, '2026-05-28 13:20:20', 0, 0, 'INDEFINI', 'tat@gmail.com', 'user_30', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(37, 1, 'HYwM66Z0', 3697806282, '2026-05-28 13:23:22', 0, 1, 'INDEFINI', 'ngoune2019@gmail.com', 'user_37', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(40, 2, '1234', 3697806282, '2026-05-29 07:12:10', 0, 0, 'INDEFINI', NULL, 'user_40', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(41, 3, '1234', 1, '2026-05-29 07:27:40', 1, 0, 'INDEFINI', NULL, 'user_41', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(42, 3, 'test1234', 1000, '2026-05-29 08:09:59', 0, 0, 'INDEFINI', NULL, 'user_42', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', 'atangana', 'la piqure', '672344567', '655677890', NULL, NULL, NULL),
(56, 4, 'PkUTFPIy', 3697806282, '2026-05-29 17:25:29', 0, 1, '/uploads/parents/photo-1780079128054-234074996.png', 'chounfouenjames6@gmail.com', 'user_56', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(57, 4, 'yc1SpQfX', 3697806282, '2026-05-29 17:25:43', 0, 1, '/uploads/parents/photo-1780079142274-24458311.png', 'chounfouenjames6@gmail.com', 'user_57', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(58, 4, 'vAlVREoM', 3697806282, '2026-05-29 17:26:47', 0, 1, '/uploads/parents/photo-1780079206304-810786742.png', 'chounfouenjames6@gmail.com', 'user_58', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(59, 4, 'l3ypQ2V8', 3697806282, '2026-05-29 17:32:48', 0, 1, '/uploads/parents/photo-1780079566277-691703399.png', 'chounfouenjames6@gmail.com', 'user_59', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(60, 4, 'Ut0tNhqZ', 3697806282, '2026-05-30 03:30:13', 0, 1, '/uploads/parents/photo-1780115412479-883956865.png', 'chounfouenjames6@gmail.com', 'user_60', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(61, 4, 'KuITYcg0', 3697806282, '2026-05-30 03:33:49', 0, 1, '/uploads/parents/photo-1780115627907-428291160.png', 'chounfouenjames6@gmail.com', 'user_61', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(68, 1, 'IdYEqjO9', 3697806282, '2026-05-30 04:19:36', 0, 1, '/uploads/enseignants/photo-1780118375437-58213492.png', 'chounfouenjames6@gmail.com', 'user_68', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(69, 1, 'vfBpJqXD', 3697806282, '2026-05-30 04:20:45', 0, 1, '/uploads/enseignants/photo-1780118444615-493470095.png', 'chounfouenjames6@gmail.com', 'user_69', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(70, 1, 'YIWpBjfG', 3697806282, '2026-05-30 04:22:27', 0, 1, '/uploads/anonym.png', 'chounfouenjames6@gmail.com', 'user_70', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(71, 1, 'WugXJjPL', 3697806282, '2026-05-30 04:24:58', 0, 1, '/uploads/enseignants/photo-1780118696580-958666334.png', 'chounfouenjames6@gmail.com', 'user_71', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(72, 1, 'KPcbQ0Fg', 3697806282, '2026-05-30 04:50:48', 0, 1, '/uploads/enseignants/photo-1780120247117-384874780.png', 'chounfouenjames6@gmail.com', 'user_72', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(73, 1, 'S1VwBxIm', 3697806282, '2026-05-30 04:59:17', 0, 1, '/uploads/enseignants/photo-1780120755919-561451299.png', 'chounfouenjames6@gmail.com', 'user_73', 1, '2026-06-03 08:35:35', '2026-06-03 08:35:36', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(74, 1, 'ezKQ4BUr', 12, '2026-06-15 18:49:40', 0, 1, '/uploads/anonym.png', 'chounfouenjames6@gmail.com', NULL, 1, '2026-06-15 18:49:39', '2026-06-15 18:49:39', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(75, 4, 'qaaQo7MY', 12, '2026-06-15 20:10:20', 0, 1, '/uploads/parents/photo-1781557819583-516397989.png', 'chounfouenjames6@gmail.com', NULL, 1, '2026-06-15 20:10:20', '2026-06-15 20:10:20', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(76, 4, '99sVd1XQ', 12, '2026-06-15 20:13:30', 0, 1, '', 'chounfouenjames6@gmail.com', NULL, 1, '2026-06-15 20:13:30', '2026-06-15 20:13:30', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(77, 4, 'oQjuWKTK', 12, '2026-06-15 20:15:21', 0, 1, '', 'chounfouenjames6@gmail.com', NULL, 1, '2026-06-15 20:15:20', '2026-06-15 20:15:20', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(78, 4, 'Tn3t8pnY', 12, '2026-06-15 20:17:52', 0, 1, '', 'chounfouenjames6@gmail.com', NULL, 1, '2026-06-15 20:17:52', '2026-06-15 20:17:52', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(79, 1, 'OOJYVBbf', 12, '2026-06-15 20:23:02', 0, 1, '/uploads/anonym.png', 'chounfouenjames6@gmail.com', NULL, 1, '2026-06-15 20:23:02', '2026-06-15 20:23:02', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(80, 1, 'xhOpERq6', 12, '2026-06-15 20:24:42', 0, 1, '/uploads/anonym.png', 'chounfouenjames6@gmail.com', NULL, 1, '2026-06-15 20:24:42', '2026-06-15 20:24:42', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(81, 1, 'zmXMXCya', 12, '2026-06-15 20:26:15', 0, 1, '/uploads/anonym.png', 'rudel2978@gmail.com', NULL, 1, '2026-06-15 20:26:15', '2026-06-15 20:26:15', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(82, 1, 'BzcORVoK', 12, '2026-06-15 20:31:34', 0, 1, '/uploads/anonym.png', 'rudel2978@gmail.com', NULL, 1, '2026-06-15 20:31:34', '2026-06-15 20:31:34', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(83, 1, '0eeXcBW7', 12, '2026-06-15 20:35:09', 0, 1, '/uploads/anonym.png', 'rudel2978@gmail.com', NULL, 1, '2026-06-15 20:35:09', '2026-06-15 20:35:09', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(84, 1, 'UqpJlPz2', 12, '2026-06-15 20:37:05', 0, 1, '/uploads/anonym.png', 'rudel2978@gmail.com', NULL, 1, '2026-06-15 20:37:05', '2026-06-15 20:37:05', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(85, 4, 'cV2o5ptL', 12, '2026-06-15 20:38:20', 0, 1, '', 'chounfouenjames6@gmail.com', NULL, 1, '2026-06-15 20:38:20', '2026-06-15 20:38:20', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(86, 4, '$2b$10$vbytfiKqf24x7x7EnQUTouxUg75/Zk77gh2Vw2qcsSdpT4kQtzRje', 12, '2026-06-15 20:41:29', 0, 1, '', 'chounfouenjames6@gmail.com', NULL, 1, '2026-06-15 20:41:29', '2026-06-15 20:41:29', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(87, 2, '$2a$12$evkbXvIiIqOWc/Uf/Xa6u.PkYUTsrYSAg602fxNQX2T8lyW1FUUE2', 6, '2026-06-16 18:41:31', 0, 0, '/uploads/anonym.png', NULL, 'parent_test', 1, '2026-06-16 18:41:31', '2026-06-16 18:41:31', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(88, 1, '$2a$12$evkbXvIiIqOWc/Uf/Xa6u.PkYUTsrYSAg602fxNQX2T8lyW1FUUE2', 6, '2026-06-16 18:41:32', 0, 0, '/uploads/anonym.png', NULL, 'enseignant_test', 1, '2026-06-16 18:41:32', '2026-06-16 18:41:32', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(91, 1, '$2a$12$3nMNPJFkYOUepKqvq0ZpTehXRfxhvwDxve9oB5iqVcC4ujVHC37Cq', 1, '2026-06-17 01:52:21', 0, 0, '/uploads/anonym.png', NULL, 'teacher_2026', 1, '2026-06-17 01:52:21', '2026-06-17 01:52:21', 'fr', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(92, 2, '$2b$10$5UBoSVzd3lOLdLrKi4bPKupEe82dUGMMduOwLBc06MHI3FD/njLey', 7, '2026-06-19 13:47:21', 0, 0, '/uploads/anonym.png', NULL, NULL, 1, '2026-06-19 13:47:21', '2026-06-19 13:47:21', 'fr', 'lapiqure', 'lapiqure', '67788888888', '67777777', 'lapiqure', '2026-06-19 23:00:00', 'yaounde'),
(93, 2, '1234', 1, '2026-06-19 17:21:40', 0, 0, '/uploads/anonym.png', NULL, NULL, 1, '2026-06-19 17:21:40', '2026-06-19 17:21:40', 'fr', 'PIQURE', 'Test', '+237690000000', '', 'piqure', '1989-12-31 23:00:00', 'Yaoundé'),
(94, 2, '1234', 1, '2026-06-19 17:23:14', 0, 0, '/uploads/anonym.png', NULL, NULL, 1, '2026-06-19 17:23:14', '2026-06-19 17:23:14', 'fr', 'PIQURE_UPDATED', 'Test', '+237690000002', '', '', '1989-12-31 23:00:00', 'Yaoundé'),
(95, 2, 'test123', 1, '2026-06-19 17:24:01', 0, 0, '/uploads/anonym.png', NULL, NULL, 1, '2026-06-19 17:24:01', '2026-06-19 17:24:01', 'fr', 'TEST', 'Enseignant', '+237690000001', '', 'test.ens', '1999-12-31 23:00:00', ''),
(96, 2, 'test123', 1, '2026-06-19 17:28:55', 0, 0, '/uploads/anonym.png', NULL, NULL, 1, '2026-06-19 17:28:55', '2026-06-19 17:28:55', 'fr', 'TEST2', 'Enseignant', '+237690000003', '', 'test.ens2', '1999-12-31 23:00:00', ''),
(97, 2, 'test123', 1, '2026-06-19 17:34:57', 0, 0, '/uploads/anonym.png', NULL, NULL, 1, '2026-06-19 17:34:57', '2026-06-19 17:34:57', 'fr', 'TEST2', 'Enseignant', '+237690000003', '', 'test.ens2', '1999-12-31 23:00:00', ''),
(98, 3, '1234', 1, '2026-06-19 17:36:14', 0, 0, '/uploads/anonym.png', NULL, NULL, 1, '2026-06-19 17:36:14', '2026-06-19 17:36:14', 'fr', 'TEST2', 'Enseignant', '+237690000003', '', 'junior', '1999-12-31 23:00:00', ''),
(99, 1, '$2b$12$yP1YPxbdTmX.n0CcTFXi5e3wcWEu.aF0CVQ459UPSua1qoplcdjra', 1, '2026-06-22 21:08:29', 0, 0, '/uploads/anonym.png', NULL, 'enseignant', 1, '2026-06-22 21:08:29', '2026-06-22 21:08:29', 'fr', 'Amrani', 'Hassan', '+213555000010', NULL, NULL, NULL, NULL),
(100, 2, '$2b$12$8E1.yONCOG7lBIX/KXVwL.Gsb/h.x6jH9G5GeviWMPEWzMKj2OOrG', 1, '2026-06-22 21:08:29', 0, 0, '/uploads/anonym.png', NULL, 'parent', 1, '2026-06-22 21:08:29', '2026-06-22 21:08:29', 'fr', 'Khelil', 'Mohamed', '+213555000020', NULL, NULL, NULL, NULL),
(101, 3, '1234', 14, '2026-06-30 07:20:30', 0, 0, '/uploads/anonym.png', NULL, NULL, 1, '2026-06-30 07:20:30', '2026-06-30 07:20:30', 'fr', 'jeromej', 'junior', '677777777777777', '677777777777', '', '1999-12-31 23:00:00', ''),
(102, 3, '1234', 14, '2026-06-30 07:20:34', 0, 0, '/uploads/anonym.png', NULL, NULL, 1, '2026-06-30 07:20:34', '2026-06-30 07:20:34', 'fr', 'jeromej', 'junior', '677777777777777', '677777777777', '', '1999-12-31 23:00:00', ''),
(103, 3, '1234', 14, '2026-06-30 09:59:54', 0, 0, '/uploads/anonym.png', NULL, NULL, 1, '2026-06-30 09:59:54', '2026-06-30 09:59:54', 'fr', 'junior', 'junior', '7765555555555555555', '45666666666666666666', '', '1999-12-31 23:00:00', ''),
(104, 3, '1234 ', 1000, '2026-07-01 07:49:15', 0, 0, '/uploads/anonym.png', NULL, NULL, 1, '2026-07-01 07:49:15', '2026-07-01 07:49:15', 'fr', 'Parent', 'Test', '', '', 'junior ', '1999-12-31 23:00:00', ''),
(105, 2, '$2a$10$cFjCp8ycXyKxB1nCrQd1deNIgJLTi3dsRTZ8nRBmXK4RaXUH2zMIe', 1, '2026-07-02 09:11:51', 0, 0, '/uploads/anonym.png', NULL, NULL, 1, '2026-07-02 09:11:51', '2026-07-02 09:11:51', 'fr', 'TEST', 'Enseignant', '0612345678', '', 'test_enseignant', '1999-12-31 23:00:00', ''),
(106, 3, '$2a$10$cFjCp8ycXyKxB1nCrQd1deNIgJLTi3dsRTZ8nRBmXK4RaXUH2zMIe', 1, '2026-07-02 09:11:54', 0, 0, '/uploads/anonym.png', NULL, NULL, 1, '2026-07-02 09:11:54', '2026-07-02 09:11:54', 'fr', 'TEST', 'Parent', '0698765432', '', 'test_parent', '1999-12-31 23:00:00', ''),
(107, 2, '$2b$10$TVyNBkbTUIMgnegwe9qn.O3LTkDxhdTxrthcW.C0SZ1o28n6f4b.O', 22, '2026-07-08 12:00:11', 0, 0, '/uploads/anonym.png', NULL, NULL, 1, '2026-07-08 12:00:11', '2026-07-08 12:00:11', 'fr', 'eyenga', 'zambo', '657704657', '672777491', 'zambo', '2005-07-17 23:00:00', 'yaounde'),
(108, 3, '1234', 22, '2026-07-08 14:09:22', 0, 0, '/uploads/anonym.png', NULL, NULL, 1, '2026-07-08 14:09:22', '2026-07-08 14:09:22', 'fr', 'gjbnbbj', 'jkklm;k', 'gujhbn', 'hnbnh', '', '1999-12-31 23:00:00', ''),
(109, 3, '$2a$10$y.BgBIgilnPF4wqPP.owI.gygjGOZsJO2wpUDS48s6CXE7kUQyzF6', 2, '2026-07-08 14:27:33', 0, 0, '/uploads/anonym.png', 'modibo.traore@test.com', 'modibo.traore@test.com', 1, '2026-07-08 14:27:33', '2026-07-08 14:27:33', 'fr', 'Traore', 'Modibo', '698765432', NULL, NULL, NULL, NULL),
(111, 3, '$2a$10$QKwBwy8418dCW.exjzfkduY64vtfahuuJguH4heehLVwCrSVg1ETS', 2, '2026-07-08 14:32:07', 0, 0, '/uploads/anonym.png', 'per@cm', 'per@cm', 1, '2026-07-08 14:32:07', '2026-07-08 14:32:07', 'fr', 'per', '', '', NULL, NULL, NULL, NULL),
(112, 3, '1234', 22, '2026-07-08 14:42:17', 0, 0, '/uploads/anonym.png', NULL, NULL, 1, '2026-07-08 14:42:17', '2026-07-08 14:42:17', 'fr', 'paul', 'francois', '67346566778', '674567590', '', '1999-12-31 23:00:00', ''),
(114, 3, '$2a$10$xk7Q8kJRuUj2519QV6Ed8.at9nGM5cPuIyZSnj/jY6hrsss.9rXta', 2, '2026-07-08 16:09:43', 0, 0, '/uploads/anonym.png', 'perty@cm', 'perty@cm', 1, '2026-07-08 16:09:43', '2026-07-08 16:09:43', 'fr', 'perty', '', '678405840', NULL, NULL, NULL, NULL),
(115, 3, '$2a$10$lGIHhoaa63a4AOimw2.Je.jIstN1PV.oMhqAGQQi1DmhOVrw6/Lzy', 2, '2026-07-08 16:35:27', 0, 0, '/uploads/anonym.png', 'loris@ecole.test', 'loris@ecole.test', 1, '2026-07-08 16:35:27', '2026-07-08 16:35:27', 'fr', 'Tamgue', 'Loris', '694637836', NULL, NULL, NULL, NULL),
(116, 2, '$2b$10$9AqJmghHxEQ1tqHDnWiF1u5gCi4Ra1zeTGFLsiOiZaL5pyP9B0S/W', 22, '2026-07-08 17:39:59', 0, 0, '/uploads/anonym.png', NULL, NULL, 1, '2026-07-08 17:39:59', '2026-07-08 17:39:59', 'fr', 'eyega', 'andy', '657704657', '672777491', 'eyenga', '2005-07-17 23:00:00', 'ebolowa'),
(117, 2, '$2b$10$WggEf8xkB2LSXZl8po0DV.791eVC2ekkcxQ7TSz4m4dHSKVVCC5om', 22, '2026-07-08 18:09:14', 0, 0, '/uploads/anonym.png', NULL, NULL, 1, '2026-07-08 18:09:14', '2026-07-08 18:09:14', 'fr', 'doutse', 'shinto', '620242728', '', 'doutse', '2003-08-11 23:00:00', 'bertoua'),
(118, 3, '$2a$10$9D8twXUZb5uAkrY3NQo0OeM5LWmGH93qOO/0e8vF4LU3nnj5Xji1C', 2, '2026-07-08 18:59:56', 0, 0, '/uploads/anonym.png', 's', 's', 1, '2026-07-08 18:59:56', '2026-07-08 18:59:56', 'fr', 's', 's', '', NULL, NULL, NULL, NULL);

DROP TABLE IF EXISTS `Quartier`;
CREATE TABLE `Quartier` (
  `idQuartier` int unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(100) NOT NULL,
  `description` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`idQuartier`)
) ENGINE=InnoDB AUTO_INCREMENT=1002 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Quartier` (`idQuartier`, `libelle`, `description`) VALUES 
(1, 'Obili', 'hello'),
(1000, 'Bab Ezzouar', 'Zone universitaire est d\'Alger'),
(1001, 'Hydra', 'Quartier résidentiel d\'Alger');

DROP TABLE IF EXISTS `Rapport`;
CREATE TABLE `Rapport` (
  `idRap` int unsigned NOT NULL AUTO_INCREMENT,
  `matricule` int unsigned NOT NULL,
  `idAca` int unsigned NOT NULL,
  `commentaire` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `event_date` date NOT NULL,
  `idPers` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  `idDiscipline` int unsigned DEFAULT NULL,
  PRIMARY KEY (`idRap` DESC),
  KEY `enfant` (`matricule`),
  KEY `discipline_rapport` (`idDiscipline`),
  KEY `Rapport_idAca_AnneeAcademique_idAnnee_fk` (`idAca`),
  CONSTRAINT `annees` FOREIGN KEY (`idAca`) REFERENCES `AnneeAcademique` (`idAnnee`) ON UPDATE CASCADE,
  CONSTRAINT `discipline_rapport` FOREIGN KEY (`idDiscipline`) REFERENCES `Discipline` (`ID`),
  CONSTRAINT `enfant` FOREIGN KEY (`matricule`) REFERENCES `Eleve` (`matricule`) ON UPDATE CASCADE,
  CONSTRAINT `Rapport_idAca_AnneeAcademique_idAnnee_fk` FOREIGN KEY (`idAca`) REFERENCES `AnneeAcademique` (`idAnnee`)
) ENGINE=InnoDB AUTO_INCREMENT=1012 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Rapport` (`idRap`, `matricule`, `idAca`, `commentaire`, `event_date`, `idPers`, `created_at`, `isDelete`, `idDiscipline`) VALUES 
(1011, 20260013, 6, 'css', '2026-07-07 23:00:00', 2, '2026-07-08 17:44:56', 0, 29),
(1010, 20260013, 6, 'css', '2026-07-07 23:00:00', 2, '2026-07-08 17:44:55', 0, 28),
(1009, 20260013, 6, '', '2026-07-07 23:00:00', 2, '2026-07-08 17:44:32', 0, 27),
(1008, 20260012, 6, 'Arrivé en retard', '2026-07-07 23:00:00', 1, '2026-07-08 17:41:30', 0, 26),
(1007, 20260012, 1, 'test', '2026-07-07 23:00:00', 1, '2026-07-08 17:39:31', 0, 25),
(1004, 20260005, 1, 'vol', '2026-06-14 23:00:00', 12, '2026-06-15 20:22:06', 0, 16),
(1003, 20260010, 1, 'vandal', '2026-06-14 23:00:00', 12, '2026-06-15 20:19:16', 0, 14),
(1002, 20260010, 1, 'vole à main armé', '2026-06-14 23:00:00', 12, '2026-06-15 20:07:25', 0, 15),
(1001, 72215111, 1, 'eleve un peu derangeans', '2026-05-19 23:00:00', 1000, '2026-05-20 11:48:30', 0, NULL),
(1000, 72215111, 1, 'eleve un peu derangeans', '2026-05-19 23:00:00', 1000, '2026-05-20 11:48:30', 0, NULL);

DROP TABLE IF EXISTS `RefreshTokens`;
CREATE TABLE `RefreshTokens` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `userId` int unsigned NOT NULL,
  `userType` enum('admin','personne') NOT NULL,
  `token` varchar(512) NOT NULL,
  `expiresAt` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`)
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `RefreshTokens` (`id`, `userId`, `userType`, `token`, `expiresAt`, `createdAt`, `updatedAt`) VALUES 
(1, 1, 'admin', '0abd8a7f-7c26-4016-95f3-a4465d011ae5', '2026-05-28 02:33:14', '2026-05-21 02:33:14', '2026-05-21 02:33:14'),
(2, 1, 'admin', '5236e1d3-0155-490b-8946-891752326a79', '2026-05-28 02:33:16', '2026-05-21 02:33:16', '2026-05-21 02:33:16'),
(3, 1, 'admin', 'f768295a-a3ae-4763-8a36-5cf2e02cbcd1', '2026-05-28 03:35:22', '2026-05-21 03:35:22', '2026-05-21 03:35:22'),
(4, 1, 'admin', 'f92eb9ea-16e7-4072-999d-6896e3f16ba4', '2026-06-01 02:15:08', '2026-05-25 02:15:08', '2026-05-25 02:15:08'),
(5, 1, 'admin', 'd2703b55-51cf-413e-bbf2-ac9be9483fc4', '2026-06-01 02:15:44', '2026-05-25 02:15:44', '2026-05-25 02:15:44'),
(6, 1, 'admin', '26d62aa8-03f5-41e9-86d9-ff62cbd9fed7', '2026-06-01 02:16:35', '2026-05-25 02:16:35', '2026-05-25 02:16:35'),
(7, 1, 'admin', 'd3095264-9baf-4d4e-902e-f3138d07c061', '2026-06-01 02:20:18', '2026-05-25 02:20:18', '2026-05-25 02:20:18'),
(8, 1, 'admin', '1b99cb55-4fa9-4097-a91d-aac032ace4c7', '2026-06-01 02:20:57', '2026-05-25 02:20:57', '2026-05-25 02:20:57'),
(9, 1, 'admin', '80b87191-f010-4be0-bc7a-860754c39d9f', '2026-06-01 02:23:16', '2026-05-25 02:23:16', '2026-05-25 02:23:16'),
(10, 1, 'admin', 'b3edc0af-27bf-4c74-84c4-5c2a74ab83e3', '2026-06-01 02:23:42', '2026-05-25 02:23:42', '2026-05-25 02:23:42'),
(11, 1005, 'admin', 'ea0c5eab-bafa-4a5c-9f15-706fceff86fa', '2026-06-01 02:27:46', '2026-05-25 02:27:46', '2026-05-25 02:27:46'),
(12, 1, 'admin', '3b7c40d1-d7b0-4008-a351-a225952b8e83', '2026-06-01 08:21:16', '2026-05-25 08:21:16', '2026-05-25 08:21:16'),
(13, 24, 'personne', '501e3a9b-7d86-48ae-9f4f-55266da15981', '2026-06-01 08:21:20', '2026-05-25 08:21:20', '2026-05-25 08:21:20'),
(14, 25, 'personne', 'cf0b7d9c-890b-4c6c-be51-833c3dde1f61', '2026-06-01 08:21:23', '2026-05-25 08:21:23', '2026-05-25 08:21:23'),
(15, 1, 'admin', '39fb1d29-3236-4dd8-ab88-42ba8407ced9', '2026-06-01 08:32:44', '2026-05-25 08:32:44', '2026-05-25 08:32:44'),
(16, 3697806280, 'admin', '67cfbe93-e2bd-4b93-af1c-b71a3f080905', '2026-06-01 08:33:21', '2026-05-25 08:33:21', '2026-05-25 08:33:21'),
(17, 24, 'personne', 'f12846ce-4aef-4b37-9833-37c16074ee7d', '2026-06-01 08:33:24', '2026-05-25 08:33:24', '2026-05-25 08:33:24'),
(18, 25, 'personne', 'a3a42850-b87b-41fa-8a93-24fa162a2c4c', '2026-06-01 08:40:15', '2026-05-25 08:40:15', '2026-05-25 08:40:15'),
(19, 25, 'personne', '4dcf7930-0026-4b5e-8712-1e1deaf24f12', '2026-06-01 08:42:33', '2026-05-25 08:42:33', '2026-05-25 08:42:33'),
(21, 3697806280, 'admin', 'afc9076a-a6cc-476a-b762-8e4665f8eeec', '2026-06-01 08:44:13', '2026-05-25 08:44:13', '2026-05-25 08:44:13'),
(22, 3697806280, 'admin', '09027a49-a3d5-4200-9e68-9518026d3ce7', '2026-06-01 08:49:04', '2026-05-25 08:49:04', '2026-05-25 08:49:04'),
(25, 25, 'personne', 'ad14762c-a3a2-4846-abf8-13b7c01bf545', '2026-06-01 10:06:20', '2026-05-25 10:06:20', '2026-05-25 10:06:20'),
(26, 25, 'personne', 'b1cc9db1-295f-40f1-8e32-85614d3315ab', '2026-06-01 10:10:56', '2026-05-25 10:10:56', '2026-05-25 10:10:56'),
(27, 25, 'personne', '1bb40cbb-5789-48c2-bfa8-83709e871848', '2026-06-01 10:11:31', '2026-05-25 10:11:31', '2026-05-25 10:11:31'),
(30, 25, 'personne', 'ccd14caa-767a-4f56-96a4-639f297ca4d7', '2026-06-01 10:27:48', '2026-05-25 10:27:48', '2026-05-25 10:27:48'),
(34, 24, 'personne', '748f5d6e-4b6b-4d9d-8155-14ef4a6e20f6', '2026-06-01 15:52:32', '2026-05-25 15:52:32', '2026-05-25 15:52:32'),
(35, 1, 'admin', 'e894fa39-0d5f-4816-b938-4c75b15bc687', '2026-06-02 19:13:56', '2026-05-26 19:13:56', '2026-05-26 19:13:56'),
(38, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJhZG1pbl9yb290Iiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjowLCJpYXQiOjE3ODA0MDM5MzYsImV4cCI6MTc4MTAwODczNn0.jznWP2pUHCHeAWPWSkVDBTj03yQnGoVF9jleFKyp-u8', '2026-06-09 11:38:56', '2026-06-02 11:38:56', '2026-06-02 11:38:56'),
(39, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODA0MTMyODcsImV4cCI6MTc4MTAxODA4N30.h2u_XE-J0-VHFnBU1gbk3EnTyXvgvM4wFG85exA9rTs', '2026-06-09 14:14:47', '2026-06-02 14:14:47', '2026-06-02 14:14:47'),
(40, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODA0Mjg5NjYsImV4cCI6MTc4MTAzMzc2Nn0.eBPa0JMq9OcNsQv5WnAaLbqkAn_cTGXrbHduQQMfFgU', '2026-06-09 18:36:06', '2026-06-02 18:36:06', '2026-06-02 18:36:06'),
(41, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODA0MzA2ODksImV4cCI6MTc4MTAzNTQ4OX0.ABt4qLj1ebRZZBqikrILKehEdOgmDmC7sRGrwgEvfpc', '2026-06-09 19:04:49', '2026-06-02 19:04:49', '2026-06-02 19:04:49'),
(42, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJhZG1pbl9yb290Iiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjowLCJpYXQiOjE3ODA0MzA3MzMsImV4cCI6MTc4MTAzNTUzM30.RbQVA_z-O8DjD64iA_QcwW3c_681wia3zIFwp3JRjEc', '2026-06-09 19:05:33', '2026-06-02 19:05:33', '2026-06-02 19:05:33'),
(43, 3, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywibG9naW4iOiJhZG1pbl9zY29sIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoyLCJpYXQiOjE3ODA0MzA4OTksImV4cCI6MTc4MTAzNTY5OX0.5wZK7zPNv7-Ac7i1VfKUpq3zpo3VQ4di9fgDr-AJgFM', '2026-06-09 19:08:19', '2026-06-02 19:08:19', '2026-06-02 19:08:19'),
(44, 3, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywibG9naW4iOiJhZG1pbl9zY29sIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoyLCJpYXQiOjE3ODA0MzA5NDIsImV4cCI6MTc4MTAzNTc0Mn0.s3YT7X0HX_JQd53y06Wp9oFcWiz3YOQAhGU257Mr0Xc', '2026-06-09 19:09:02', '2026-06-02 19:09:02', '2026-06-02 19:09:02'),
(45, 3, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywibG9naW4iOiJhZG1pbl9zY29sIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoyLCJpYXQiOjE3ODA0MzA5ODQsImV4cCI6MTc4MTAzNTc4NH0.1MBRvOuQRmgP3ZzpCpPiWubFGsfTJlXw89e5-D1UVss', '2026-06-09 19:09:44', '2026-06-02 19:09:44', '2026-06-02 19:09:44'),
(46, 3, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywibG9naW4iOiJhZG1pbl9zY29sIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoyLCJpYXQiOjE3ODA0MzEwMDQsImV4cCI6MTc4MTAzNTgwNH0.GT5VTYvdjyTGV_z2gEKhirXhxsBEZQhovBpa0GaReT8', '2026-06-09 19:10:04', '2026-06-02 19:10:04', '2026-06-02 19:10:04'),
(47, 4, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwibG9naW4iOiJhZG1pbl9mb25kIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjozLCJpYXQiOjE3ODA0MzEwMzUsImV4cCI6MTc4MTAzNTgzNX0.SkYIhMCjG85kRcTpQis7ogDkFgR3314NHwoUOG79YZg', '2026-06-09 19:10:35', '2026-06-02 19:10:35', '2026-06-02 19:10:35'),
(48, 5, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwibG9naW4iOiJhZG1pbl9kaXIiLCJyb2xlIjoiQURNSU4iLCJ0eXBlQWRtaW4iOjQsImlhdCI6MTc4MDQzMTExNywiZXhwIjoxNzgxMDM1OTE3fQ.wFm81oqGyfrqQkeZzF92NW6TiOdyc5ndLNJAHunjGkM', '2026-06-09 19:11:57', '2026-06-02 19:11:57', '2026-06-02 19:11:57'),
(49, 6, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwibG9naW4iOiJhZG1pbl9hdWQiLCJyb2xlIjoiQURNSU4iLCJ0eXBlQWRtaW4iOjUsImlhdCI6MTc4MDQzMTIxMSwiZXhwIjoxNzgxMDM2MDExfQ.EK8EsJYGTIpMfiGCzzBNovFXC1-xzJ5cEwXeqarLdMs', '2026-06-09 19:13:31', '2026-06-02 19:13:31', '2026-06-02 19:13:31'),
(50, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJhZG1pbl9yb290Iiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjowLCJpYXQiOjE3ODA0Nzc0ODYsImV4cCI6MTc4MTA4MjI4Nn0.PFowbxPt7iJbDHC6hjdG2YYqcU-An2JJpFPZUl-RxC8', '2026-06-10 08:04:46', '2026-06-03 08:04:46', '2026-06-03 08:04:46'),
(51, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJhZG1pbl9yb290Iiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjowLCJpYXQiOjE3ODA0NzgyNTUsImV4cCI6MTc4MTA4MzA1NX0.vnoORHGbJlThzn5lQvcdhffaZTVYN30Qd4aCsynD2yQ', '2026-06-10 08:17:35', '2026-06-03 08:17:35', '2026-06-03 08:17:35'),
(52, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODA0Nzg2MDEsImV4cCI6MTc4MTA4MzQwMX0.d6p3h5-WJ0bpxL2mt3Ba4f-8EN_3c6Iyx86N0rIaS4I', '2026-06-10 08:23:21', '2026-06-03 08:23:21', '2026-06-03 08:23:21'),
(53, 3, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywibG9naW4iOiJhZG1pbl9zY29sIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoyLCJpYXQiOjE3ODA0Nzg2MzUsImV4cCI6MTc4MTA4MzQzNX0.K4FGaJ8wfqw5cc-zd4u-AbCDdoOFSDqavz38i2ifuhM', '2026-06-10 08:23:55', '2026-06-03 08:23:55', '2026-06-03 08:23:55'),
(54, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODA0NzkwMzQsImV4cCI6MTc4MTA4MzgzNH0.TFDOJrqRAT13v3rOXg1wrRhbqqszoiVT_GCJrJP9klA', '2026-06-10 08:30:34', '2026-06-03 08:30:34', '2026-06-03 08:30:34'),
(55, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJhZG1pbl9yb290Iiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjowLCJpYXQiOjE3ODA0ODAxMTcsImV4cCI6MTc4MTA4NDkxN30.YapnxZ9w49hNHrX5Ue4zzPKQPd6zAdzfyo9ve2B3X98', '2026-06-10 08:48:37', '2026-06-03 08:48:37', '2026-06-03 08:48:37'),
(56, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODA1NTc2NTgsImV4cCI6MTc4MTE2MjQ1OH0.pfYUU0FbN3LdrjYtHeFTlWYpfvwG1o5VraRh-e294j0', '2026-06-11 06:20:58', '2026-06-04 06:20:58', '2026-06-04 06:20:58'),
(57, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODA1NTkxNjYsImV4cCI6MTc4MTE2Mzk2Nn0.DFTFk6xLhXcUGBlw2nW8unCM7mAgUCD8xAGecvtTmTE', '2026-06-11 06:46:06', '2026-06-04 06:46:06', '2026-06-04 06:46:06'),
(58, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODA1NTk0MTUsImV4cCI6MTc4MTE2NDIxNX0.ens5NUoiYxL4lQJdTdxHXdjFPPG7_BGey5V1T9wB3YI', '2026-06-11 06:50:15', '2026-06-04 06:50:15', '2026-06-04 06:50:15'),
(59, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODA1NTk5MDcsImV4cCI6MTc4MTE2NDcwN30.RM4jhdN9tQv0ijYXAj5wstINPvo5ZMFosg9HMiQZd0E', '2026-06-11 06:58:27', '2026-06-04 06:58:27', '2026-06-04 06:58:27'),
(60, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODA1NjAxMDgsImV4cCI6MTc4MTE2NDkwOH0.WjihpJz49fL4dbnJSNVFI8V_SNcMyfJFlJUe4PAsNLY', '2026-06-11 07:01:48', '2026-06-04 07:01:48', '2026-06-04 07:01:48'),
(61, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODA1NjIxMjYsImV4cCI6MTc4MTE2NjkyNn0.yxQomJfSQJI8dGC_28A7XeZHkGW92jFOX2M2qIHAMTE', '2026-06-11 07:35:26', '2026-06-04 07:35:26', '2026-06-04 07:35:26'),
(62, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODA4OTI5MzQsImV4cCI6MTc4MTQ5NzczNH0.zatj3Qm6ETDPThx22yxfa7V3hW5g14ujqsqqs49nO68', '2026-06-15 03:28:54', '2026-06-08 03:28:54', '2026-06-08 03:28:54'),
(63, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODA4OTM1MjgsImV4cCI6MTc4MTQ5ODMyOH0.CODp0Fxq9PWvYuyDioOB2hAbVa-inciYjoVeqOLLwjc', '2026-06-15 03:38:48', '2026-06-08 03:38:48', '2026-06-08 03:38:48'),
(64, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODA4OTM1OTEsImV4cCI6MTc4MTQ5ODM5MX0.T6NQSApY9zNS2kv1atS88DQKjdwrYvvT2gR0gjXVqj0', '2026-06-15 03:39:51', '2026-06-08 03:39:51', '2026-06-08 03:39:51'),
(65, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODA4OTM3MTEsImV4cCI6MTc4MTQ5ODUxMX0.H62mbeRr2pJgJ8GD-9h5xs1J12-AK2Z33RpFwjNRGoY', '2026-06-15 03:41:51', '2026-06-08 03:41:51', '2026-06-08 03:41:51'),
(66, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODE1OTc0MzcsImV4cCI6MTc4MjIwMjIzN30.SzaVQ1JpCzrY-1O_bkoFndfMxh-1sVzwXLsuCbWkNP8', '2026-06-23 07:10:37', '2026-06-16 07:10:37', '2026-06-16 07:10:37'),
(67, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODE1OTc1MjMsImV4cCI6MTc4MjIwMjMyM30.7JdnBiwbmTl9gZB2hdUz1Nnsk1F92FJ3wYLvUTPawXw', '2026-06-23 07:12:03', '2026-06-16 07:12:03', '2026-06-16 07:12:03'),
(68, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJhZG1pbl9yb290Iiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjowLCJpYXQiOjE3ODE1OTc3MzMsImV4cCI6MTc4MjIwMjUzM30.3XhRd2AhfD5XtIz1V_RPYr2ag0byLeBBy3SimrS3HAY', '2026-06-23 07:15:33', '2026-06-16 07:15:33', '2026-06-16 07:15:33'),
(69, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODE1OTgyNjIsImV4cCI6MTc4MjIwMzA2Mn0.DOP_VAizW8SwbkwpT9D3Nw3KjHwXWQObBs5sTGaosRc', '2026-06-23 07:24:22', '2026-06-16 07:24:22', '2026-06-16 07:24:22'),
(70, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODE1OTgyNjksImV4cCI6MTc4MjIwMzA2OX0.dDWuicixglCNq0VjtyaQVzPZinndzxHfCKJ717yANNc', '2026-06-23 07:24:29', '2026-06-16 07:24:29', '2026-06-16 07:24:29'),
(71, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJhZG1pbl9yb290Iiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjowLCJpYXQiOjE3ODE1OTgzMzgsImV4cCI6MTc4MjIwMzEzOH0.50wZwdipCOR-Xn17TgT1iduPqpJgIIoRDcAEVoruUPQ', '2026-06-23 07:25:38', '2026-06-16 07:25:38', '2026-06-16 07:25:38'),
(72, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODE1OTg0MzAsImV4cCI6MTc4MjIwMzIzMH0.NeS2nrAkHCVsTa4CnWauyZkq4ulTtMAAWDwYU5_wIPo', '2026-06-23 07:27:10', '2026-06-16 07:27:10', '2026-06-16 07:27:10'),
(73, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODE2MjY2NzAsImV4cCI6MTc4MjIzMTQ3MH0.ws_GwzSVDoKby55S5m7O4SsMI_ZJOnWKGcfuKqQHrMM', '2026-06-23 15:17:50', '2026-06-16 15:17:50', '2026-06-16 15:17:50'),
(74, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJhZG1pbl9yb290Iiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjowLCJpYXQiOjE3ODE2MjY4NjYsImV4cCI6MTc4MjIzMTY2Nn0.cMSNTN9V5Lluf5pht4dWzLKGW4qEauH8hghrpMl82Cs', '2026-06-23 15:21:06', '2026-06-16 15:21:06', '2026-06-16 15:21:06'),
(75, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODE2MjY5NzIsImV4cCI6MTc4MjIzMTc3Mn0.QOUjctcxqmZm7wLVxnnZATvqqwKvxvmP6A8Ol0JhLbo', '2026-06-23 15:22:52', '2026-06-16 15:22:52', '2026-06-16 15:22:52'),
(76, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODE2MzQ2NzIsImV4cCI6MTc4MjIzOTQ3Mn0.RJP2w1dGC6khAI351H108kkgFNFoSNQC-oML-kt_g50', '2026-06-23 17:31:12', '2026-06-16 17:31:12', '2026-06-16 17:31:12'),
(77, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJhZG1pbl9yb290Iiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjowLCJpYXQiOjE3ODE2MzUyMTUsImV4cCI6MTc4MjI0MDAxNX0.BSNrpwiWLo-vlPFu7o2t6umGv3PkiT4WVTdIztI4gUs', '2026-06-23 17:40:15', '2026-06-16 17:40:15', '2026-06-16 17:40:15'),
(78, 3, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywibG9naW4iOiJhZG1pbl9zY29sIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoyLCJpYXQiOjE3ODE2NjUzMTgsImV4cCI6MTc4MjI3MDExOH0.2bfXfFoBV14BNJ5DuhXNDijcZfprkMQw2Zt1wpSPNII', '2026-06-24 02:01:58', '2026-06-17 02:01:58', '2026-06-17 02:01:58'),
(79, 4, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwibG9naW4iOiJhZG1pbl9mb25kIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjozLCJpYXQiOjE3ODE2NjU1MDgsImV4cCI6MTc4MjI3MDMwOH0.PfwcQ9whkA6ES3seFFLeyLIuNOsfVyO6RQXGpMxZ3CQ', '2026-06-24 02:05:08', '2026-06-17 02:05:08', '2026-06-17 02:05:08'),
(80, 5, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwibG9naW4iOiJhZG1pbl9kaXIiLCJyb2xlIjoiQURNSU4iLCJ0eXBlQWRtaW4iOjQsImlhdCI6MTc4MTY2NTcyNCwiZXhwIjoxNzgyMjcwNTI0fQ.RllbNTv7eI2FQh9DnA8qcQSfCqRCy_g7B_mD7AUdWvg', '2026-06-24 02:08:44', '2026-06-17 02:08:44', '2026-06-17 02:08:44'),
(81, 6, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwibG9naW4iOiJhZG1pbl9hdWQiLCJyb2xlIjoiQURNSU4iLCJ0eXBlQWRtaW4iOjUsImlhdCI6MTc4MTY2NTgyMSwiZXhwIjoxNzgyMjcwNjIxfQ.NLFcxDWZqdlU2UoNOHkz-ajcpeckCp9rma42vp-Xr4k', '2026-06-24 02:10:21', '2026-06-17 02:10:21', '2026-06-17 02:10:21'),
(82, 91, 'personne', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTEsImxvZ2luIjoidGVhY2hlcl8yMDI2Iiwicm9sZSI6IlRFQUNIRVIiLCJ0eXBlUGVyc29ubmUiOjEsImlhdCI6MTc4MTY2NTkxNywiZXhwIjoxNzgyMjcwNzE3fQ.JiVKPbOXGrw_o8MOon0us5g-dPBz7YvqIHxkqAhj3qM', '2026-06-24 02:11:57', '2026-06-17 02:11:57', '2026-06-17 02:11:57'),
(83, 91, 'personne', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTEsImxvZ2luIjoidGVhY2hlcl8yMDI2Iiwicm9sZSI6IlRFQUNIRVIiLCJ0eXBlUGVyc29ubmUiOjEsImlhdCI6MTc4MTY2NjExNSwiZXhwIjoxNzgyMjcwOTE1fQ.Apu6gujSa4uaMFBAIH9H_vLbcoZ6U1HUYAJs8ELElBo', '2026-06-24 02:15:15', '2026-06-17 02:15:15', '2026-06-17 02:15:15'),
(84, 90, 'personne', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTAsImxvZ2luIjoicGFyZW50XzIwMjYiLCJyb2xlIjoiUEFSRU5UIiwidHlwZVBlcnNvbm5lIjoyLCJpYXQiOjE3ODE2NjYxNDgsImV4cCI6MTc4MjI3MDk0OH0.Qi1QJfMzsfgnT-K6rpaUG_qHjnLO0LJ6lzF6gbMXcyM', '2026-06-24 02:15:48', '2026-06-17 02:15:48', '2026-06-17 02:15:48'),
(85, 90, 'personne', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTAsImxvZ2luIjoicGFyZW50XzIwMjYiLCJyb2xlIjoiUEFSRU5UIiwidHlwZVBlcnNvbm5lIjoyLCJpYXQiOjE3ODE3NjQxODEsImV4cCI6MTc4MjM2ODk4MX0.Vsx8hL0rxuENtIOyAqLkrC6zW8UVeDvPJ09CvtBZaQ0', '2026-06-25 05:29:41', '2026-06-18 05:29:41', '2026-06-18 05:29:41'),
(86, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODE3NjU1OTMsImV4cCI6MTc4MjM3MDM5M30.r7acMS6oZOxI6BnobUH3MeeBtxWzoXpQbnAgE23EPSM', '2026-06-25 05:53:13', '2026-06-18 05:53:13', '2026-06-18 05:53:13'),
(87, 90, 'personne', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTAsImxvZ2luIjoicGFyZW50XzIwMjYiLCJyb2xlIjoiUEFSRU5UIiwidHlwZVBlcnNvbm5lIjoyLCJpYXQiOjE3ODE3NjYxMTYsImV4cCI6MTc4MjM3MDkxNn0.PaYx3Dc2mDJHqF4uy20r0eE0sUXPMPTC8OWAJIRcXGk', '2026-06-25 06:01:56', '2026-06-18 06:01:56', '2026-06-18 06:01:56'),
(88, 91, 'personne', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTEsImxvZ2luIjoidGVhY2hlcl8yMDI2Iiwicm9sZSI6IlRFQUNIRVIiLCJ0eXBlUGVyc29ubmUiOjEsImlhdCI6MTc4MTc2NjM2NCwiZXhwIjoxNzgyMzcxMTY0fQ.OmgGN2_bdAgycY5E5JAF_totwBtA397px-SNhppRx4E', '2026-06-25 06:06:04', '2026-06-18 06:06:04', '2026-06-18 06:06:04'),
(89, 90, 'personne', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTAsImxvZ2luIjoicGFyZW50XzIwMjYiLCJyb2xlIjoiUEFSRU5UIiwidHlwZVBlcnNvbm5lIjoyLCJpYXQiOjE3ODE3Njc0OTYsImV4cCI6MTc4MjM3MjI5Nn0.mhQ4ItIvROpg9-aP-V64ZK7MHiaVlmbwyKm3TngbVXo', '2026-06-25 06:24:56', '2026-06-18 06:24:56', '2026-06-18 06:24:56'),
(90, 90, 'personne', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTAsImxvZ2luIjoicGFyZW50XzIwMjYiLCJyb2xlIjoiUEFSRU5UIiwidHlwZVBlcnNvbm5lIjoyLCJpYXQiOjE3ODE3Njc2MDgsImV4cCI6MTc4MjM3MjQwOH0.Un4AurEJf90cPqDtO_m52zgYMqSwhStcMIMHJWvMeO8', '2026-06-25 06:26:48', '2026-06-18 06:26:48', '2026-06-18 06:26:48'),
(91, 91, 'personne', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTEsImxvZ2luIjoidGVhY2hlcl8yMDI2Iiwicm9sZSI6IlRFQUNIRVIiLCJ0eXBlUGVyc29ubmUiOjEsImlhdCI6MTc4MTc2NzkxNCwiZXhwIjoxNzgyMzcyNzE0fQ._wAXyzemcvYvKTJioM11L76JmTG8rdDwj8gsu20I72U', '2026-06-25 06:31:54', '2026-06-18 06:31:54', '2026-06-18 06:31:54'),
(92, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODE3Njg0ODcsImV4cCI6MTc4MjM3MzI4N30.q_Cjxu0njvFAojS_lukbF6YyvYckWau9Ab6BWhVSez8', '2026-06-25 06:41:27', '2026-06-18 06:41:27', '2026-06-18 06:41:27'),
(93, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODE3Njg2NzYsImV4cCI6MTc4MjM3MzQ3Nn0.jlpAfmDqkEYo1Ul4cZ2j-7MFakp1qx97BdO8NwUCxxY', '2026-06-25 06:44:36', '2026-06-18 06:44:36', '2026-06-18 06:44:36'),
(94, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODE3Njg3OTgsImV4cCI6MTc4MjM3MzU5OH0.bTVyS1hk0xv5NpBK6ifFW1bM9rIuvMKoZUiKhwJ74S0', '2026-06-25 06:46:38', '2026-06-18 06:46:38', '2026-06-18 06:46:38'),
(95, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODE3NjkwMjUsImV4cCI6MTc4MjM3MzgyNX0.4-08oM4rmrUmYN6VWhFeMRBFOPZc_-_eT2pwj3BRgnA', '2026-06-25 06:50:25', '2026-06-18 06:50:25', '2026-06-18 06:50:25'),
(96, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJhZG1pbl9yb290Iiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjowLCJpYXQiOjE3ODE3NjkyMzMsImV4cCI6MTc4MjM3NDAzM30.t5c7BtViCnNfYH0ge2occT54EviCOOjtEjq-n3KBYYo', '2026-06-25 06:53:53', '2026-06-18 06:53:53', '2026-06-18 06:53:53'),
(97, 4, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwibG9naW4iOiJhZG1pbl9mb25kIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjozLCJpYXQiOjE3ODE3Njk0MTMsImV4cCI6MTc4MjM3NDIxM30.VIhT6U20VQp4Qq03tEM7iM83iqO6-U4HWpOjK1gKPRQ', '2026-06-25 06:56:53', '2026-06-18 06:56:53', '2026-06-18 06:56:53'),
(98, 5, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwibG9naW4iOiJhZG1pbl9kaXIiLCJyb2xlIjoiQURNSU4iLCJ0eXBlQWRtaW4iOjQsImlhdCI6MTc4MTc3MDE1NCwiZXhwIjoxNzgyMzc0OTU0fQ.ejmU5Jd-IducEQqVlmVTTmOO_LK96k-qUnISqRaSxkM', '2026-06-25 07:09:14', '2026-06-18 07:09:14', '2026-06-18 07:09:14'),
(99, 90, 'personne', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTAsImxvZ2luIjoicGFyZW50XzIwMjYiLCJyb2xlIjoiUEFSRU5UIiwidHlwZVBlcnNvbm5lIjoyLCJpYXQiOjE3ODE3ODMwNjQsImV4cCI6MTc4MjM4Nzg2NH0.oRLcyaDqgp4KgXJYnuuzucGt696wZ8js0poq7oMp_Fs', '2026-06-25 10:44:24', '2026-06-18 10:44:24', '2026-06-18 10:44:24'),
(100, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODE3ODMxNjQsImV4cCI6MTc4MjM4Nzk2NH0.2b1dr9ZGC_c83NdawZFyAQdP2Su9OEZtBrUGX42qLww', '2026-06-25 10:46:04', '2026-06-18 10:46:04', '2026-06-18 10:46:04'),
(101, 5, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwibG9naW4iOiJhZG1pbl9kaXIiLCJyb2xlIjoiQURNSU4iLCJ0eXBlQWRtaW4iOjQsImlhdCI6MTc4MTc4NDY4NCwiZXhwIjoxNzgyMzg5NDg0fQ.MAyCJtbobzyIY3vNcApXO2d2vNY5eC6-KowhAf_fT0k', '2026-06-25 11:11:24', '2026-06-18 11:11:24', '2026-06-18 11:11:24'),
(102, 3, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywibG9naW4iOiJhZG1pbl9zY29sIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoyLCJpYXQiOjE3ODE3ODc4MDUsImV4cCI6MTc4MjM5MjYwNX0.z0Rqi67AnD07gRCLEZxXY1don-Y7Kh-qH6bWBccAsek', '2026-06-25 12:03:25', '2026-06-18 12:03:25', '2026-06-18 12:03:25'),
(103, 4, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwibG9naW4iOiJhZG1pbl9mb25kIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjozLCJpYXQiOjE3ODE3ODc4NjEsImV4cCI6MTc4MjM5MjY2MX0.1kOEu7p3T2CTnGwoxdJ66kxMDF95Fz1m6_uCyrAea4I', '2026-06-25 12:04:21', '2026-06-18 12:04:21', '2026-06-18 12:04:21'),
(104, 6, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwibG9naW4iOiJhZG1pbl9hdWQiLCJyb2xlIjoiQURNSU4iLCJ0eXBlQWRtaW4iOjUsImlhdCI6MTc4MTc4ODMzNiwiZXhwIjoxNzgyMzkzMTM2fQ.zLOWQfNUhtNcLehqRxDSDXLau56NZXuM-cuZqUpC6WI', '2026-06-25 12:12:16', '2026-06-18 12:12:16', '2026-06-18 12:12:16'),
(105, 2, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibG9naW4iOiJhZG1pbl9pbnNjIiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjoxLCJpYXQiOjE3ODE3OTAwNzcsImV4cCI6MTc4MjM5NDg3N30.zHRsGMrsG4q61kHnqD6OJFmUjqIRK5xXruZ9DziK-Fo', '2026-06-25 12:41:17', '2026-06-18 12:41:17', '2026-06-18 12:41:17'),
(106, 90, 'personne', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTAsImxvZ2luIjoicGFyZW50XzIwMjYiLCJyb2xlIjoiUEFSRU5UIiwidHlwZVBlcnNvbm5lIjoyLCJpYXQiOjE3ODE3OTAxNzEsImV4cCI6MTc4MjM5NDk3MX0.bBgF-sYuD7XB5NrHAaSsmHqGvyW9vZd7Celtnk623_4', '2026-06-25 12:42:51', '2026-06-18 12:42:51', '2026-06-18 12:42:51'),
(107, 5, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwibG9naW4iOiJhZG1pbl9kaXIiLCJyb2xlIjoiQURNSU4iLCJ0eXBlQWRtaW4iOjQsImlhdCI6MTc4MTgxNDQ2NiwiZXhwIjoxNzgyNDE5MjY2fQ.5kAGHgNh_PDqJQOjQDE2yBc2v7hx9etcGB2dJ5WiKKA', '2026-06-25 19:27:46', '2026-06-18 19:27:46', '2026-06-18 19:27:46'),
(108, 6, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwibG9naW4iOiJhZG1pbl9hdWQiLCJyb2xlIjoiQURNSU4iLCJ0eXBlQWRtaW4iOjUsImlhdCI6MTc4MTgxNDcwOSwiZXhwIjoxNzgyNDE5NTA5fQ.TAiQ6L6XDUxQ1gESMJwVz2SN4lULE7ZbkRjWXW40MV0', '2026-06-25 19:31:49', '2026-06-18 19:31:49', '2026-06-18 19:31:49'),
(109, 6, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwibG9naW4iOiJhZG1pbl9hdWQiLCJyb2xlIjoiQURNSU4iLCJ0eXBlQWRtaW4iOjUsImlhdCI6MTc4MTgxNTIzNCwiZXhwIjoxNzgyNDIwMDM0fQ.iVb2o8vFT-qPhHKetnmVtUtUui8h84SpVjMKrSZiO1M', '2026-06-25 19:40:34', '2026-06-18 19:40:34', '2026-06-18 19:40:34'),
(110, 1, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJhZG1pbl9yb290Iiwicm9sZSI6IkFETUlOIiwidHlwZUFkbWluIjowLCJpYXQiOjE3ODE4MTU3MzYsImV4cCI6MTc4MjQyMDUzNn0.MY9eHIXQPQMKtFqvnz3_LCIltH0xS6iL3zoiefs9htI', '2026-06-25 19:48:56', '2026-06-18 19:48:56', '2026-06-18 19:48:56'),
(111, 90, 'personne', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTAsImxvZ2luIjoicGFyZW50XzIwMjYiLCJyb2xlIjoiUEFSRU5UIiwidHlwZVBlcnNvbm5lIjoyLCJpYXQiOjE3ODE4NDM4NzMsImV4cCI6MTc4MjQ0ODY3M30.Aqty3M8yfpgRJGXTwn1lB5dVl19bBpuriAv7AHzTZ9k', '2026-06-26 03:37:53', '2026-06-19 03:37:53', '2026-06-19 03:37:53'),
(112, 91, 'personne', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTEsImxvZ2luIjoidGVhY2hlcl8yMDI2Iiwicm9sZSI6IlRFQUNIRVIiLCJ0eXBlUGVyc29ubmUiOjEsImlhdCI6MTc4MzQ1NTY0MSwiZXhwIjoxNzg0MDYwNDQxfQ.Ebdd_pHVAnQDF90HN3gxZhtt5tc1uR_saiIRlJ9Q9y8', '2026-07-14 19:20:41', '2026-07-07 19:20:41', '2026-07-07 19:20:41'),
(113, 1, 'personne', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJhZG1pbl9yb290Iiwicm9sZSI6IkFETUlOX1JPT1QiLCJ0eXBlQWRtaW4iOjAsImlhdCI6MTc4MzQ1NjI2MiwiZXhwIjoxNzg0MDYxMDYyfQ.EXDaP_aLzER0au5FesP8_OZDICLUQsZLXSMYkHP7dRM', '2026-07-14 19:31:02', '2026-07-07 19:31:02', '2026-07-07 19:31:02'),
(114, 8, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwibG9naW4iOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsInR5cGVBZG1pbiI6MSwiaWF0IjoxNzgzNDU2NDcyLCJleHAiOjE3ODQwNjEyNzJ9.x9Upat7Cdovz5XhYOyaNia_MQbvhS0X3bohwN8v-1rc', '2026-07-14 19:34:32', '2026-07-07 19:34:32', '2026-07-07 19:34:32');

DROP TABLE IF EXISTS `Residents`;
CREATE TABLE `Residents` (
  `idResi` int unsigned NOT NULL AUTO_INCREMENT,
  `idPers` int unsigned NOT NULL,
  `idQuartier` int unsigned NOT NULL,
  `description` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idResi`),
  KEY `Residents_idPers_Personne_idPers_fk` (`idPers`),
  KEY `Residents_idQuartier_Quartier_idQuartier_fk` (`idQuartier`),
  CONSTRAINT `habite` FOREIGN KEY (`idPers`) REFERENCES `Personne` (`idPers`) ON UPDATE CASCADE,
  CONSTRAINT `Residents_idPers_Personne_idPers_fk` FOREIGN KEY (`idPers`) REFERENCES `Personne` (`idPers`),
  CONSTRAINT `Residents_idQuartier_Quartier_idQuartier_fk` FOREIGN KEY (`idQuartier`) REFERENCES `Quartier` (`idQuartier`),
  CONSTRAINT `zone` FOREIGN KEY (`idQuartier`) REFERENCES `Quartier` (`idQuartier`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
DROP TABLE IF EXISTS `Salle`;
CREATE TABLE `Salle` (
  `idSalle` int unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(30) NOT NULL,
  `position` varchar(100) NOT NULL DEFAULT 'NON DEFINI',
  `surface` varchar(30) NOT NULL,
  `idClasse` int unsigned NOT NULL,
  `actif` tinyint unsigned NOT NULL DEFAULT '1',
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `capacite` int DEFAULT NULL,
  PRIMARY KEY (`idSalle`),
  KEY `Salle_idClasse_Classe_idClasse_fk` (`idClasse`),
  CONSTRAINT `lieu` FOREIGN KEY (`idClasse`) REFERENCES `Classe` (`idClasse`) ON UPDATE CASCADE,
  CONSTRAINT `Salle_idClasse_Classe_idClasse_fk` FOREIGN KEY (`idClasse`) REFERENCES `Classe` (`idClasse`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Salle` (`idSalle`, `libelle`, `position`, `surface`, `idClasse`, `actif`, `idAdmin`, `created_at`, `capacite`) VALUES 
(21, 's1', 'etage 1,aller 2', '20', 62, 1, 22, '2026-07-08 12:09:59', 20),
(24, 'A', 'Rez-de-chaussée', '45m²', 47, 1, 1, '2026-07-08 16:51:45', 30),
(25, 'Salle 202', 'Étage 2', '50m²', 47, 1, 1, '2026-07-08 16:51:45', 35),
(26, 'A', 'Rez-de-chaussée', '40m²', 57, 1, 1, '2026-07-08 16:51:46', 25),
(27, 'B', 'Rez-de-chaussée', '40m²', 57, 1, 1, '2026-07-08 16:51:47', 25),
(28, 'B', 'Rez-de-chaussée', '42m²', 58, 1, 1, '2026-07-08 16:51:47', 28),
(29, 'A', 'Étage 1', '42m²', 60, 1, 1, '2026-07-08 16:51:48', 28),
(30, 'A', 'Étage 1', '40m²', 61, 1, 1, '2026-07-08 16:51:49', 25),
(31, 'B', 'Étage 1', '40m²', 61, 1, 1, '2026-07-08 16:51:49', 25),
(32, 'Salle B', 'Rez-de-chaussée', '35m²', 62, 1, 1, '2026-07-08 16:51:49', 25),
(33, 'A', 'Rez-de-chaussée', '42m²', 59, 1, 1, '2026-07-08 16:52:22', 28),
(34, 'A', 'Rez-de-chaussée', '35m²', 63, 1, 1, '2026-07-08 16:52:22', 25),
(35, 'A', 'Rez-de-chaussée', '35m²', 64, 1, 1, '2026-07-08 16:52:23', 25),
(36, 'A', 'Rez-de-chaussée', '35m²', 65, 1, 1, '2026-07-08 16:52:23', 25),
(37, 'A', 'Rez-de-chaussée', '35m²', 66, 1, 1, '2026-07-08 16:52:24', 25),
(38, 'A', 'Rez-de-chaussée', '35m²', 67, 1, 1, '2026-07-08 16:52:24', 25);

DROP TABLE IF EXISTS `Schedule`;
CREATE TABLE `Schedule` (
  `idSchedule` int NOT NULL AUTO_INCREMENT,
  `idClasse` int NOT NULL,
  `idCours` int NOT NULL,
  `jourSemaine` varchar(20) NOT NULL,
  `heureDebut` varchar(20) NOT NULL,
  `heureFin` varchar(20) NOT NULL,
  PRIMARY KEY (`idSchedule`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Schedule` (`idSchedule`, `idClasse`, `idCours`, `jourSemaine`, `heureDebut`, `heureFin`) VALUES 
(1, 1, 1, 'Lundi', '08:00', '10:00'),
(2, 1, 2, 'Lundi', '10:15', '12:00'),
(3, 4, 3, 'Mardi', '08:30', '11:30'),
(4, 5, 4, 'Mercredi', '09:00', '11:00');

DROP TABLE IF EXISTS `Scolarite`;
CREATE TABLE `Scolarite` (
  `idScolarite` int unsigned NOT NULL AUTO_INCREMENT,
  `inscription` float unsigned NOT NULL,
  `pension` float unsigned NOT NULL,
  `nbreTranche` smallint unsigned NOT NULL DEFAULT '3',
  `description` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `idCycle` int unsigned NOT NULL,
  `idFondateur` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `idClasse` int DEFAULT NULL,
  PRIMARY KEY (`idScolarite`),
  KEY `Scolarite_idCycle_Cycle_idCycle_fk` (`idCycle`),
  CONSTRAINT `argent` FOREIGN KEY (`idCycle`) REFERENCES `Cycle` (`idCycle`) ON UPDATE CASCADE,
  CONSTRAINT `Scolarite_idCycle_Cycle_idCycle_fk` FOREIGN KEY (`idCycle`) REFERENCES `Cycle` (`idCycle`)
) ENGINE=InnoDB AUTO_INCREMENT=1012 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Scolarite` (`idScolarite`, `inscription`, `pension`, `nbreTranche`, `description`, `idCycle`, `idFondateur`, `created_at`, `idClasse`) VALUES 
(1006, 30000, 500000, 3, '', 21, 1, '2026-07-08 15:01:51', 57),
(1009, 30000, 700000, 3, '', 22, 1, '2026-07-08 21:07:06', NULL),
(1010, 30000, 200000, 3, '', 21, 1, '2026-07-08 21:36:53', 47),
(1011, 40000, 700000, 3, '', 21, 1, '2026-07-08 22:48:06', 58);

DROP TABLE IF EXISTS `SequelizeMeta`;
CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_unicode_ci;
DROP TABLE IF EXISTS `Session`;
CREATE TABLE `Session` (
  `idSession` int unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) NOT NULL,
  `description` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `idTrimestre` int unsigned NOT NULL,
  `idPers` int unsigned NOT NULL,
  `date_passage` date DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idSession`),
  KEY `Session_idTrimestre_Trimestre_idTrimes_fk` (`idTrimestre`),
  CONSTRAINT `Session_idTrimestre_Trimestre_idTrimes_fk` FOREIGN KEY (`idTrimestre`) REFERENCES `Trimestre` (`idTrimes`),
  CONSTRAINT `sessTrim` FOREIGN KEY (`idTrimestre`) REFERENCES `Trimestre` (`idTrimes`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1011 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Session` (`idSession`, `libelle`, `description`, `idTrimestre`, `idPers`, `date_passage`, `created_at`) VALUES 
(1, 'Examen Sequentiel 1', NULL, 1, 1, NULL, '2026-05-25 07:19:49'),
(1000, 'examen', NULL, 1, 1, '2026-03-11 23:00:00', '2026-06-16 11:30:59'),
(1001, 'Session 1', NULL, 1, 1, NULL, '2026-07-08 15:44:24'),
(1010, 'Session Test', NULL, 1, 1, NULL, '2026-07-08 15:59:25');

DROP TABLE IF EXISTS `Specialite`;
CREATE TABLE `Specialite` (
  `idSpecialite` int unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) NOT NULL,
  `idAdmin` int unsigned NOT NULL,
  PRIMARY KEY (`idSpecialite`)
) ENGINE=InnoDB AUTO_INCREMENT=1003 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Specialite` (`idSpecialite`, `libelle`, `idAdmin`) VALUES 
(1000, 'Mathématiques', 1),
(1001, 'Sciences', 1),
(1002, 'Langues', 1);

DROP TABLE IF EXISTS `Titulaire`;
CREATE TABLE `Titulaire` (
  `idTitulaire` int unsigned NOT NULL AUTO_INCREMENT,
  `idPers` int unsigned NOT NULL,
  `idSalle` int unsigned NOT NULL,
  `actif` tinyint unsigned NOT NULL DEFAULT '1',
  `idAdmin` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idTitulaire`),
  KEY `Titulaire_idPers_Personne_idPers_fk` (`idPers`),
  KEY `Titulaire_idSalle_Salle_idSalle_fk` (`idSalle`),
  CONSTRAINT `nommer` FOREIGN KEY (`idPers`) REFERENCES `Personne` (`idPers`) ON UPDATE CASCADE,
  CONSTRAINT `responsable` FOREIGN KEY (`idSalle`) REFERENCES `Salle` (`idSalle`) ON UPDATE CASCADE,
  CONSTRAINT `Titulaire_idPers_Personne_idPers_fk` FOREIGN KEY (`idPers`) REFERENCES `Personne` (`idPers`),
  CONSTRAINT `Titulaire_idSalle_Salle_idSalle_fk` FOREIGN KEY (`idSalle`) REFERENCES `Salle` (`idSalle`)
) ENGINE=InnoDB AUTO_INCREMENT=1011 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
DROP TABLE IF EXISTS `Tranches`;
CREATE TABLE `Tranches` (
  `idTranche` int unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) NOT NULL,
  `montant` float unsigned NOT NULL DEFAULT '0',
  `delai_mois` char(2) NOT NULL,
  `delai_jour` char(2) NOT NULL,
  `date_limite` date DEFAULT NULL,
  `idScolarite` int unsigned NOT NULL,
  `actif` tinyint unsigned NOT NULL DEFAULT '1',
  `idFondateur` int unsigned NOT NULL,
  PRIMARY KEY (`idTranche`),
  KEY `Tranches_idScolarite_Scolarite_idScolarite_fk` (`idScolarite`),
  CONSTRAINT `scol` FOREIGN KEY (`idScolarite`) REFERENCES `Scolarite` (`idScolarite`) ON UPDATE CASCADE,
  CONSTRAINT `Tranches_idScolarite_Scolarite_idScolarite_fk` FOREIGN KEY (`idScolarite`) REFERENCES `Scolarite` (`idScolarite`)
) ENGINE=InnoDB AUTO_INCREMENT=1023 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Tranches` (`idTranche`, `libelle`, `montant`, `delai_mois`, `delai_jour`, `date_limite`, `idScolarite`, `actif`, `idFondateur`) VALUES 
(1011, 'Tranche 1', 176667, '', '', '2026-07-08 23:00:00', 1006, 1, 1),
(1012, 'Tranche 2', 176667, '', '', '2026-07-21 23:00:00', 1006, 1, 1),
(1013, 'Tranche 3', 176667, '', '', '2026-07-30 23:00:00', 1006, 1, 1),
(1014, 'Tranche 1', 243333, '', '', '2026-07-09 23:00:00', 1009, 1, 1),
(1015, 'Tranche 2', 243333, '', '', '2026-07-29 23:00:00', 1009, 1, 1),
(1016, 'Tranche 3', 243333, '', '', '2026-08-01 23:00:00', 1009, 1, 1),
(1017, 'Tranche 1', 76667, '', '', '2026-07-08 23:00:00', 1010, 1, 1),
(1018, 'Tranche 2', 76667, '', '', '2026-07-20 23:00:00', 1010, 1, 1),
(1019, 'Tranche 3', 76667, '', '', '2026-07-22 23:00:00', 1010, 1, 1),
(1020, 'Tranche 1', 246667, '', '', '2026-07-23 23:00:00', 1011, 1, 1),
(1021, 'Tranche 2', 246667, '', '', '2026-07-29 23:00:00', 1011, 1, 1),
(1022, 'Tranche 3', 246667, '', '', '2026-07-28 23:00:00', 1011, 1, 1);

DROP TABLE IF EXISTS `Trimestre`;
CREATE TABLE `Trimestre` (
  `idTrimes` int unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) NOT NULL,
  `periode` varchar(255) NOT NULL,
  `idAca` int unsigned NOT NULL,
  `idAdmin` int NOT NULL,
  `clos` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idTrimes`),
  KEY `Trimestre_idAca_AnneeAcademique_idAnnee_fk` (`idAca`),
  CONSTRAINT `anneTrim` FOREIGN KEY (`idAca`) REFERENCES `AnneeAcademique` (`idAnnee`) ON UPDATE CASCADE,
  CONSTRAINT `Trimestre_idAca_AnneeAcademique_idAnnee_fk` FOREIGN KEY (`idAca`) REFERENCES `AnneeAcademique` (`idAnnee`)
) ENGINE=InnoDB AUTO_INCREMENT=1004 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `Trimestre` (`idTrimes`, `libelle`, `periode`, `idAca`, `idAdmin`, `clos`) VALUES 
(1, '1er Trimestre', '', 1, 1, 1),
(1000, '2ème Trimestre', 'Jan – Mars 2025', 1, 1, 0),
(1001, '3ème Trimestre', 'Avr – Juin 2025', 1, 1, 0),
(1002, 'Trimestre 1', 'Sep-Déc', 1, 1, 1),
(1003, 'Trimestre 1', 'Sep-Oct', 6, 1, 0);

DROP TABLE IF EXISTS `VilleNaissance`;
CREATE TABLE `VilleNaissance` (
  `idVille` int unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(100) NOT NULL DEFAULT 'Autres',
  `actif` tinyint unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`idVille`),
  UNIQUE KEY `VilleNaissance_libelle_key` (`libelle`)
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `VilleNaissance` (`idVille`, `libelle`, `actif`) VALUES 
(1, 'Douala', 1),
(2, 'Yaoundé', 1),
(3, 'Bafoussam', 1),
(4, 'Bamenda', 1),
(5, 'Garoua', 1),
(7, 'Mbalmayo', 1),
(8, 'Obala', 1),
(9, 'Mfou', 1),
(10, 'Bafia', 1),
(11, 'Monatélé', 1),
(12, 'Soa', 1),
(13, 'Okola', 1),
(14, 'Ntui', 1),
(15, 'Eseka', 1),
(16, 'Nanga Eboko', 1),
(17, 'Akonolinga', 1),
(18, 'Mbandjock', 1),
(19, 'Ngoumou', 1),
(20, 'Mengang', 1),
(22, 'Nkongsamba', 1),
(23, 'Edéa', 1),
(24, 'Mbanga', 1),
(25, 'Loum', 1),
(26, 'Manjo', 1),
(27, 'Yabassi', 1),
(28, 'Ndom', 1),
(29, 'Penja', 1),
(30, 'Dibombari', 1),
(31, 'Mouanko', 1),
(33, 'Mbouda', 1),
(34, 'Dschang', 1),
(35, 'Bangangté', 1),
(36, 'Foumban', 1),
(37, 'Foumbot', 1),
(38, 'Baham', 1),
(39, 'Bafang', 1),
(40, 'Kekem', 1),
(41, 'Melong', 1),
(42, 'Tonga', 1),
(43, 'Santchou', 1),
(44, 'Bamendjou', 1),
(46, 'Kumbo', 1),
(47, 'Wum', 1),
(48, 'Nkambe', 1),
(49, 'Fundong', 1),
(50, 'Mbengwi', 1),
(51, 'Ndop', 1),
(52, 'Bali', 1),
(53, 'Batibo', 1),
(54, 'Santa', 1),
(55, 'Akum', 1),
(56, 'Buéa', 1),
(57, 'Limbé', 1),
(58, 'Kumba', 1),
(59, 'Mamfé', 1),
(60, 'Muyuka', 1),
(61, 'Tiko', 1),
(62, 'Mundemba', 1),
(63, 'Ekondo Titi', 1),
(64, 'Menji', 1),
(65, 'Ngaoundéré', 1),
(66, 'Meiganga', 1),
(67, 'Tibati', 1),
(68, 'Banyo', 1),
(69, 'Ngaoundal', 1),
(70, 'Tignère', 1),
(71, 'Kontcha', 1),
(72, 'Dir', 1),
(74, 'Guider', 1),
(75, 'Poli', 1),
(76, 'Figuil', 1),
(77, 'Pitoa', 1),
(78, 'Lagdo', 1),
(79, 'Tchollire', 1),
(80, 'Rey Bouba', 1),
(81, 'Ngong', 1),
(82, 'Maroua', 1),
(83, 'Mora', 1),
(84, 'Kousséri', 1),
(85, 'Yagoua', 1),
(86, 'Kaélé', 1),
(87, 'Mindif', 1),
(88, 'Mokolo', 1),
(89, 'Moulvoudaye', 1),
(90, 'Maga', 1),
(91, 'Waza', 1),
(92, 'Tokombéré', 1),
(93, 'Bogo', 1),
(94, 'Bertoua', 1),
(95, 'Batouri', 1),
(96, 'Abong-Mbang', 1),
(97, 'Yokadouma', 1),
(98, 'Nguelemendouka', 1),
(99, 'Doumé', 1),
(100, 'Moloundou', 1),
(101, 'Belabo', 1),
(102, 'Lomié', 1),
(103, 'Ebolowa', 1),
(104, 'Kribi', 1),
(105, 'Sangmélima', 1),
(106, 'Ambam', 1),
(107, 'Lolodorf', 1),
(108, 'Djoum', 1),
(109, 'Mvangué', 1),
(110, 'Akom II', 1),
(111, 'Campo', 1),
(112, 'Bengbis', 1),
(113, 'Autres', 1),
(114, 'Alger', 1),
(115, 'Oran', 1),
(116, 'Constantine', 1);

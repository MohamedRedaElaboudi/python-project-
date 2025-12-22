-- Script pour réinsérer des soutenances et jury assignments de test
-- À exécuter dans phpMyAdmin ou MySQL

-- D'abord, vérifier quelles soutenances existent encore
SELECT * FROM soutenances;

-- Insérer une nouvelle soutenance pour l'étudiant ID 2 (med med reda)
INSERT INTO `soutenances` (`student_id`, `salle_id`, `rapport_id`, `date_soutenance`, `heure_debut`, `duree_minutes`, `statut`, `created_at`) 
VALUES (2, 1, NULL, '2025-12-25', '10:00:00', 30, 'planned', NOW());

-- Récupérer l'ID de la soutenance qu'on vient de créer (remplacer X par l'ID retourné)
SET @new_soutenance_id = LAST_INSERT_ID();

-- Assigner les jurys à cette nouvelle soutenance
INSERT INTO `juries` (`soutenance_id`, `teacher_id`, `role`) VALUES
(@new_soutenance_id, 1, 'member'),      -- Jury ID 1 (reda reda)
(@new_soutenance_id, 5, 'president'),   -- Jury ID 5 (ense)
(@new_soutenance_id, 6, 'member');      -- Jury ID 6 (ense2)

-- Vérifier les données
SELECT 
    s.id as soutenance_id,
    s.date_soutenance,
    u.prenom as student_prenom,
    u.name as student_name,
    j.teacher_id,
    j.role
FROM soutenances s
JOIN users u ON s.student_id = u.id
LEFT JOIN juries j ON j.soutenance_id = s.id
WHERE s.statut = 'planned'
ORDER BY s.date_soutenance;

-- Vérifier les rapports de l'étudiant 2
SELECT * FROM rapports WHERE auteur_id = 2;

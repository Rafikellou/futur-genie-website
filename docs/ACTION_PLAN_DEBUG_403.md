# Plan d'Action : Debug Erreur 403 Création Classe

## Contexte

**Utilisateur :** director26@gmaiml.com
**Problème :** Erreur 403 lors de la création de classe
**Particularité :** L'utilisateur a déjà un school_id dans public.users

## Étape 1 : Vérifier les Politiques RLS dans Supabase

1. Ouvrir Supabase Dashboard
2. Aller dans Database → Policies
3. Cliquer sur la table classrooms
4. Vérifier les politiques INSERT

### Politique attendue

```sql
CREATE POLICY "Directors can create classrooms"
ON classrooms FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.school_id = classrooms.school_id
    AND users.role = 'DIRECTOR'
  )
);
```

### Si la politique est incorrecte

Exécuter dans SQL Editor :

```sql
DROP POLICY IF EXISTS "Directors can create classrooms" ON classrooms;
DROP POLICY IF EXISTS "p_classrooms_director_insert" ON classrooms;

CREATE POLICY "Directors can create classrooms"
ON classrooms FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.school_id = classrooms.school_id
    AND users.role = 'DIRECTOR'
  )
);
```

## Étape 2 : Exécuter le Script de Diagnostic

1. Ouvrir Supabase Dashboard → SQL Editor
2. Copier le contenu de verify-rls-policies.sql
3. Remplacer 'director26@gmaiml.com' par l'email du Director
4. Exécuter et analyser les résultats

## Étape 3 : Reproduire l'Erreur avec les Logs

1. Ouvrir http://localhost:3000
2. Se connecter avec director26@gmaiml.com
3. Ouvrir la console (F12)
4. Aller sur /dashboard/classes
5. Créer une classe
6. Analyser les logs dans la console

### Logs attendus

Les logs devraient montrer :
- Auth User ID
- Public User avec school_id
- Correspondance entre les school_id
- Erreur détaillée si échec

## Étape 4 : Analyser et Corriger

### Si school_id ne correspond pas

Le problème vient du passage du school_id au modal.

### Si school_id correspond mais erreur 403

Le problème vient des politiques RLS dans Supabase.

### Si session expirée

Ajouter un rafraîchissement de session avant insertion.

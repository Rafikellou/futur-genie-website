import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lire le fichier .env.local
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');

// Parser les variables
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

// Créer un client avec la clé service (bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseRLS() {
  console.log('🔍 DIAGNOSTIC RLS - CRÉATION DE CLASSE\n');
  console.log('='.repeat(60));

  // 1. Vérifier les données de l'utilisateur
  console.log('\n📊 1. DONNÉES DE L\'UTILISATEUR director26@gmaiml.com\n');
  
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'director26@gmaiml.com')
    .single();

  if (userError) {
    console.error('❌ Erreur récupération utilisateur:', userError);
  } else if (!user) {
    console.error('❌ Utilisateur non trouvé');
  } else {
    console.log('✅ Utilisateur trouvé:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Full Name:', user.full_name);
    console.log('   Role:', user.role);
    console.log('   School ID:', user.school_id || '❌ NULL');
    console.log('   Classroom ID:', user.classroom_id || 'NULL');
  }

  // 2. Vérifier l'école associée
  if (user?.school_id) {
    console.log('\n🏫 2. ÉCOLE ASSOCIÉE\n');
    
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('id', user.school_id)
      .single();

    if (schoolError) {
      console.error('❌ Erreur récupération école:', schoolError);
    } else if (!school) {
      console.error('❌ École non trouvée (school_id existe mais école absente)');
    } else {
      console.log('✅ École trouvée:');
      console.log('   ID:', school.id);
      console.log('   Name:', school.name);
      console.log('   Created:', new Date(school.created_at).toLocaleString());
    }
  } else {
    console.log('\n🏫 2. ÉCOLE ASSOCIÉE\n');
    console.log('❌ Pas de school_id assigné');
  }

  // 3. Simuler la vérification RLS
  console.log('\n🧪 3. SIMULATION DE LA POLITIQUE RLS\n');
  
  if (user?.school_id && user?.role === 'DIRECTOR') {
    console.log('✅ Conditions de base remplies:');
    console.log('   - Role = DIRECTOR ✅');
    console.log('   - School ID existe ✅');
    console.log('\n   La politique RLS devrait normalement PASSER');
    console.log('   si elle est correctement configurée dans Supabase.');
  } else {
    console.log('❌ Conditions de base NON remplies:');
    if (user?.role !== 'DIRECTOR') {
      console.log('   - Role ≠ DIRECTOR ❌');
    }
    if (!user?.school_id) {
      console.log('   - School ID manquant ❌');
    }
  }

  // 4. Tester l'insertion (avec service role, donc bypass RLS)
  console.log('\n🧪 4. TEST D\'INSERTION (avec service role key)\n');
  
  if (user?.school_id) {
    const testClassroom = {
      name: 'TEST DIAGNOSTIC - À SUPPRIMER',
      grade: 'CP',
      school_id: user.school_id
    };

    console.log('Tentative d\'insertion:', testClassroom);

    const { data: insertedClassroom, error: insertError } = await supabase
      .from('classrooms')
      .insert([testClassroom])
      .select()
      .single();

    if (insertError) {
      console.error('\n❌ Erreur d\'insertion (même avec service role):', insertError);
      console.error('   Code:', insertError.code);
      console.error('   Message:', insertError.message);
    } else {
      console.log('\n✅ Insertion réussie avec service role key:');
      console.log('   ID:', insertedClassroom.id);
      console.log('   Name:', insertedClassroom.name);
      
      // Supprimer la classe de test
      const { error: deleteError } = await supabase
        .from('classrooms')
        .delete()
        .eq('id', insertedClassroom.id);

      if (deleteError) {
        console.error('\n⚠️ Erreur suppression classe de test:', deleteError);
        console.log('   Veuillez supprimer manuellement la classe:', insertedClassroom.id);
      } else {
        console.log('   ✅ Classe de test supprimée');
      }
    }
  } else {
    console.log('⏭️ Test ignoré (pas de school_id)');
  }

  // 5. Vérifier les classes existantes
  console.log('\n📚 5. CLASSES EXISTANTES POUR CETTE ÉCOLE\n');
  
  if (user?.school_id) {
    const { data: classrooms, error: classroomsError } = await supabase
      .from('classrooms')
      .select('*')
      .eq('school_id', user.school_id);

    if (classroomsError) {
      console.error('❌ Erreur récupération classes:', classroomsError);
    } else if (!classrooms || classrooms.length === 0) {
      console.log('ℹ️ Aucune classe existante');
    } else {
      console.log(`✅ ${classrooms.length} classe(s) trouvée(s):`);
      classrooms.forEach((classroom) => {
        console.log(`   - ${classroom.name} (${classroom.grade})`);
      });
    }
  } else {
    console.log('⏭️ Vérification ignorée (pas de school_id)');
  }

  // 6. Recommandations
  console.log('\n💡 6. RECOMMANDATIONS\n');
  
  if (!user) {
    console.log('❌ L\'utilisateur n\'existe pas dans public.users');
    console.log('   → Créer l\'utilisateur ou vérifier l\'email');
  } else if (!user.school_id) {
    console.log('❌ L\'utilisateur n\'a pas de school_id');
    console.log('   → Compléter l\'onboarding sur /onboarding/school');
  } else if (user.role !== 'DIRECTOR') {
    console.log('❌ L\'utilisateur n\'est pas DIRECTOR');
    console.log('   → Vérifier le rôle dans la base de données');
  } else {
    console.log('✅ Les données utilisateur sont correctes');
    console.log('\n   Le problème vient probablement des politiques RLS:');
    console.log('   1. Vérifiez dans Supabase Dashboard → Database → Policies');
    console.log('   2. Cherchez la table "classrooms"');
    console.log('   3. Vérifiez la politique "Directors can create classrooms"');
    console.log('   4. Elle doit utiliser WITH CHECK (pas USING)');
    console.log('   5. Elle ne doit pas dépendre de fonctions manquantes');
    console.log('\n   Script SQL de correction disponible dans:');
    console.log('   → supabase-rls-policies.sql (lignes 75-99)');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ DIAGNOSTIC TERMINÉ\n');
}

// Exécuter le diagnostic
diagnoseRLS().catch(console.error);

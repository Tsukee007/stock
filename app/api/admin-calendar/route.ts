import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { password, action, post } = await req.json()

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    if (action === 'get') {
      const { data, error } = await supabase
        .from('editorial_calendar')
        .select('*')
        .order('date', { ascending: true })
      if (error) throw error
      return NextResponse.json({ data })
    }

    if (action === 'update') {
      const { error } = await supabase
        .from('editorial_calendar')
        .update({
          statut: post.statut,
          vues: post.vues,
          likes: post.likes,
          clics: post.clics,
          commentaires: post.commentaires,
        })
        .eq('id', post.id)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (action === 'seed') {
      const posts = [
        { date: '2026-07-01', reseau: 'tiktok', angle: 'Revenus passifs proprietaire', contenu: 'Ton garage dort depuis des mois. Il pourrait te rapporter entre 40 et 150 EUR par mois. Nestock. Bientot disponible.', lien: 'nestock.pro/waitlist?utm=tiktok' },
        { date: '2026-07-02', reseau: 'facebook', angle: 'Presentation concept', contenu: 'Pourquoi avons-nous cree Nestock ? Des millions de garages vides. Des milliers de gens qui cherchent. On a cree la solution.', lien: 'nestock.pro/waitlist?utm=facebook' },
        { date: '2026-07-03', reseau: 'instagram', angle: 'Visuel proprietaire', contenu: 'Ton garage inutilise = revenus passifs chaque mois. Nestock arrive bientot. Liste d attente ouverte.', lien: 'nestock.pro/waitlist?utm=instagram' },
        { date: '2026-07-04', reseau: 'reddit', angle: 'AMA lancement', contenu: 'J ai lance Nestock, une marketplace de stockage entre particuliers — retours bienvenus. AMA.', lien: 'nestock.pro/waitlist?utm=reddit' },
        { date: '2026-07-05', reseau: 'tiktok', angle: 'Comparaison prix', contenu: '180 EUR/mois pour un box de stockage ? Il existe une alternative 2x moins chere chez des particuliers.', lien: 'nestock.pro/waitlist?utm=tiktok' },
        { date: '2026-07-06', reseau: 'facebook', angle: 'Transparence tarifaire', contenu: 'Chez Nestock, aucune surprise sur les frais. Loyer 50 EUR + commission 10% + frais Stripe = 56,03 EUR total locataire.', lien: 'nestock.pro/waitlist?utm=facebook' },
        { date: '2026-07-07', reseau: 'instagram', angle: 'Securite et legalite', contenu: 'Louer chez un particulier c est risque ? Non. Contrat legal + Stripe + quittances automatiques.', lien: 'nestock.pro/waitlist?utm=instagram' },
        { date: '2026-07-08', reseau: 'tiktok', angle: 'Generique Star Wars', contenu: 'Il y a bien longtemps dans un quartier pas si loin... Des millions de garages vides. Nestock fait le lien.', lien: 'nestock.pro/waitlist?utm=tiktok' },
        { date: '2026-07-09', reseau: 'facebook', angle: 'Tutoriel proprietaire', contenu: 'Comment louer votre garage en 3 etapes : 1. Publiez votre annonce 2. Recevez des demandes 3. Encaissez chaque mois.', lien: 'nestock.pro/waitlist?utm=facebook' },
        { date: '2026-07-10', reseau: 'instagram', angle: 'POV demenagement', contenu: 'POV : tu dois stocker tes meubles entre deux apparts. Box : 450 EUR. Nestock : 135 EUR. Meme surface.', lien: 'nestock.pro/waitlist?utm=instagram' },
        { date: '2026-07-11', reseau: 'reddit', angle: 'Discussion immobilier', contenu: 'Louer son garage via une plateforme — retour d experience et questions sur le juridique et fiscal.', lien: 'nestock.pro/waitlist?utm=reddit' },
        { date: '2026-07-12', reseau: 'tiktok', angle: 'Ce que personne ne dit', contenu: 'Ce que personne ne te dit sur ton garage vide. Il pourrait rapporter 100 EUR par mois. Sans effort. Legalement.', lien: 'nestock.pro/waitlist?utm=tiktok' },
        { date: '2026-07-13', reseau: 'facebook', angle: 'Mise en situation locataire', contenu: 'Imaginez trouver un espace de stockage a 45 EUR/mois a 10 minutes de chez vous. C est ce que Nestock rend possible.', lien: 'nestock.pro/waitlist?utm=facebook' },
        { date: '2026-07-14', reseau: 'instagram', angle: 'Calcul revenus', contenu: 'Combien rapporte ton garage ? 10m2 = 600 EUR/an. 20m2 = 1200 EUR/an. Sans rien faire.', lien: 'nestock.pro/waitlist?utm=instagram' },
        { date: '2026-07-15', reseau: 'tiktok', angle: 'Liste attente ouverte', contenu: 'Nestock ouvre bientot. Liste d attente ouverte. Acces prioritaire pour les premiers inscrits.', lien: 'nestock.pro/waitlist?utm=tiktok' },
        { date: '2026-07-16', reseau: 'facebook', angle: 'FAQ', contenu: 'Les questions les plus posees sur Nestock : gratuit ? legal ? resiliation ? securite bancaire ? Reponses ici.', lien: 'nestock.pro/waitlist?utm=facebook' },
        { date: '2026-07-17', reseau: 'instagram', angle: 'Decouverte plateforme', contenu: 'Tu connais Nestock ? La marketplace de stockage entre particuliers. 2x moins cher. Bientot disponible.', lien: 'nestock.pro/waitlist?utm=instagram' },
        { date: '2026-07-18', reseau: 'reddit', angle: 'Update semaine 2', contenu: 'Update Nestock — premiere semaine de liste d attente. Bonne repartition proprietaires/locataires.', lien: 'nestock.pro/waitlist?utm=reddit' },
        { date: '2026-07-19', reseau: 'tiktok', angle: 'Compte a rebours', contenu: 'Dans quelques semaines tu pourras stocker tes affaires pour moins de 50 EUR/mois. Inscris-toi maintenant.', lien: 'nestock.pro/waitlist?utm=tiktok' },
        { date: '2026-07-20', reseau: 'facebook', angle: 'Roadmap lancement', contenu: 'Les 4 phases de lancement Nestock : Construction (termine), Liste attente (en cours), Beta privee, Lancement public.', lien: 'nestock.pro/waitlist?utm=facebook' },
        { date: '2026-07-21', reseau: 'instagram', angle: 'CTA fort', contenu: 'Nestock ouvre bientot. Liste d attente ouverte. Acces prioritaire pour les premiers inscrits.', lien: 'nestock.pro/waitlist?utm=instagram' },
        { date: '2026-07-22', reseau: 'tiktok', angle: 'Revenus proprietaire', contenu: 'Mon sous-sol inutile me rapporte 120 EUR par mois. Contrat automatique, paiement mensuel. Rien a gerer.', lien: 'nestock.pro/waitlist?utm=tiktok' },
        { date: '2026-07-23', reseau: 'facebook', angle: 'Avantages locataire', contenu: 'Pourquoi choisir Nestock plutot qu un box classique ? Prix, flexibilite, contrat legal, proximite.', lien: 'nestock.pro/waitlist?utm=facebook' },
        { date: '2026-07-24', reseau: 'instagram', angle: 'Stripe reassurance', contenu: 'Paiements 100% securises via Stripe. Certifie PCI-DSS niveau 1. Vos donnees bancaires ne transitent jamais par Nestock.', lien: 'nestock.pro/waitlist?utm=instagram' },
        { date: '2026-07-25', reseau: 'reddit', angle: 'r/immobilier discussion', contenu: 'Revenus complementaires avec un garage : experience et conseils sur la plateforme Nestock.', lien: 'nestock.pro/waitlist?utm=reddit' },
        { date: '2026-07-26', reseau: 'tiktok', angle: 'Simplicite', contenu: '5 minutes pour creer une annonce. Contrat automatique. Paiement automatique. Quittances automatiques.', lien: 'nestock.pro/waitlist?utm=tiktok' },
        { date: '2026-07-27', reseau: 'facebook', angle: 'Types espaces', contenu: 'Garage, cave, grenier, local, box... Tous les espaces sont les bienvenus sur Nestock.', lien: 'nestock.pro/waitlist?utm=facebook' },
        { date: '2026-07-28', reseau: 'instagram', angle: 'France startup', contenu: 'Nestock. 100% francais. RGPD conforme. Paiements Stripe. Bientot disponible partout en France.', lien: 'nestock.pro/waitlist?utm=instagram' },
        { date: '2026-07-29', reseau: 'tiktok', angle: 'POV locataire', contenu: 'POV : tu trouves un espace de stockage a 45 EUR/mois dans ton quartier. En moins de 10 minutes.', lien: 'nestock.pro/waitlist?utm=tiktok' },
        { date: '2026-07-30', reseau: 'facebook', angle: 'Resiliation facile', contenu: 'Pas d engagement long terme sur Nestock. Resiliation avec 15 jours de preavis. Simple et sans frais.', lien: 'nestock.pro/waitlist?utm=facebook' },
        { date: '2026-07-31', reseau: 'instagram', angle: 'Bilan mois 1', contenu: 'Un mois de liste d attente. Merci a tous les inscrits ! Le lancement approche.', lien: 'nestock.pro/waitlist?utm=instagram' },
        { date: '2026-08-01', reseau: 'tiktok', angle: 'Mois 2 lancement', contenu: 'Nestock entre dans sa phase finale avant le lancement. Dernier appel pour rejoindre la liste d attente.', lien: 'nestock.pro/waitlist?utm=tiktok' },
        { date: '2026-08-02', reseau: 'facebook', angle: 'Teaser beta', contenu: 'La beta privee approche. Les premiers inscrits sur la liste d attente seront selectionnes en priorite.', lien: 'nestock.pro/waitlist?utm=facebook' },
        { date: '2026-08-03', reseau: 'instagram', angle: 'Urgence inscription', contenu: 'Plus que quelques semaines pour rejoindre la liste d attente prioritaire. Inscription gratuite.', lien: 'nestock.pro/waitlist?utm=instagram' },
        { date: '2026-08-04', reseau: 'reddit', angle: 'r/france update final', contenu: 'Nestock — update final avant beta. Merci pour tous les retours de la communaute.', lien: 'nestock.pro/waitlist?utm=reddit' },
        { date: '2026-08-05', reseau: 'tiktok', angle: 'Compte a rebours final', contenu: 'Le lancement de Nestock approche. Es-tu sur la liste ? Inscription gratuite maintenant.', lien: 'nestock.pro/waitlist?utm=tiktok' },
        { date: '2026-08-06', reseau: 'facebook', angle: 'Derniere chance', contenu: 'Derniere chance de rejoindre la liste d attente prioritaire avant la beta privee Nestock.', lien: 'nestock.pro/waitlist?utm=facebook' },
        { date: '2026-08-07', reseau: 'instagram', angle: 'CTA final', contenu: 'La beta Nestock arrive. Les premiers inscrits ont un acces prioritaire. Lien en bio.', lien: 'nestock.pro/waitlist?utm=instagram' },
      ]
      const { error } = await supabase.from('editorial_calendar').insert(posts)
      if (error) throw error
      return NextResponse.json({ success: true, count: posts.length })
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
  } catch (err) {
    console.error('Calendar error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

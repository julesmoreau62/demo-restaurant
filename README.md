# Démo restaurant — ’t Kanneke

Site de démonstration de la formule **Standard** de [Moreau Digital](https://moreaudigital.fr) : quatre pages pour un estaminet **fictif** du Vieux-Lille.

À publier sur GitHub Pages : https://julesmoreau62.github.io/demo-restaurant/

## L’idée

Chaque page reprend un support de la maison : l’ardoise du jour pour l’accueil, la carte imprimée, le mur de briques et ses cadres pour les photos, le cahier de réservations pour les groupes. L’enseigne est en lettres dorées sur verre noir, la marque est une cruche de grès (« kanneke » en flamand). Les dessins viennent d’une gravure de 1563 d’après Bruegel, *La Cuisine grasse* : à la craie sur l’ardoise, à l’encre sur la carte. Le houblon d’une planche botanique de 1887 pend au-dessus de l’ardoise, comme au plafond des estaminets. Boutons et étiquettes rectangulaires.

## Ce que montre le site

- **L’ardoise** (accueil) : le plat du jour écrit à la craie, dans l’écriture cursive de l’école française, le prix entouré et le dessert. Un sous-bock par jour : on tape dessus, l’éponge passe et l’ardoise se réécrit. Le plat suit le jour de la semaine, il n’y a donc rien à mettre à jour chaque matin. Ouvert ou fermé en direct, à l’heure de Lille
- **Le règlement de la maison** : les infos pratiques (fait maison, frites à la graisse de bœuf et option végétarienne, chiens bienvenus, jeux flamands, réservation, enfants, paiements) affichées au mur comme un vieux règlement d’estaminet
- **La carte** : vingt plats et les boissons, avec les allergènes de chaque plat. Un filtre « je ne mange pas… » (gluten, lait, œufs… et végétarien) grise les plats qui ne conviennent pas et dit pourquoi. La photo de certains plats s’ouvre au toucher. Les bières à la pression sont sur des sous-bocks
- **Les photos** : seize cadres accrochés au mur de briques, et une visionneuse (flèches, glisser du doigt, Échap)
- **Venir & groupes** : le numéro en grand, les services avec le jour surligné, l’accès, l’itinéraire, et le plan Google chargé seulement si on le demande (rien n’est envoyé à Google avant). La demande de groupe se remplit comme le cahier de réservations, à l’encre bleue. Ici rien n’est envoyé ; sur un vrai site, la demande part par e-mail
- Le passage d’une page à l’autre se fait sans clignement dans les navigateurs récents, et la page 404 montre le maigre que l’on met à la porte sur la gravure
- Données structurées `Restaurant` (schema.org)

Le tout reste dans le périmètre Standard : plusieurs pages, la carte, une galerie photos et un formulaire de contact. Pas de réservation en ligne (c’est une fonction Premium) : on réserve par téléphone.

Pour montrer le site à un autre moment pendant une démo : ajouter `?jour=4&heure=12:30` à l’adresse (0 = dimanche, 1 = lundi, jour de fermeture).

## Technique

HTML, CSS et un peu de JavaScript, sans outil de compilation. Polices hébergées sur place, sous licence SIL OFL : Grenze Gotisch (l’enseigne et les titres), Vollkorn (le texte) et Playwrite FR Trad (l’ardoise et le cahier). Les gravures sont en niveaux de gris dans `gravures/` : en mélange « produit » sur le papier, inversées et en mélange « superposition » sur l’ardoise ; le grain de la craie est un filtre SVG. Les photos sont en WebP dans `photos/`, chargées au fil du défilement.

Sans JavaScript, chaque page reste complète : l’ardoise affiche alors toute la semaine. Les animations s’arrêtent si le téléphone demande moins de mouvement.

```bash
python3 -m http.server 8080
```

## Avertissements

- Commerce, adresse et personnes fictifs. Le numéro (03 53 01 68 24) appartient à une plage réservée par l’ARCEP aux œuvres de fiction. La rue du Pot-d’Étain n’existe pas : le plan et l’itinéraire mènent au Vieux-Lille.
- Pages en `noindex`.
- `404.html` part du principe que le dépôt s’appelle `demo-restaurant` (balise `<base>`).
- Les photos montrent d’autres lieux et d’autres assiettes : aucune n’a été prise dans ce restaurant, qui n’existe pas. Aucun visage.

## Crédits des images

- Gravure : Pieter van der Heyden d’après Pieter Bruegel l’Ancien, *La Cuisine grasse*, 1563, The Metropolitan Museum of Art, domaine public (CC0). Détails recadrés.
- Houblon : *Köhler’s Medizinal-Pflanzen*, 1887, domaine public. Détouré.
- Photos [Unsplash](https://unsplash.com/fr/licence) : Tim Raderschad, Vanessa Zhu, Wenceslao Moya grondona de luca, yvonne lee harijanto, Durenne Loris, Alana Harris, You Le, Luna Wang, Tommaso Ubezio, monica di loxley, Martti Salmi, Denis Ivanov.
- Photos Wikimedia Commons : Ji-Elle, [*Gastronomie lilloise servie dans un estaminet*](https://commons.wikimedia.org/wiki/File:Gastronomie_lilloise_servie_dans_un_estaminet.jpg), CC BY-SA 4.0, recadrée ; Jamain, [*Jeu de la grenouille*](https://commons.wikimedia.org/wiki/File:Jeu_de_la_grenouille_J1.jpg), CC BY-SA 3.0 ; Renhour48, potjevleesch, CC0 ; DimiTalen, gaufres fourrées, CC0.

Les crédits figurent aussi sur la page Photos du site.

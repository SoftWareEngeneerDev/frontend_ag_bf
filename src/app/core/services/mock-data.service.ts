import { Injectable } from '@angular/core';
import {
  User, Supplier, Category, Product, Group, Order,
  Notification, Dispute, PlatformStats, MonthlyRevenue, Payment
} from '../models';

@Injectable({ providedIn: 'root' })
export class MockDataService {

  // ── CATEGORIES ────────────────────────────────────────────────────
  readonly categories: Category[] = [
    { id:'cat-1', name:'Électronique',    icon:'fa-solid fa-microchip',    slug:'electronique',   productCount:45 },
    { id:'cat-2', name:'Alimentaire',     icon:'fa-solid fa-wheat-awn',    slug:'alimentaire',    productCount:32 },
    { id:'cat-3', name:'Textile & Mode',  icon:'fa-solid fa-shirt',        slug:'textile',        productCount:28 },
    { id:'cat-4', name:'Maison & Jardin', icon:'fa-solid fa-couch',        slug:'maison',         productCount:21 },
    { id:'cat-5', name:'Santé & Beauté',  icon:'fa-solid fa-heart-pulse',  slug:'sante',          productCount:15 },
    { id:'cat-6', name:'Agriculture',     icon:'fa-solid fa-seedling',     slug:'agriculture',    productCount:12 },
  ];

  // ── USERS ─────────────────────────────────────────────────────────
  readonly memberUser: User = {
    id:'usr-001', fullName:'Kofi Traoré',
    phone:'+22676528609', email:'kofi.traore@gmail.com',
    role:'MEMBER', status:'ACTIVE', trustScore:95,
    city:'Ouagadougou', referralCode:'KOFI7A2F',
    totalSaved:47500, referralCount:3,
    createdAt: new Date('2023-09-15'),
  };

  readonly adminUser: User = {
    id:'usr-admin', fullName:'Aminata Admin',
    phone:'+22600000001', email:'admin@achatgroupebf.com',
    role:'ADMIN', status:'ACTIVE', trustScore:100,
    city:'Ouagadougou', referralCode:'ADMIN001',
    totalSaved:0, createdAt: new Date('2023-01-01'),
  };

  readonly supplierUser: User = {
    id:'usr-sup-1', fullName:'Ibrahim Ouédraogo',
    phone:'+22600000002', email:'ibrahim@techouaga.bf',
    role:'SUPPLIER', status:'ACTIVE', trustScore:98,
    city:'Ouagadougou', referralCode:'IBRA001',
    totalSaved:0, createdAt: new Date('2023-06-01'),
  };

  // ── SUPPLIERS ─────────────────────────────────────────────────────
  readonly suppliers: Supplier[] = [
    {
      id:'sup-001', companyName:'Tech Ouaga SARL',
      contactName:'Ibrahim Ouédraogo',
      phone:'+22600000002', email:'contact@techouaga.bf',
      address:'Secteur 15, Rue 15.34', city:'Ouagadougou',
      description:'Spécialiste en électronique grand public depuis 2018. Produits certifiés, service après-vente inclus.',
      status:'APPROVED', verifiedAt: new Date('2023-06-01'),
      rating:4.8, reviewCount:142, totalGroups:47, successRate:96,
      createdAt: new Date('2023-05-20'), user: {} as User,
    },
    {
      id:'sup-002', companyName:'Confort BF',
      contactName:'Fatimata Compaoré',
      phone:'+22670112233', email:'info@confortbf.bf',
      address:'Zone commerciale, Av. Kwame Nkrumah', city:'Ouagadougou',
      description:'Climatisation, ventilation et équipements maison. Installateurs agréés.',
      status:'APPROVED', verifiedAt: new Date('2023-07-15'),
      rating:4.5, reviewCount:87, totalGroups:23, successRate:91,
      createdAt: new Date('2023-07-01'), user: {} as User,
    },
    {
      id:'sup-003', companyName:'Agri Faso',
      contactName:'Moussa Zoungrana',
      phone:'+22671445566', email:'agrifaso@bf.com',
      address:'Marché Central, Stand B-42', city:'Ouagadougou',
      description:'Produits alimentaires locaux de qualité. Riz, céréales, légumineuses du Burkina Faso.',
      status:'APPROVED', verifiedAt: new Date('2023-08-01'),
      rating:4.3, reviewCount:203, totalGroups:35, successRate:88,
      createdAt: new Date('2023-07-15'), user: {} as User,
    },
    {
      id:'sup-004', companyName:'Sahel Tech SARL',
      contactName:'Adama Kaboré',
      phone:'+22676998877', email:'sahel@tech.bf',
      address:'Rue 4.24, Secteur 12', city:'Bobo-Dioulasso',
      description:'Équipements informatiques et accessoires. Livraison dans tout le Burkina.',
      status:'PENDING',
      rating:0, reviewCount:0, totalGroups:0, successRate:0,
      createdAt: new Date('2024-03-10'), user: {} as User,
    },
    {
      id:'sup-005', companyName:'Mode Savane',
      contactName:'Salimata Ouédraogo',
      phone:'+22677223344', email:'modesavane@bf.com',
      address:'Secteur 7, Rue 7.12', city:'Ouagadougou',
      description:'Tenues traditionnelles et modernes. Bogolan, wax, bazin. Couture sur mesure.',
      status:'APPROVED', verifiedAt: new Date('2023-10-01'),
      rating:4.7, reviewCount:64, totalGroups:18, successRate:94,
      createdAt: new Date('2023-09-15'), user: {} as User,
    },
  ];

  // ── PRODUCTS ──────────────────────────────────────────────────────
  get products(): Product[] {
    return [
      {
        id:'prd-001', emoji:'📱',
        name:'Smartphone Samsung Galaxy A55 5G',
        description:'Écran Super AMOLED 6.6", 128Go, 8Go RAM, 5000mAh, Triple caméra 50MP. Idéal pour usage quotidien intensif. Garantie 12 mois.',
        images:['https://picsum.photos/seed/prd001-phone/600/420'], soloPrice:285000, minGroupPrice:185250,
        category:this.categories[0], supplier:this.suppliers[0],
        status:'ACTIVE', stock:245, rating:4.5, reviewCount:47, activeGroupCount:2,
        createdAt: new Date('2024-01-15'),
      },
      {
        id:'prd-002', emoji:'📺',
        name:'TV LED 55" 4K Ultra HD Smart Android',
        description:'Résolution 4K UHD, Smart TV Android 11, HDR10+, 3x HDMI, 2x USB. Interface intuitive, apps intégrées. Son Dolby Audio.',
        images:['https://picsum.photos/seed/prd002-tv/600/420'], soloPrice:320000, minGroupPrice:214400,
        category:this.categories[0], supplier:this.suppliers[0],
        status:'ACTIVE', stock:80, rating:4.8, reviewCount:23, activeGroupCount:1,
        createdAt: new Date('2024-02-01'),
      },
      {
        id:'prd-003', emoji:'❄️',
        name:'Climatiseur Inverter 12000 BTU',
        description:'Technologie Inverter économique (-40% énergie), WiFi intégré, filtre autonettoyant, silencieux 19dB. Parfait pour le climat du Sahel.',
        images:['https://picsum.photos/seed/prd003-ac/600/420'], soloPrice:185000, minGroupPrice:129500,
        category:this.categories[3], supplier:this.suppliers[1],
        status:'ACTIVE', stock:40, rating:4.6, reviewCount:15, activeGroupCount:2,
        createdAt: new Date('2024-01-20'),
      },
      {
        id:'prd-004', emoji:'🌾',
        name:'Riz Local Basmati 50kg',
        description:'Riz Basmati de qualité premium, cultivé localement au Burkina Faso. Long grain, aromatique, sans OGM. Idéal pour toute la famille.',
        images:['https://picsum.photos/seed/prd004-rice/600/420'], soloPrice:22500, minGroupPrice:16425,
        category:this.categories[1], supplier:this.suppliers[2],
        status:'ACTIVE', stock:500, rating:4.3, reviewCount:89, activeGroupCount:3,
        createdAt: new Date('2024-02-10'),
      },
      {
        id:'prd-005', emoji:'👗',
        name:'Ensemble Tenue Bogolan 2 Pièces Femme',
        description:'Ensemble 2 pièces en tissu Bogolan authentique, couture artisanale burkinabè. Disponible en S, M, L, XL, XXL. Lavable en machine.',
        images:['https://picsum.photos/seed/prd005-fabric/600/420'], soloPrice:35000, minGroupPrice:24850,
        category:this.categories[2], supplier:this.suppliers[4],
        status:'ACTIVE', stock:120, rating:4.7, reviewCount:34, activeGroupCount:1,
        createdAt: new Date('2024-02-20'),
      },
      {
        id:'prd-006', emoji:'☀️',
        name:'Kit Panneaux Solaires Complet 200W',
        description:'Kit complet: panneau monocristallin 200W + régulateur MPPT 30A + câbles 10m + supports. Idéal délestage, autonomie 8h/jour.',
        images:['https://picsum.photos/seed/prd006-solar/600/420'], soloPrice:245000, minGroupPrice:169050,
        category:this.categories[3], supplier:this.suppliers[1],
        status:'ACTIVE', stock:30, rating:4.4, reviewCount:12, activeGroupCount:1,
        createdAt: new Date('2024-03-01'),
      },
      {
        id:'prd-007', emoji:'💻',
        name:'Ordinateur Portable HP 15 Core i5',
        description:'Intel Core i5-12è gén, 8Go RAM, SSD 512Go, écran 15.6" Full HD, Windows 11. Idéal étude et travail bureau.',
        images:['https://picsum.photos/seed/prd007-laptop/600/420'], soloPrice:395000, minGroupPrice:276500,
        category:this.categories[0], supplier:this.suppliers[0],
        status:'ACTIVE', stock:60, rating:4.6, reviewCount:18, activeGroupCount:0,
        createdAt: new Date('2024-03-05'),
      },
      {
        id:'prd-008', emoji:'🍳',
        name:'Cuisinière à Gaz 4 Feux Inox',
        description:'4 feux en inox, four intégré, allumage piézoélectrique. Robuste et économique. Livraison et installation incluses.',
        images:['https://picsum.photos/seed/prd008-stove/600/420'], soloPrice:95000, minGroupPrice:66500,
        category:this.categories[3], supplier:this.suppliers[1],
        status:'ACTIVE', stock:35, rating:4.2, reviewCount:29, activeGroupCount:1,
        createdAt: new Date('2024-03-08'),
      },
    ];
  }

  // ── GROUPS ────────────────────────────────────────────────────────
  get groups(): Group[] {
    const p = this.products;
    const s = this.suppliers;
    return [
      {
        id:'grp-001', product:p[0], supplier:s[0],
        status:'OPEN', minParticipants:10, currentCount:8,
        currentPrice:188600, discountPercent:30,
        depositAmount:18860,
        pricingTiers:[
          {minParticipants:5,  discountPercent:15, price:242250},
          {minParticipants:7,  discountPercent:20, price:228000},
          {minParticipants:8,  discountPercent:30, price:199500},
          {minParticipants:10, discountPercent:35, price:185250},
        ],
        expiresAt: new Date(Date.now() + 2*86400000 + 14*3600000),
        createdAt: new Date('2024-03-10'),
      },
      {
        id:'grp-002', product:p[2], supplier:s[1],
        status:'THRESHOLD_REACHED', minParticipants:6, currentCount:6,
        currentPrice:130000, discountPercent:30,
        depositAmount:13000,
        pricingTiers:[
          {minParticipants:3, discountPercent:10, price:166500},
          {minParticipants:5, discountPercent:20, price:148000},
          {minParticipants:6, discountPercent:30, price:129500},
        ],
        expiresAt: new Date(Date.now() + 11*3600000),
        thresholdReachedAt: new Date(Date.now() - 2*3600000),
        paymentDeadline: new Date(Date.now() + 48*3600000),
        createdAt: new Date('2024-03-08'),
      },
      {
        id:'grp-003', product:p[3], supplier:s[2],
        status:'OPEN', minParticipants:20, currentCount:14,
        currentPrice:16500, discountPercent:27,
        depositAmount:1650,
        pricingTiers:[
          {minParticipants:10, discountPercent:15, price:19125},
          {minParticipants:15, discountPercent:22, price:17550},
          {minParticipants:20, discountPercent:27, price:16425},
        ],
        expiresAt: new Date(Date.now() + 4*86400000 + 7*3600000),
        createdAt: new Date('2024-03-12'),
      },
      {
        id:'grp-004', product:p[4], supplier:s[4],
        status:'OPEN', minParticipants:8, currentCount:5,
        currentPrice:25000, discountPercent:29,
        depositAmount:2500,
        pricingTiers:[
          {minParticipants:5, discountPercent:15, price:29750},
          {minParticipants:8, discountPercent:29, price:24850},
        ],
        expiresAt: new Date(Date.now() + 3*86400000 + 22*3600000),
        createdAt: new Date('2024-03-13'),
      },
      {
        id:'grp-005', product:p[1], supplier:s[0],
        status:'THRESHOLD_REACHED', minParticipants:5, currentCount:5,
        currentPrice:215000, discountPercent:33,
        depositAmount:21500,
        pricingTiers:[
          {minParticipants:3, discountPercent:15, price:272000},
          {minParticipants:5, discountPercent:33, price:214400},
        ],
        expiresAt: new Date(Date.now() + 86400000 + 3*3600000),
        thresholdReachedAt: new Date(Date.now() - 5*3600000),
        paymentDeadline: new Date(Date.now() + 48*3600000),
        createdAt: new Date('2024-03-09'),
      },
      {
        id:'grp-006', product:p[5], supplier:s[1],
        status:'OPEN', minParticipants:8, currentCount:3,
        currentPrice:170000, discountPercent:31,
        depositAmount:17000,
        pricingTiers:[
          {minParticipants:3, discountPercent:15, price:208250},
          {minParticipants:5, discountPercent:22, price:191100},
          {minParticipants:8, discountPercent:31, price:169050},
        ],
        expiresAt: new Date(Date.now() + 6*86400000 + 18*3600000),
        createdAt: new Date('2024-03-14'),
      },
      {
        id:'grp-007', product:p[6], supplier:s[0],
        status:'OPEN', minParticipants:6, currentCount:2,
        currentPrice:316000, discountPercent:20,
        depositAmount:31600,
        pricingTiers:[
          {minParticipants:3, discountPercent:10, price:355500},
          {minParticipants:6, discountPercent:20, price:316000},
        ],
        expiresAt: new Date(Date.now() + 5*86400000 + 10*3600000),
        createdAt: new Date('2024-03-14'),
      },
      {
        id:'grp-008', product:p[7], supplier:s[1],
        status:'OPEN', minParticipants:5, currentCount:4,
        currentPrice:66500, discountPercent:30,
        depositAmount:6650,
        pricingTiers:[
          {minParticipants:3, discountPercent:15, price:80750},
          {minParticipants:5, discountPercent:30, price:66500},
        ],
        expiresAt: new Date(Date.now() + 1*86400000 + 8*3600000),
        createdAt: new Date('2024-03-13'),
      },
    ];
  }

  // ── ORDERS ────────────────────────────────────────────────────────
  get orders(): Order[] {
    const g = this.groups;
    const p = this.products;
    return [
      {
        id:'cmd-2024-0847', member:{} as any, group:g[4],
        product:p[1], amount:215000, status:'SHIPPED',
        trackingCode:'DHL-BF-2024-48291',
        createdAt: new Date('2024-03-16'),
      },
      {
        id:'cmd-2024-0623', member:{} as any, group:g[2],
        product:p[3], amount:16500, status:'DELIVERED',
        trackingCode:'BF-EMS-9203',
        deliveredAt: new Date('2024-03-08'),
        createdAt: new Date('2024-03-01'),
      },
      {
        id:'cmd-2024-0591', member:{} as any, group:g[3],
        product:p[4], amount:25000, status:'DELIVERED',
        trackingCode:'BF-EMS-8874',
        deliveredAt: new Date('2024-03-02'),
        createdAt: new Date('2024-02-26'),
      },
    ];
  }

  // ── NOTIFICATIONS ─────────────────────────────────────────────────
  readonly notifications: Notification[] = [
    { id:'n1', type:'NEW_MEMBER',        read:false, title:'Nouveau membre dans votre groupe !',       body:'Samsung Galaxy A55 passe à 8/10. Prix: 188,600 XOF', createdAt: new Date(Date.now()-12*60000) },
    { id:'n2', type:'THRESHOLD_REACHED', read:false, title:'🎯 Seuil atteint ! Procédez au paiement', body:'Climatiseur 12000 BTU — 6/6 participants. Payez le solde avant le 20 mars.',  createdAt: new Date(Date.now()-80*60000) },
    { id:'n3', type:'PAYMENT_REMINDER',  read:false, title:'⏰ Rappel : paiement dû dans 48h',         body:'Solde restant : 117,000 XOF pour le Climatiseur 12000 BTU', createdAt: new Date(Date.now()-3*3600000) },
    { id:'n4', type:'ORDER_SHIPPED',     read:true,  title:'📦 Votre commande est expédiée !',         body:'TV LED 55" — Code suivi: DHL-BF-2024-48291', createdAt: new Date(Date.now()-24*3600000) },
    { id:'n5', type:'PAYMENT_SUCCESS',   read:true,  title:'✅ Groupe réussi ! Commande créée',        body:'Riz Basmati 50kg — 20/20 membres | CMD-2024-0312', createdAt: new Date(Date.now()-2*86400000) },
    { id:'n6', type:'PROMO',             read:true,  title:'⭐ Nouveau groupe : Samsung S24 Ultra',    body:'Rejoignez maintenant — 45% de réduction à 15 membres', createdAt: new Date(Date.now()-3*86400000) },
  ];

  // ── PAYMENTS ──────────────────────────────────────────────────────
  readonly payments: Payment[] = [
    { id:'pay-001', user:{} as any, group:{} as any, type:'DEPOSIT', status:'SUCCESS', method:'ORANGE_MONEY', amount:18860, reference:'TXN-2024-890123', transactionId:'OM-8912', createdAt: new Date('2024-03-10') },
    { id:'pay-002', user:{} as any, group:{} as any, type:'DEPOSIT', status:'SUCCESS', method:'MOOV_MONEY',   amount:13000, reference:'TXN-2024-891456', transactionId:'MM-7823', createdAt: new Date('2024-03-08') },
    { id:'pay-003', user:{} as any, group:{} as any, type:'FINAL',   status:'SUCCESS', method:'ORANGE_MONEY', amount:117000,reference:'TXN-2024-892371', transactionId:'OM-9234', createdAt: new Date('2024-03-15') },
  ];

  // ── DISPUTES ──────────────────────────────────────────────────────
  get disputes(): Dispute[] {
    const o = this.orders;
    return [
      { id:'dis-001', order:o[0], reporter:this.memberUser, reason:'NOT_RECEIVED',  description:'Commande passée il y a 10 jours, non reçue malgré le code de suivi.',  status:'OPEN',        createdAt: new Date(Date.now()-3*86400000) },
      { id:'dis-002', order:o[1], reporter:this.memberUser, reason:'QUALITY_ISSUE', description:'Riz reçu mais qualité non conforme à la description (grains cassés).', status:'IN_PROGRESS', resolution:"En cours d'investigation avec le fournisseur.", createdAt: new Date(Date.now()-5*86400000) },
    ];
  }

  // ── PLATFORM STATS ────────────────────────────────────────────────
  readonly platformStats: PlatformStats = {
    totalMembers:5247, activeGroups:43, successRate:89,
    totalRevenue:3240000, totalCommissions:226800,
    newMembersToday:23, escrowAmount:1250000,
    openDisputes:7, pendingSuppliers:4, pendingProducts:3,
  };

  readonly monthlyRevenue: MonthlyRevenue[] = [
    { month:'Oct', revenue:850000,  commissions:59500,  groups:18 },
    { month:'Nov', revenue:1200000, commissions:84000,  groups:25 },
    { month:'Déc', revenue:980000,  commissions:68600,  groups:21 },
    { month:'Jan', revenue:1650000, commissions:115500, groups:34 },
    { month:'Fév', revenue:2100000, commissions:147000, groups:42 },
    { month:'Mar', revenue:3240000, commissions:226800, groups:58 },
  ];

  // ── TESTIMONIALS ──────────────────────────────────────────────────
  readonly testimonials = [
    { name:'Aminata Sawadogo', city:'Ouagadougou', role:'Enseignante',  rating:5, text:"J'ai économisé 85,000 XOF sur mon Samsung Galaxy ! Le groupe s'est rempli en 3 jours. Paiement Orange Money super simple." },
    { name:'Moussa Traoré',    city:'Bobo-Dioulasso', role:'Entrepreneur', rating:5, text:"Excellent service ! Le fournisseur était très professionnel, la livraison rapide. Je recommande à tous mes amis." },
    { name:'Fatimata Compaoré',city:'Ouagadougou', role:'Médecin',       rating:4, text:"Concept révolutionnaire pour le Burkina. J'ai acheté mon climatiseur 30% moins cher. Parfait pour la saison chaude !" },
  ];
}

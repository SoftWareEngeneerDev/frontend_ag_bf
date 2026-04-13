# AchatGroupéBF — Frontend Angular 17

## Stack
- Angular 17 (Modules, pas Standalone)
- SCSS avec design system "Tech Savanna"
- RxJS + Signals
- Lazy loading par feature module

## Lancement
```bash
npm install
npm start        # http://localhost:4300
npm run build    # Build production
```

## Architecture
```
src/app/
├── core/          # Models, Services, Guards, Interceptors
├── shared/        # Composants/Pipes réutilisables + SharedModule
├── layout/        # Navbar, Sidebar, Topbar, Footer + LayoutModule
└── features/
    ├── public/    # Landing, Catalogue, Groupes (pas d'auth requise)
    ├── auth/      # Login, Register, OTP, Forgot Password
    ├── member/    # Dashboard, Groupes, Paiement, Commandes, Profil
    ├── supplier/  # Dashboard, Produits, Groupes, Commandes
    └── admin/     # Dashboard, Utilisateurs, Analytics, Litiges...
```

## Comptes de démo
| Rôle | Téléphone | Mot de passe |
|------|-----------|--------------|
| Membre | +22676528609 | Member@2024! |
| Fournisseur | +22600000002 | Supplier@2024! |
| Admin | +22600000001 | Admin@2024! |

import React from 'react';

// Define all icons
const Icons = {
  building: (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
    </svg>
  ),
  chat: (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
    </svg>
  ),
  check: (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
    </svg>
  ),
  compare: (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
    </svg>
  ),
  clock: (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  ),
  growth: (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
    </svg>
  ),
  visibility: (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
    </svg>
  ),
  users: (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
    </svg>
  ),
  profile: (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
    </svg>
  ),
  team: (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
    </svg>
  ),
  chart: (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
    </svg>
  ),
  pricing: (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  ),
  network: (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
    </svg>
  ),
  settings: (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
    </svg>
  ),
  mobile: (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
    </svg>
  ),
  language: (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
    </svg>
  ),
  swap: (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
    </svg>
  ),
  api: (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
    </svg>
  )
};

// Features as agreed
export const featuresData = {
  userFeatures: [
    {
      id: "one-stop-platform",
      title: "Visos paslaugos vienoje vietoje",
      description: "Raskite visas Jūsų verslui reikalingas administracines paslaugas vienoje platformoje: juridiniai adresai, buhalterija, teisės paslaugos ir dar daugiau.",
      icon: Icons.building,
      isAvailable: true,
      comingSoon: false
    },
    {
      id: "favorites",
      title: "Tiekėjų pamėgimas",
      description: "Pridėkite tiekėjus į pamėgtųjų sąrašą, kad galėtumėte greitai rasti juos ateityje.",
      icon: Icons.users,
      isAvailable: true,
      comingSoon: false
    },
    {
      id: "streamlined-communication",
      title: "Paprastas bendravimas",
      description: "Viena žinučių sistema visiems paslaugų teikėjams - nebereikia sekti daugybės el. laiškų su skirtingais tiekėjais.",
      icon: Icons.chat,
      isAvailable: true,
      comingSoon: false
    },
    {
      id: "verified-vendors",
      title: "Patikrinti tiekėjai",
      description: "Visi platformoje esantys paslaugų teikėjai pereina patikimumo patikrą - dirbkite tik su patikrintais partneriais.",
      icon: Icons.check,
      isAvailable: true,
      comingSoon: false
    },
    {
      id: "service-comparison",
      title: "Paslaugų palyginimai",
      description: "Lengvai lyginkite paslaugų teikėjų kainas, sąlygas ir funkcijas, kad išsirinktumėte geriausią pasiūlymą jūsų verslui.",
      icon: Icons.compare,
      isAvailable: false,
      comingSoon: true
    },
    {
      id: "quick-response",
      title: "Greitas Atsakymo Laikas",
      description: "Gaukite pasiūlymus iš kelių tiekėjų per valandas, o ne dienas - taupykite laiką ir greičiau priimkite sprendimus.",
      icon: Icons.clock,
      isAvailable: false,
      comingSoon: true
    }
  ],
  
  vendorFeatures: [
    {
      id: "targeted-visibility",
      title: "Tikslingas matomumas",
      description: "Būkite atrandami įmonių, kurios ieško būtent Jūsų teikiamų paslaugų - pasiekite tikslingą auditoriją.",
      icon: Icons.visibility,
      isAvailable: true,
      comingSoon: false
    },
    {
      id: "claim-business",
      title: "Verslo profilio pretendavimas",
      description: "Pretenduokite į savo verslo profilį ir valdykite jį tiesiogiai platformoje.",
      icon: Icons.profile,
      isAvailable: true,
      comingSoon: false
    },
    {
      id: "team-management",
      title: "Komandos narių valdymas",
      description: "Pridėkite savo komandos narius ir jų kompetencijas į verslo profilį.",
      icon: Icons.team,
      isAvailable: true,
      comingSoon: false
    },
    {
      id: "client-management",
      title: "Klientų valdymas",
      description: "Sekite visą komunikaciją ir paslaugų teikimą vienoje vietoje - turėkite aiškų vaizdą apie visus klientų užklausimus.",
      icon: Icons.users,
      isAvailable: true,
      comingSoon: false
    },
    {
      id: "client-feedback",
      title: "Klientų atsiliepimų analitika",
      description: "Identifikuokite stipriąsias puses ir tobulintinas sritis pagal klientų atsiliepimus - nuolat tobulinkite paslaugas.",
      icon: Icons.chart,
      isAvailable: true,
      comingSoon: false
    },
    {
      id: "price-optimization",
      title: "Kainų optimizavimas",
      description: "Koreguokite savo kainodarą remdamiesi rinkos duomenimis ir konkurentų analize - maksimizuokite pelningumą.",
      icon: Icons.pricing,
      isAvailable: false,
      comingSoon: true
    }
  ],
  
  platformFeatures: [
    {
      id: "business-network",
      title: "Verslo Tinklaveidis",
      description: "Susisiekite su papildomomis paslaugomis teikiančiais partneriais ir plėskite savo verslo tinklą.",
      icon: Icons.network,
      isAvailable: true,
      comingSoon: false
    },
    {
      id: "customizable-dashboard",
      title: "Personalizuota aplinka",
      description: "Pritaikykite savo darbalaukį pagal poreikius ir matykite tik Jums aktualiausią informaciją.",
      icon: Icons.settings,
      isAvailable: true,
      comingSoon: false
    },
    {
      id: "mobile-app",
      title: "Mobili aplikacija",
      description: "Valdykite savo verslą kelionėje su pilnai funkcionalia mobilia aplikacija - B2B kontaktų užmezgimas vienu braukimu.",
      icon: Icons.mobile,
      isAvailable: false,
      comingSoon: true
    },
    {
      id: "integrated-communication",
      title: "Integruota komunikacija",
      description: "Realaus laiko žinutės su vertimo palaikymu tarptautiniams klientams - bendravimas be kalbos barjerų.",
      icon: Icons.language,
      isAvailable: false,
      comingSoon: true
    },
    {
      id: "service-swap",
      title: "Paslaugų mainai",
      description: "Siūlykite ir gaukite paslaugas mainais - efektyvus būdas mažiems ir vidutiniams verslams dalintis kompetencijomis.",
      icon: Icons.swap,
      isAvailable: false,
      comingSoon: true
    },
    {
      id: "api-integration",
      title: "API integracija",
      description: "Integruokitės su ES PVM ir kitomis sistemomis - automatizuokite duomenų tikrinimą ir valdymą.",
      icon: Icons.api,
      isAvailable: false,
      comingSoon: true
    }
  ]
};

export default featuresData;
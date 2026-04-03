export const status = [
  {
    name: "draft",
    description:
      "item can be edited by sellers or admin but won't be seen on the online store",
  },
  {
    name: "publish",
    description:
      "item can still be editable and will be seen on the online store",
  },
  {
    name: "approve",
    description: "item will be on the online store",
  },
  {
    name: "reject",
    description: "item won't be  on the online store",
  },
  {
    name: "archive",
    description:
      "item won't be edited anymore and won't be seen on the online store",
  },
];

export const statusWithdrawals = [
  {
    name: "draft",
    description:
      "item can be edited by sellers or admin but won't be seen on the online store",
  },
  {
    name: "publish",
    description:
      "item can still be editable and will be seen on the online store",
  },
  {
    name: "pending",
    description: "item will be on the online store",
  },
  {
    name: "paid",
    description: "item won't be  on the online store",
  },
];

export const orderStatus = [
  {
    name: "pending",
    description: "",
  },
  {
    name: "processing",
    description: "",
  },
  {
    name: "onhold",
    description: "",
  },
  {
    name: "completed",
    description: "",
  },
  {
    name: "refunded",
    description: "",
  },
  {
    name: "failed",
    description: "",
  },
];

export const trackingStatus = [
  {
    name: "order placed",
    slug: "orderplaced",
    description: "",
  },
  {
    name: "packaging",
    slug: "packaging",
    description: "",
  },
  {
    name: "on the road",
    slug: "ontheroad",
    description: "",
  },
  {
    name: "delivered",
    slug: "delivered",
    description: "",
  },
];

export const inventory = [
  {
    name: "in stock",
    slug: "instock",
    description: "item can be purchased",
  },
  {
    name: "out stock",
    slug: "outstock",
    description: "item is not available",
  },
];

export const featured = [
  {
    name: "yes",
    slug: true,
    description: "item can featured",
  },
  {
    name: "no",
    slug: false,
    description: "item is not item can featured",
  },
];

export const countries = [
  { name: "Afghanistan" },
  { name: "Albania" },
  { name: "Algeria" },
  { name: "Andorra" },
  { name: "Angola" },
  { name: "Antigua and Barbuda" },
  { name: "Argentina" },
  { name: "Armenia" },
  { name: "Australia" },
  { name: "Austria" },
  { name: "Azerbaijan" },
  { name: "Bahamas" },
  { name: "Bahrain" },
  { name: "Bangladesh" },
  { name: "Barbados" },
  { name: "Belarus" },
  { name: "Belgium" },
  { name: "Belize" },
  { name: "Benin" },
  { name: "Bhutan" },
  { name: "Bolivia" },
  { name: "Bosnia and Herzegovina" },
  { name: "Botswana" },
  { name: "Brazil" },
  { name: "Brunei" },
  { name: "Bulgaria" },
  { name: "Burkina Faso" },
  { name: "Burundi" },
  { name: "Cabo Verde" },
  { name: "Cambodia" },
  { name: "Cameroon" },
  { name: "Canada" },
  { name: "Central African Republic" },
  { name: "Chad" },
  { name: "Chile" },
  { name: "China" },
  { name: "Colombia" },
  { name: "Comoros" },
  { name: "Congo (Congo-Brazzaville)" },
  { name: "Costa Rica" },
  { name: "Croatia" },
  { name: "Cuba" },
  { name: "Cyprus" },
  { name: "Czech Republic" },
  { name: "Democratic Republic of the Congo" },
  { name: "Denmark" },
  { name: "Djibouti" },
  { name: "Dominica" },
  { name: "Dominican Republic" },
  { name: "Ecuador" },
  { name: "Egypt" },
  { name: "El Salvador" },
  { name: "Equatorial Guinea" },
  { name: "Eritrea" },
  { name: "Estonia" },
  { name: "Eswatini" },
  { name: "Ethiopia" },
  { name: "Fiji" },
  { name: "Finland" },
  { name: "France" },
  { name: "Gabon" },
  { name: "Gambia" },
  { name: "Georgia" },
  { name: "Germany" },
  { name: "Ghana" },
  { name: "Greece" },
  { name: "Grenada" },
  { name: "Guatemala" },
  { name: "Guinea" },
  { name: "Guinea-Bissau" },
  { name: "Guyana" },
  { name: "Haiti" },
  { name: "Honduras" },
  { name: "Hungary" },
  { name: "Iceland" },
  { name: "India" },
  { name: "Indonesia" },
  { name: "Iran" },
  { name: "Iraq" },
  { name: "Ireland" },
  { name: "Israel" },
  { name: "Italy" },
  { name: "Ivory Coast" }, // also known as Côte d'Ivoire
  { name: "Jamaica" },
  { name: "Japan" },
  { name: "Jordan" },
  { name: "Kazakhstan" },
  { name: "Kenya" },
  { name: "Kiribati" },
  { name: "Kuwait" },
  { name: "Kyrgyzstan" },
  { name: "Laos" },
  { name: "Latvia" },
  { name: "Lebanon" },
  { name: "Lesotho" },
  { name: "Liberia" },
  { name: "Libya" },
  { name: "Liechtenstein" },
  { name: "Lithuania" },
  { name: "Luxembourg" },
  { name: "Madagascar" },
  { name: "Malawi" },
  { name: "Malaysia" },
  { name: "Maldives" },
  { name: "Mali" },
  { name: "Malta" },
  { name: "Marshall Islands" },
  { name: "Mauritania" },
  { name: "Mauritius" },
  { name: "Mexico" },
  { name: "Micronesia" },
  { name: "Moldova" },
  { name: "Monaco" },
  { name: "Mongolia" },
  { name: "Montenegro" },
  { name: "Morocco" },
  { name: "Mozambique" },
  { name: "Myanmar" }, // formerly Burma
  { name: "Namibia" },
  { name: "Nauru" },
  { name: "Nepal" },
  { name: "Netherlands" },
  { name: "New Zealand" },
  { name: "Nicaragua" },
  { name: "Niger" },
  { name: "Nigeria" },
  { name: "North Korea" },
  { name: "North Macedonia" },
  { name: "Norway" },
  { name: "Oman" },
  { name: "Pakistan" },
  { name: "Palau" },
  { name: "Palestine" }, // UN observer state
  { name: "Panama" },
  { name: "Papua New Guinea" },
  { name: "Paraguay" },
  { name: "Peru" },
  { name: "Philippines" },
  { name: "Poland" },
  { name: "Portugal" },
  { name: "Qatar" },
  { name: "Republic of the Congo" }, // already included earlier as "Congo (Congo-Brazzaville)"
  { name: "Romania" },
  { name: "Russia" },
  { name: "Rwanda" },
  { name: "Saint Kitts and Nevis" },
  { name: "Saint Lucia" },
  { name: "Saint Vincent and the Grenadines" },
  { name: "Samoa" },
  { name: "San Marino" },
  { name: "Sao Tome and Principe" },
  { name: "Saudi Arabia" },
  { name: "Senegal" },
  { name: "Serbia" },
  { name: "Seychelles" },
  { name: "Sierra Leone" },
  { name: "Singapore" },
  { name: "Slovakia" },
  { name: "Slovenia" },
  { name: "Solomon Islands" },
  { name: "Somalia" },
  { name: "South Africa" },
  { name: "South Korea" },
  { name: "South Sudan" },
  { name: "Spain" },
  { name: "Sri Lanka" },
  { name: "Sudan" },
  { name: "Suriname" },
  { name: "Sweden" },
  { name: "Switzerland" },
  { name: "Syria" },
  { name: "Tajikistan" },
  { name: "Tanzania" },
  { name: "Thailand" },
  { name: "Timor-Leste" },
  { name: "Togo" },
  { name: "Tonga" },
  { name: "Trinidad and Tobago" },
  { name: "Tunisia" },
  { name: "Turkey" },
  { name: "Turkmenistan" },
  { name: "Tuvalu" },
  { name: "Uganda" },
  { name: "Ukraine" },
  { name: "United Arab Emirates" },
  { name: "United Kingdom" },
  { name: "United States" },
  { name: "Uruguay" },
  { name: "Uzbekistan" },
  { name: "Vanuatu" },
  { name: "Vatican City" }, // UN observer state
  { name: "Venezuela" },
  { name: "Vietnam" },
  { name: "Yemen" },
  { name: "Zambia" },
  { name: "Zimbabwe" },
];

export const units = [
  {
    name: "gram",
    slug: "gram",
    symbol: "g",
    description: "",
  },
  {
    name: "kilogram",
    symbol: "kg",
    slug: "kilogram",
    description: "item is not available",
  },
];

export const statusCampaigns = [
  {
    name: "draft",
    description:
      "item can be edited by sellers or admin but won't be seen on the online store",
  },
  {
    name: "publish",
    description:
      "item can still be editable and will be seen on the online store",
  },
];

export const storeStatus = [
  {
    name: "online",
    description: "Your online store is available on the market",
  },
  {
    name: "pending",
    description: "Your online store is not available on the market",
  },
  {
    name: "suspended",
    description:
      "Your online store is not available on the market and have issues",
  },
];

export const people = [
  {
    id: 1,
    name: "microsoft",
    designation: "Software Company",
    image: "https://cdn-icons-png.flaticon.com/128/732/732221.png",
  },
  {
    id: 2,
    name: "amazon",
    designation: "online market company",
    image: "https://cdn-icons-png.flaticon.com/128/11378/11378728.png",
  },
  {
    id: 3,
    name: "slack",
    designation: "online chat platform",
    image: "https://cdn-icons-png.flaticon.com/128/3800/3800024.png",
  },
  {
    id: 4,
    name: "google",
    designation: "tech company",
    image: "https://cdn-icons-png.flaticon.com/128/10110/10110386.png",
  },
  {
    id: 5,
    name: "meta",
    designation: "tech company",
    image: "https://cdn-icons-png.flaticon.com/128/6033/6033714.png",
  },
  {
    id: 6,
    name: "linkedin",
    designation: " profesional social media",
    image: "https://cdn-icons-png.flaticon.com/128/145/145807.png",
  },
];

export const pro = [
  {
    id: 1,
    name: "Sylvain Codes",
    designation: "Busness man",
    image:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80",
  },
  {
    id: 2,
    name: "Robert Johnson",
    designation: "Busness man",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 3,
    name: "Jane Smith",
    designation: "CEO",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 4,
    name: "Emily Davis",
    designation: "UX/UI Designer",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 5,
    name: "Tyler Durden",
    designation: "Busness man",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80",
  },
  {
    id: 6,
    name: "Dora",
    designation: "Busness woman",
    image:
      "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3534&q=80",
  },
];

export const subscriptionPlan = [
  {
    id: 1,
    type: "Basic",
    description: "The essentials to launch your store.",
    title: "standard plan",
    roles: [
      {
        title: "1 store",
        active: true,
      },
      {
        title: "no campaigns",
        active: false,
      },
      {
        title: "no mailing",
        active: false,
      },
      {
        title: "reports and data analysis",
        active: false,
      },
    ],
    price: 25000,
    period: "month",
  },
  {
    id: 2,
    type: "pro",
    description: "Grow your store rapidly.",
    title: "premium plan",
    roles: [
      {
        title: "unlimited stores",
        active: true,
      },
      {
        title: "unlimited campaigns",
        active: true,
      },
      {
        title: "unlimited mailing",
        active: true,
      },
      {
        title: "reports and data analysis",
        active: true,
      },
    ],
    price: 50000,
    period: "month",
  },
  {
    id: 3,
    type: "enterprise",
    description: "For large businesses with advanced needs.",
    title: "enterprise plan",
    roles: [
      {
        title: "team accounts",
        active: true,
      },
      {
        title: "priority support (24/7 chat & phone)",
        active: true,
      },
      {
        title: "API custom integrations",
        active: true,
      },
      {
        title: "early access to new features",
        active: true,
      },
      
      
    ],
    price: 100000,
    period: "month",
  },
];

 export const regions = [
    {
    name: "Rwanda",
     image: "/assets/images/rwanda.png",
   },
//   {
//     name: "all",
//     image: "https://cdn-icons-png.flaticon.com/128/9985/9985721.png",
//   },
//   {
//     name: "canada",
//     image: "https://cdn-icons-png.flaticon.com/128/197/197430.png",
//   },
//   {
//     name: "france",
//     image: "https://cdn-icons-png.flaticon.com/128/197/197560.png",
//   },
//   {
//     name: "usa",
//     image: "https://cdn-icons-png.flaticon.com/128/3909/3909383.png",
//   },
//   {
//     name: "spain",
//     image: "https://cdn-icons-png.flaticon.com/128/197/197593.png",
//   },
//   {
//     name: "china",
//     image: "https://cdn-icons-png.flaticon.com/128/197/197375.png",
//   },
];

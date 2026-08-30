using EStore.Api.Models;

namespace EStore.Api.Data;

public static class DemoSeed
{
    public static IReadOnlyList<SeedLocation> Locations { get; } =
    [
        new("Kigali City Mall - Ground Floor", "KCM-GF", "Main mall pickup point.", "KN 2 Ave", "Nyarugenge", "Kigali", "Rwanda", "Ground", "G12"),
        new("Kacyiru Tech Plaza", "KTP-01", "Tech kiosk near offices.", "KG 7 Ave", "Gasabo", "Kigali", "Rwanda", "1", "1B"),
        new("Remera Lifestyle Hub", "RLH-02", "Wearables and lifestyle hub.", "KG 11 Ave", "Gasabo", "Kigali", "Rwanda", "2", "204"),
        new("Kimironko Market Annex", "KMA-03", "High-volume fulfillment point.", "KG 28 Ave", "Gasabo", "Kigali", "Rwanda", "Annex", "A7"),
        new("Nyarutarama Gallery", "NG-04", "Premium boutique pickup spot.", "KG 9 Ave", "Gasabo", "Kigali", "Rwanda", "3", "312")
    ];

    public static IReadOnlyList<SeedCategory> Categories { get; } =
    [
        new("Electronics", "Phones, audio, and accessories."),
        new("Home Office", "Desk essentials and productivity gear."),
        new("Wearables", "Smart devices for daily carry."),
        new("Gaming", "Consoles and immersive accessories."),
        new("Mobile Accessories", "Chargers, cases, cables, and mounts."),
        new("Smart Home", "Connected tools for modern homes."),
        new("Beauty", "Skincare and self-care products."),
        new("Fashion", "Wardrobe and soft-furnishing staples."),
        new("Kitchen", "Cookware and kitchen essentials."),
        new("Fitness", "Training and recovery gear.")
    ];

    public static IReadOnlyList<SeedVendor> Vendors { get; } =
    [
        new("Kigali City Electronics", "Kigali City Electronics Ltd", "+250788000001", "hello@kcm.rw", "Core electronics storefront.", "Kigali City Mall - Ground Floor"),
        new("Savanna Mobile", "Savanna Mobile Rwanda Ltd", "+250788000002", "sales@savannamobile.rw", "Mobile devices and accessories.", "Kacyiru Tech Plaza"),
        new("Urban Workspace", "Urban Workspace Ltd", "+250788000003", "team@urbanworkspace.rw", "Office and productivity gear.", "Kigali City Mall - Ground Floor"),
        new("Pulse Fitness Hub", "Pulse Fitness Hub Ltd", "+250788000004", "fit@pulsehub.rw", "Fitness and wearables catalog.", "Remera Lifestyle Hub"),
        new("Casa Living", "Casa Living Rwanda Ltd", "+250788000005", "support@casaliving.rw", "Home and lifestyle essentials.", "Kimironko Market Annex")
    ];

    public static IReadOnlyList<SeedProduct> Products { get; } =
    [
        new("Kigali City Electronics", "Electronics", "Orion Smart Speaker", "Compact wireless speaker.", 129.99m, 18, "https://picsum.photos/seed/orion-speaker/900/900"),
        new("Kigali City Electronics", "Electronics", "Pulse Noise Cancelling Headphones", "Over-ear travel headphones.", 219.99m, 12, "https://picsum.photos/seed/pulse-headphones/900/900"),
        new("Kigali City Electronics", "Home Office", "Atlas Mechanical Keyboard", "Compact tactile keyboard.", 149.99m, 14, "https://picsum.photos/seed/atlas-keyboard/900/900"),
        new("Kigali City Electronics", "Home Office", "Nimbus Wireless Charger", "Fast charging pad.", 39.99m, 30, "https://picsum.photos/seed/nimbus-charger/900/900"),
        new("Kigali City Electronics", "Electronics", "Nova Travel Power Bank", "Portable high-capacity battery.", 59.99m, 25, "https://picsum.photos/seed/nova-power-bank/900/900"),
        new("Kigali City Electronics", "Smart Home", "Halo Smart Plug", "Voice-ready smart plug.", 24.99m, 34, "https://picsum.photos/seed/halo-plug/900/900"),
        new("Kigali City Electronics", "Gaming", "Vector RGB Gaming Mouse", "Precision gaming mouse.", 49.99m, 28, "https://picsum.photos/seed/vector-mouse/900/900"),
        new("Kigali City Electronics", "Gaming", "Zenith 27 Monitor", "High refresh work and play display.", 299.99m, 10, "https://picsum.photos/seed/zenith-monitor/900/900"),
        new("Kigali City Electronics", "Smart Home", "EchoView Indoor Camera", "Indoor camera with alerts.", 89.99m, 16, "https://picsum.photos/seed/echoview-camera/900/900"),
        new("Kigali City Electronics", "Electronics", "Aero Mini Projector", "Portable movie and presentation projector.", 189.99m, 11, "https://picsum.photos/seed/aero-projector/900/900"),
        new("Kigali City Electronics", "Home Office", "Lumen Desk Lamp", "Dimmable desk lamp.", 44.99m, 24, "https://picsum.photos/seed/lumen-lamp/900/900"),
        new("Kigali City Electronics", "Electronics", "Drift Portable SSD", "Fast external storage.", 119.99m, 20, "https://picsum.photos/seed/drift-ssd/900/900"),

        new("Savanna Mobile", "Electronics", "Savanna X1 Smartphone", "Reliable mid-range phone.", 349.99m, 22, "https://picsum.photos/seed/savanna-x1/900/900"),
        new("Savanna Mobile", "Electronics", "Savanna X1 Pro Smartphone", "Premium OLED smartphone.", 519.99m, 15, "https://picsum.photos/seed/savanna-x1-pro/900/900"),
        new("Savanna Mobile", "Mobile Accessories", "AirLoop Wireless Earbuds", "Pocket earbuds with deep bass.", 79.99m, 40, "https://picsum.photos/seed/airloop-earbuds/900/900"),
        new("Savanna Mobile", "Mobile Accessories", "RapidCharge GaN Adapter", "Compact fast wall charger.", 34.99m, 55, "https://picsum.photos/seed/rapidcharge-adapter/900/900"),
        new("Savanna Mobile", "Mobile Accessories", "FlexShield Phone Case", "Slim shock-absorbing case.", 19.99m, 60, "https://picsum.photos/seed/flexshield-case/900/900"),
        new("Savanna Mobile", "Mobile Accessories", "RoadTrip Magnetic Mount", "Dashboard magnetic mount.", 26.99m, 44, "https://picsum.photos/seed/roadtrip-mount/900/900"),
        new("Savanna Mobile", "Wearables", "Stride Smartwatch", "GPS smartwatch for daily use.", 139.99m, 18, "https://picsum.photos/seed/stride-watch/900/900"),
        new("Savanna Mobile", "Mobile Accessories", "ClearView Screen Protector", "Tempered glass screen protector.", 14.99m, 80, "https://picsum.photos/seed/clearview-protector/900/900"),
        new("Savanna Mobile", "Mobile Accessories", "Wave USB-C Cable", "Braided fast-charge cable.", 12.99m, 95, "https://picsum.photos/seed/wave-cable/900/900"),
        new("Savanna Mobile", "Electronics", "Beam 10 Tablet", "Tablet for study and streaming.", 229.99m, 13, "https://picsum.photos/seed/beam-tablet/900/900"),
        new("Savanna Mobile", "Smart Home", "Pocket Wi-Fi Router", "Portable hotspot router.", 69.99m, 26, "https://picsum.photos/seed/pocket-router/900/900"),
        new("Savanna Mobile", "Mobile Accessories", "Commute Car Charger", "Dual-port car charger.", 18.99m, 47, "https://picsum.photos/seed/commute-charger/900/900"),
        new("Savanna Mobile", "Gaming", "Clip Pro Mobile Controller", "Controller grip for mobile gaming.", 54.99m, 17, "https://picsum.photos/seed/clip-controller/900/900"),
        new("Savanna Mobile", "Mobile Accessories", "Signal Bluetooth Tracker", "Small tracker for keys and bags.", 24.99m, 39, "https://picsum.photos/seed/signal-tracker/900/900"),

        new("Urban Workspace", "Home Office", "Summit Ergonomic Chair", "Breathable support chair.", 259.99m, 9, "https://picsum.photos/seed/summit-chair/900/900"),
        new("Urban Workspace", "Home Office", "Arc Standing Desk", "Electric sit-stand desk.", 499.99m, 6, "https://picsum.photos/seed/arc-desk/900/900"),
        new("Urban Workspace", "Home Office", "Pixel Webcam", "Full HD webcam.", 74.99m, 23, "https://picsum.photos/seed/pixel-webcam/900/900"),
        new("Urban Workspace", "Home Office", "Focus Noise Filter Mic", "USB microphone for calls.", 109.99m, 14, "https://picsum.photos/seed/focus-mic/900/900"),
        new("Urban Workspace", "Home Office", "Ledger Docking Station", "Dual-display docking station.", 159.99m, 15, "https://picsum.photos/seed/ledger-dock/900/900"),
        new("Urban Workspace", "Home Office", "Nimbus Laptop Stand", "Aluminum laptop riser.", 42.99m, 32, "https://picsum.photos/seed/nimbus-stand/900/900"),
        new("Urban Workspace", "Home Office", "PaperTrail Notebook Set", "Premium notebook trio.", 18.99m, 50, "https://picsum.photos/seed/papertrail-notebooks/900/900"),
        new("Urban Workspace", "Home Office", "Orbit Task Planner", "Weekly planning board.", 27.99m, 29, "https://picsum.photos/seed/orbit-planner/900/900"),
        new("Urban Workspace", "Home Office", "Clarity Blue Light Glasses", "Reduce screen fatigue.", 31.99m, 27, "https://picsum.photos/seed/clarity-glasses/900/900"),
        new("Urban Workspace", "Electronics", "Echo Conference Speakerphone", "Portable conference speaker.", 129.99m, 12, "https://picsum.photos/seed/echo-speakerphone/900/900"),
        new("Urban Workspace", "Home Office", "Frame Cork Board", "Wall board for reminders.", 24.99m, 35, "https://picsum.photos/seed/frame-board/900/900"),
        new("Urban Workspace", "Home Office", "Quill Pen Organizer", "Stationery and device organizer.", 21.99m, 41, "https://picsum.photos/seed/quill-organizer/900/900"),

        new("Pulse Fitness Hub", "Fitness", "Orbit Fitness Tracker", "All-day activity tracker.", 89.99m, 22, "https://picsum.photos/seed/orbit-fitness-tracker/900/900"),
        new("Pulse Fitness Hub", "Fitness", "Kinetic Yoga Mat", "Non-slip yoga mat.", 35.99m, 36, "https://picsum.photos/seed/kinetic-mat/900/900"),
        new("Pulse Fitness Hub", "Fitness", "Core Resistance Bands", "Five-band workout set.", 24.99m, 48, "https://picsum.photos/seed/core-bands/900/900"),
        new("Pulse Fitness Hub", "Fitness", "Stride Running Belt", "Running belt for essentials.", 19.99m, 38, "https://picsum.photos/seed/stride-belt/900/900"),
        new("Pulse Fitness Hub", "Wearables", "Aero Sport Earbuds", "Sweat-resistant workout earbuds.", 69.99m, 31, "https://picsum.photos/seed/aero-sport-earbuds/900/900"),
        new("Pulse Fitness Hub", "Fitness", "Lift Adjustable Dumbbells", "Space-saving dumbbells.", 299.99m, 8, "https://picsum.photos/seed/lift-dumbbells/900/900"),
        new("Pulse Fitness Hub", "Fitness", "Recover Foam Roller", "Recovery foam roller.", 29.99m, 26, "https://picsum.photos/seed/recover-roller/900/900"),
        new("Pulse Fitness Hub", "Fitness", "Hydra Steel Bottle", "Insulated workout bottle.", 22.99m, 52, "https://picsum.photos/seed/hydra-bottle/900/900"),
        new("Pulse Fitness Hub", "Fitness", "Tempo Jump Rope", "Weighted jump rope.", 17.99m, 43, "https://picsum.photos/seed/tempo-rope/900/900"),
        new("Pulse Fitness Hub", "Fitness", "Balance Recovery Massage Gun", "Multi-speed massage gun.", 149.99m, 13, "https://picsum.photos/seed/balance-gun/900/900"),
        new("Pulse Fitness Hub", "Fitness", "Peak Trail Running Vest", "Hydration vest for runners.", 79.99m, 18, "https://picsum.photos/seed/peak-vest/900/900"),
        new("Pulse Fitness Hub", "Beauty", "Revive Cooling Towel", "Fast-drying cooling towel.", 14.99m, 67, "https://picsum.photos/seed/revive-towel/900/900"),

        new("Casa Living", "Kitchen", "Terra Ceramic Cookware Set", "Everyday non-stick cookware.", 199.99m, 11, "https://picsum.photos/seed/terra-cookware/900/900"),
        new("Casa Living", "Kitchen", "Harvest Knife Block", "Five-piece knife block.", 84.99m, 19, "https://picsum.photos/seed/harvest-knives/900/900"),
        new("Casa Living", "Kitchen", "Brew Drip Coffee Maker", "Programmable coffee maker.", 69.99m, 17, "https://picsum.photos/seed/brew-coffee-maker/900/900"),
        new("Casa Living", "Kitchen", "Oak Serving Board", "Large wooden serving board.", 29.99m, 33, "https://picsum.photos/seed/oak-board/900/900"),
        new("Casa Living", "Fashion", "Luna Cotton Throw", "Soft decorative throw.", 34.99m, 24, "https://picsum.photos/seed/luna-throw/900/900"),
        new("Casa Living", "Fashion", "Cloud Linen Bedding Set", "Breathable bedding set.", 119.99m, 16, "https://picsum.photos/seed/cloud-bedding/900/900"),
        new("Casa Living", "Smart Home", "Glow Ambient Lamp", "Touch-control bedside lamp.", 39.99m, 28, "https://picsum.photos/seed/glow-lamp/900/900"),
        new("Casa Living", "Beauty", "Silk Sleep Mask", "Soft sleep mask.", 16.99m, 49, "https://picsum.photos/seed/silk-mask/900/900"),
        new("Casa Living", "Beauty", "Cedar Reed Diffuser", "Clean woody room fragrance.", 21.99m, 37, "https://picsum.photos/seed/cedar-diffuser/900/900"),
        new("Casa Living", "Kitchen", "FreshSeal Storage Set", "Stackable food containers.", 26.99m, 45, "https://picsum.photos/seed/freshseal-storage/900/900"),
        new("Casa Living", "Kitchen", "Spark Blender", "Countertop smoothie blender.", 94.99m, 14, "https://picsum.photos/seed/spark-blender/900/900"),
        new("Casa Living", "Fashion", "Willow Woven Basket", "Textured storage basket.", 27.99m, 21, "https://picsum.photos/seed/willow-basket/900/900")
    ];

    public static IReadOnlyList<SeedCustomer> Customers { get; } =
    [
        new("alice.k", "Alice Kayitesi", "+250780100001", "alice@example.com", "en"),
        new("ben.m", "Ben Mugisha", "+250780100002", "ben@example.com", "en"),
        new("chantal.u", "Chantal Uwase", "+250780100003", "chantal@example.com", "fr"),
        new("diane.n", "Diane Niyonkuru", "+250780100004", "diane@example.com", "rw"),
        new("eric.h", "Eric Habimana", "+250780100005", "eric@example.com", "en"),
        new("fiona.r", "Fiona Rukundo", "+250780100006", "fiona@example.com", "en"),
        new("gabriel.s", "Gabriel Shema", "+250780100007", "gabriel@example.com", "rw"),
        new("hope.c", "Hope Cyuzuzo", "+250780100008", "hope@example.com", "fr"),
        new("isaac.g", "Isaac Gisa", "+250780100009", "isaac@example.com", "en"),
        new("joy.m", "Joy Mutesi", "+250780100010", "joy@example.com", "rw")
    ];

    public static IReadOnlyList<SeedCart> Carts { get; } =
    [
        new("alice.k", [new("Orion Smart Speaker", 1), new("Wave USB-C Cable", 2)]),
        new("ben.m", [new("Summit Ergonomic Chair", 1), new("Pixel Webcam", 1)]),
        new("chantal.u", [new("Kinetic Yoga Mat", 1), new("Hydra Steel Bottle", 1)]),
        new("diane.n", [new("Terra Ceramic Cookware Set", 1), new("FreshSeal Storage Set", 2)]),
        new("eric.h", [new("Savanna X1 Smartphone", 1), new("RapidCharge GaN Adapter", 1)])
    ];

    public static IReadOnlyList<SeedReview> Reviews { get; } =
    [
        new("alice.k", "Orion Smart Speaker", 5, "Great sound", "Easy to set up and surprisingly loud."),
        new("ben.m", "Atlas Mechanical Keyboard", 5, "Excellent typing feel", "Solid switches and compact layout."),
        new("chantal.u", "Savanna X1 Smartphone", 4, "Reliable daily phone", "Battery lasts through the day."),
        new("diane.n", "Terra Ceramic Cookware Set", 5, "Kitchen upgrade", "Heats evenly and looks great."),
        new("eric.h", "Orbit Fitness Tracker", 4, "Good tracking", "Useful insights without being bulky."),
        new("fiona.r", "Summit Ergonomic Chair", 5, "Worth it", "Back support is noticeably better."),
        new("gabriel.s", "Halo Smart Plug", 4, "Simple smart home start", "Schedules were easy to set up."),
        new("hope.c", "Cloud Linen Bedding Set", 5, "Very comfortable", "Soft fabric and nice finish."),
        new("isaac.g", "Aero Sport Earbuds", 4, "Workout ready", "Stays in place during runs."),
        new("joy.m", "Spark Blender", 4, "Blends smoothly", "Strong motor and easy cleanup."),
        new("alice.k", "Pulse Noise Cancelling Headphones", 5, "Travel essential", "Comfortable and effective."),
        new("ben.m", "Ledger Docking Station", 4, "Useful desk upgrade", "Works well with external displays.")
    ];

    public static IReadOnlyList<SeedReservation> Reservations(DateTimeOffset now) =>
    [
        new("RES-KCM-DEMO-001", "310001", "alice.k", "Kigali City Electronics", ReservationStatus.Completed, now.AddDays(-10), now.AddDays(-9), "Ready for pickup.", [new("Orion Smart Speaker", 1), new("Nova Travel Power Bank", 1)]),
        new("RES-KCM-DEMO-002", "310002", "ben.m", "Urban Workspace", ReservationStatus.Confirmed, now.AddDays(-3), now.AddDays(1), "Prepared at service desk.", [new("Summit Ergonomic Chair", 1)]),
        new("RES-KCM-DEMO-003", "310003", "chantal.u", "Savanna Mobile", ReservationStatus.Pending, now.AddDays(-1), now.AddDays(2), "Customer requested evening pickup.", [new("Savanna X1 Smartphone", 1), new("ClearView Screen Protector", 1)]),
        new("RES-KCM-DEMO-004", "310004", "diane.n", "Casa Living", ReservationStatus.Completed, now.AddDays(-8), now.AddDays(-7), "Packed with gift wrap.", [new("Terra Ceramic Cookware Set", 1), new("Oak Serving Board", 1)]),
        new("RES-KCM-DEMO-005", "310005", "eric.h", "Pulse Fitness Hub", ReservationStatus.Cancelled, now.AddDays(-6), now.AddDays(-5), "Cancelled after schedule change.", [new("Lift Adjustable Dumbbells", 1)]),
        new("RES-KCM-DEMO-006", "310006", "fiona.r", "Pulse Fitness Hub", ReservationStatus.Confirmed, now.AddDays(-2), now.AddDays(1), "Reserved for weekend pickup.", [new("Balance Recovery Massage Gun", 1), new("Hydra Steel Bottle", 1)]),
        new("RES-KCM-DEMO-007", "310007", "gabriel.s", "Savanna Mobile", ReservationStatus.Rejected, now.AddDays(-4), now.AddDays(-3), "Color option went out of stock.", [new("Beam 10 Tablet", 1)]),
        new("RES-KCM-DEMO-008", "310008", "hope.c", "Casa Living", ReservationStatus.Pending, now.AddHours(-20), now.AddHours(10), "Customer wants to inspect finish.", [new("Cloud Linen Bedding Set", 1), new("Glow Ambient Lamp", 2)])
    ];
}

public record SeedLocation(string Name, string Code, string Description, string AddressLine1, string Region, string City, string Country, string Floor, string Unit);
public record SeedCategory(string Name, string Description);
public record SeedVendor(string DisplayName, string LegalName, string ContactPhone, string ContactEmail, string Description, string LocationName);
public record SeedProduct(string VendorDisplayName, string Category, string Name, string Description, decimal Price, int StockQuantity, string ImageUrl);
public record SeedCustomer(string Username, string FullName, string PhoneNumber, string Email, string PreferredLanguage);
public record SeedCart(string CustomerUsername, SeedCartItem[] Items);
public record SeedCartItem(string ProductName, int Quantity);
public record SeedReview(string CustomerUsername, string ProductName, int Rating, string Title, string Comment);
public record SeedReservation(string ReservationNumber, string PickupCode, string CustomerUsername, string VendorDisplayName, ReservationStatus Status, DateTimeOffset CreatedAt, DateTimeOffset ExpiresAt, string VendorNotes, SeedReservationItem[] Items);
public record SeedReservationItem(string ProductName, int Quantity);

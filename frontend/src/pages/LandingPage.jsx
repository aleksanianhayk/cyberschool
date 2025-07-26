<!DOCTYPE html>
<html lang="hy">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>CyberStorm - Ապահով Թվային Կրթություն</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --brand-green: #78C841;
            --brand-lime: #B4E50D;
            --brand-orange: #FF9B2F;
            --brand-red: #FB4141;
            --brand-dark: #1f2937;
            --brand-light-green: #f0fdf4;
        }
        body { font-family: 'Inter', sans-serif; }
        .hero-section { background-color: var(--brand-green); }
        .highlight { color: var(--brand-lime); }
        .btn-primary { background-color: var(--brand-orange); color: white; }
        .btn-primary:hover { background-color: #E68A2A; }
        .btn-secondary { background-color: transparent; border: 2px solid var(--brand-lime); color: var(--brand-lime); }
        .btn-secondary:hover { background-color: var(--brand-lime); color: var(--brand-dark); }
        .header-scrolled { background-color: rgba(255, 255, 255, 0.95); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header-scrolled h2 { color: var(--brand-dark); }
        .header-scrolled .nav-link { color: var(--brand-dark); }
        .header-scrolled .cta-button { background-color: var(--brand-orange); color: white; }
        .fade-in-section { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease-out, transform 0.6s ease-out; }
        .fade-in-section.is-visible { opacity: 1; transform: translateY(0); }
    </style>
</head>
<body class="bg-slate-50">

    <nav id="navbar" class="fixed top-0 left-0 w-full z-50 transition-all duration-300 py-4">
        <div class="container mx-auto px-6 flex justify-between items-center">
            <div class="nav-logo">
                <h2 class="text-3xl font-bold text-white transition-colors duration-300">CyberStorm</h2>
            </div>
            <ul class="hidden md:flex items-center space-x-8">
                <li><a href="#features" class="nav-link text-white font-semibold transition-colors duration-300">Առանձնահատկություններ</a></li>
                <li><a href="#audience" class="nav-link text-white font-semibold transition-colors duration-300">Ում համար է</a></li>
                <li><a href="/authentication" class="nav-link cta-button bg-white text-gray-800 font-bold px-6 py-2 rounded-lg shadow-md hover:bg-gray-200 transition-all duration-300">Սկսել</a></li>
            </ul>
        </div>
    </nav>

    <section class="hero-section pt-40 pb-24">
        <div class="container mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
            <div class="hero-content text-white text-center md:text-left">
                <h1 class="text-4xl md:text-6xl font-extrabold leading-tight">
                    Ապահով թվային ուսուցում <span class="highlight">նոր սերնդի</span> համար
                </h1>
                <p class="mt-6 text-lg text-green-100">
                    CyberStorm-ը ստեղծում է ինտերակտիվ և անվտանգ միջավայր, որտեղ երեխաները, ծնողները և ուսուցիչները միասին սովորում են թվային գրագիտություն և կիբերանվտանգություն։
                </p>
                <div class="mt-8 flex justify-center md:justify-start space-x-4">
                    <a href="/authentication" class="btn-primary font-bold px-8 py-3 rounded-lg text-lg shadow-lg hover:scale-105 transform transition-transform duration-300">Սկսել ուսումը</a>
                </div>
            </div>
            <div class="hero-image relative">
                <img src="/frontend/public/dragon1.png" alt="CyberStorm Dragon Mascot" class="w-full max-w-sm mx-auto md:max-w-md"/>
            </div>
        </div>
    </section>

    <section id="audience" class="py-20">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16 fade-in-section">
                <h2 class="text-4xl font-bold">Ստեղծված է կրթական համայնքի համար</h2>
                <p class="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">CyberStorm-ը ստեղծում է անվտանգ էկոհամակարգ, որտեղ աշակերտները, ծնողները և ուսուցիչները համագործակցում են։</p>
            </div>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="audience-card bg-white p-8 rounded-xl shadow-lg fade-in-section">
                    <h3 class="text-2xl font-bold mb-4" style="color: var(--brand-green);">Աշակերտների համար</h3>
                    <p class="text-gray-600">Ինտերակտիվ դասընթացներ՝ 12 եզակի բաղադրիչներով, ներառյալ վիկտորինաներ, համապատասխանեցման խաղեր և կիբերանվտանգության գործնական մարտահրավերներ։</p>
                </div>
                <div class="audience-card bg-white p-8 rounded-xl shadow-lg fade-in-section" style="transition-delay: 200ms;">
                    <h3 class="text-2xl font-bold mb-4" style="color: var(--brand-orange);">Ծնողների համար</h3>
                    <p class="text-gray-600">Հետևեք ձեր երեխայի ուսումնական ուղուն համապարփակ հաշվետվությունների միջոցով և ստացեք մուտք դեպի կրթական ռեսուրսներ։</p>
                </div>
                <div class="audience-card bg-white p-8 rounded-xl shadow-lg fade-in-section" style="transition-delay: 400ms;">
                    <h3 class="text-2xl font-bold mb-4" style="color: var(--brand-red);">Ուսուցիչների համար</h3>
                    <p class="text-gray-600">Օգտվեք համապարփակ ուղեցույցներից և օգտագործեք մեր հարթակը որպես հզոր կրթական գործիք ձեր դասարանում։</p>
                </div>
            </div>
        </div>
    </section>

    <section id="features" class="py-20 bg-brand-light-green">
        <div class="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div class="feature-image fade-in-section">
                <img src="/frontend/public/dragon2.png" alt="Interactive course screenshot"/>
            </div>
            <div class="feature-text fade-in-section">
                <h2 class="text-4xl font-bold mb-6">Ժամանակակից ուսուցման հզոր հնարավորություններ</h2>
                <p class="text-lg text-gray-600 mb-8">Այն ամենը, ինչ ձեզ անհրաժեշտ է՝ ստեղծելու անվտանգ և գրավիչ կիբերանվտանգության կրթական փորձ։</p>
                <ul class="space-y-4">
                    <li class="flex items-start"><span class="text-xl mr-3" style="color: var(--brand-green);">✔</span> <span><strong class="font-semibold">Ինտերակտիվ դասընթացներ։</strong> Բազմաէջ ուսումնական մոդուլներ՝ 12 եզակի բաղադրիչներով։</span></li>
                    <li class="flex items-start"><span class="text-xl mr-3" style="color: var(--brand-green);">✔</span> <span><strong class="font-semibold">Առաջընթացի հետևում։</strong> Խելացի համակարգ, որը պահպանում է օգտատերերի առաջընթացը։</span></li>
                    <li class="flex items-start"><span class="text-xl mr-3" style="color: var(--brand-green);">✔</span> <span><strong class="font-semibold">AI Օգնական։</strong> Gemini API-ի վրա հիմնված մեր AI-ն տալիս է անհատականացված պատասխաններ։</span></li>
                </ul>
            </div>
        </div>
    </section>

    <section class="cta py-24" style="background-color: var(--brand-dark);">
        <div class="container mx-auto px-6 text-center">
            <div class="cta-content">
                <h2 class="text-4xl font-bold text-white">Պատրա՞ստ եք փոխել թվային ուսուցումը։</h2>
                <p class="mt-4 text-lg text-gray-300">Միացեք հազարավոր ուսանողների, ծնողների և ուսուցիչների, ովքեր արդեն կառուցում են ավելի անվտանգ թվային ապագա։</p>
                <div class="mt-8">
                    <a href="/authentication" class="btn-primary font-bold px-10 py-4 rounded-lg text-xl shadow-lg hover:scale-105 transform transition-transform duration-300">Սկսել անվճար</a>
                </div>
            </div>
        </div>
    </section>

    <footer id="contact" class="footer bg-gray-900 text-white py-16">
        <div class="container mx-auto px-6 grid md:grid-cols-4 gap-8">
            <div class="footer-section">
                <h3 class="text-2xl font-bold mb-4">CyberStorm</h3>
                <p class="text-gray-400">Նոր սերնդի զինումը՝ անվտանգ թվային գրագիտությամբ և կիբերանվտանգության կրթությամբ։</p>
            </div>
            <div class="footer-section">
                <h4 class="font-bold text-lg mb-4">Հարթակ</h4>
                <ul class="space-y-2 text-gray-400">
                    <li><a href="#" class="hover:text-white">Դասընթացներ</a></li>
                    <li><a href="#" class="hover:text-white">Meetup-ներ</a></li>
                    <li><a href="#" class="hover:text-white">AI Օգնական</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4 class="font-bold text-lg mb-4">Աջակցություն</h4>
                <ul class="space-y-2 text-gray-400">
                    <li><a href="#" class="hover:text-white">Օգնության կենտրոն</a></li>
                    <li><a href="#" class="hover:text-white">Կապ մեզ հետ</a></li>
                    <li><a href="#" class="hover:text-white">Գաղտնիության քաղաքականություն</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4 class="font-bold text-lg mb-4">Միացեք մեզ</h4>
                <ul class="space-y-2 text-gray-400">
                    <li><a href="#" class="hover:text-white">Բլոգ</a></li>
                    <li><a href="#" class="hover:text-white">Համայնք</a></li>
                </ul>
            </div>
        </div>
        <div class="container mx-auto px-6 mt-12 border-t border-gray-700 pt-8 text-center text-gray-500">
            <p>&copy; 2025 CyberStorm. Բոլոր իրավունքները պաշտպանված են։</p>
        </div>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const navbar = document.getElementById('navbar');
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    navbar.classList.add('header-scrolled');
                } else {
                    navbar.classList.remove('header-scrolled');
                }
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.fade-in-section').forEach(section => {
                observer.observe(section);
            });
        });
    </script>
</body>
</html>

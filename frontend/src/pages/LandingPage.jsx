// /frontend/src/pages/LandingPage.jsx

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    // This useEffect hook contains all the JavaScript for the page animations
    useEffect(() => {
        const navbar = document.getElementById('navbar');
        const handleScroll = () => {
            if (window.scrollY > 50) {
                navbar.classList.add('header-scrolled');
            } else {
                navbar.classList.remove('header-scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll);

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

        // Cleanup function to remove event listeners when the component unmounts
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.querySelectorAll('.fade-in-section').forEach(section => {
                observer.unobserve(section);
            });
        };
    }, []);

    return (
        <>
            {/* All custom CSS is now embedded here for simplicity */}
            <style>{`
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
                #navbar.header-scrolled { background-color: rgba(255, 255, 255, 0.95); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                #navbar.header-scrolled h2 { color: var(--brand-dark); }
                #navbar.header-scrolled .nav-link { color: var(--brand-dark); }
                #navbar.header-scrolled .cta-button { background-color: var(--brand-orange); color: white; }
                .fade-in-section { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease-out, transform 0.6s ease-out; }
                .fade-in-section.is-visible { opacity: 1; transform: translateY(0); }
            `}</style>

            <div className="bg-slate-50">
                <nav id="navbar" className="fixed top-0 left-0 w-full z-50 transition-all duration-300 py-4">
                    <div className="container mx-auto px-6 flex justify-between items-center">
                        <div className="nav-logo">
                            <h2 className="text-3xl font-bold text-white transition-colors duration-300">CyberStorm</h2>
                        </div>
                        <ul className="hidden md:flex items-center space-x-8">
                            <li><a href="#features" className="nav-link text-white font-semibold transition-colors duration-300">Առանձնահատկություններ</a></li>
                            <li><a href="#audience" className="nav-link text-white font-semibold transition-colors duration-300">Ում համար է</a></li>
                            <li><Link to="/authentication" className="nav-link cta-button bg-white text-gray-800 font-bold px-6 py-2 rounded-lg shadow-md hover:bg-gray-200 transition-all duration-300">Սկսել</Link></li>
                        </ul>
                    </div>
                </nav>

                <section className="hero-section pt-40 pb-24">
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
                        <div className="hero-content text-white text-center md:text-left">
                            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                                Ապահով թվային ուսուցում <span className="highlight">նոր սերնդի</span> համար
                            </h1>
                            <p className="mt-6 text-lg text-green-100">
                                CyberStorm-ը ստեղծում է ինտերակտիվ և անվտանգ միջավայր, որտեղ երեխաները, ծնողները և ուսուցիչները միասին սովորում են թվային գրագիտություն և կիբերանվտանգություն։
                            </p>
                            <div className="mt-8 flex justify-center md:justify-start space-x-4">
                                <Link to="/authentication" className="btn-primary font-bold px-8 py-3 rounded-lg text-lg shadow-lg hover:scale-105 transform transition-transform duration-300">Սկսել ուսումը</Link>
                            </div>
                        </div>
                        <div className="hero-image relative">
                            <img src="https://i.imgur.com/gC0y5bJ.png" alt="CyberStorm Dragon Mascot" className="w-full max-w-sm mx-auto md:max-w-md"/>
                        </div>
                    </div>
                </section>

                <section id="audience" className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16 fade-in-section">
                            <h2 className="text-4xl font-bold">Ստեղծված է կրթական համայնքի համար</h2>
                            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">CyberStorm-ը ստեղծում է անվտանգ էկոհամակարգ, որտեղ աշակերտները, ծնողները և ուսուցիչները համագործակցում են։</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="audience-card bg-white p-8 rounded-xl shadow-lg fade-in-section">
                                <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--brand-green)'}}>Աշակերտների համար</h3>
                                <p className="text-gray-600">Ինտերակտիվ դասընթացներ՝ 12 եզակի բաղադրիչներով, ներառյալ վիկտորինաներ, համապատասխանեցման խաղեր և կիբերանվտանգության գործնական մարտահրավերներ։</p>
                            </div>
                            <div className="audience-card bg-white p-8 rounded-xl shadow-lg fade-in-section" style={{transitionDelay: '200ms'}}>
                                <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--brand-orange)'}}>Ծնողների համար</h3>
                                <p className="text-gray-600">Հետևեք ձեր երեխայի ուսումնական ուղուն համապարփակ հաշվետվությունների միջոցով և ստացեք մուտք դեպի կրթական ռեսուրսներ։</p>
                            </div>
                            <div className="audience-card bg-white p-8 rounded-xl shadow-lg fade-in-section" style={{transitionDelay: '400ms'}}>
                                <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--brand-red)'}}>Ուսուցիչների համար</h3>
                                <p className="text-gray-600">Օգտվեք համապարփակ ուղեցույցներից և օգտագործեք մեր հարթակը որպես հզոր կրթական գործիք ձեր դասարանում։</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="py-20 bg-brand-light-green">
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div className="feature-image fade-in-section">
                            <img src="https://i.imgur.com/i4aYx1h.png" alt="Interactive course screenshot"/>
                        </div>
                        <div className="feature-text fade-in-section">
                            <h2 className="text-4xl font-bold mb-6">Ժամանակակից ուսուցման հզոր հնարավորություններ</h2>
                            <p className="text-lg text-gray-600 mb-8">Այն ամենը, ինչ ձեզ անհրաժեշտ է՝ ստեղծելու անվտանգ և գրավիչ կիբերանվտանգության կրթական փորձ։</p>
                            <ul className="space-y-4">
                                <li className="flex items-start"><span className="text-xl mr-3" style={{color: 'var(--brand-green)'}}>✔</span> <span><strong className="font-semibold">Ինտերակտիվ դասընթացներ։</strong> Բազմաէջ ուսումնական մոդուլներ՝ 12 եզակի բաղադրիչներով։</span></li>
                                <li className="flex items-start"><span className="text-xl mr-3" style={{color: 'var(--brand-green)'}}>✔</span> <span><strong className="font-semibold">Առաջընթացի հետևում։</strong> Խելացի համակարգ, որը պահպանում է օգտատերերի առաջընթացը։</span></li>
                                <li className="flex items-start"><span className="text-xl mr-3" style={{color: 'var(--brand-green)'}}>✔</span> <span><strong className="font-semibold">AI Օգնական։</strong> Gemini API-ի վրա հիմնված մեր AI-ն տալիս է անհատականացված պատասխաններ։</span></li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="cta py-24" style={{backgroundColor: 'var(--brand-dark)'}}>
                    <div className="container mx-auto px-6 text-center">
                        <div className="cta-content">
                            <h2 className="text-4xl font-bold text-white">Պատրա՞ստ եք փոխել թվային ուսուցումը։</h2>
                            <p className="mt-4 text-lg text-gray-300">Միացեք հազարավոր ուսանողների, ծնողների և ուսուցիչների, ովքեր արդեն կառուցում են ավելի անվտանգ թվային ապագա։</p>
                            <div className="mt-8">
                                <Link to="/authentication" className="btn-primary font-bold px-10 py-4 rounded-lg text-xl shadow-lg hover:scale-105 transform transition-transform duration-300">Սկսել անվճար</Link>
                            </div>
                        </div>
                    </div>
                </section>

                <footer id="contact" className="footer bg-gray-900 text-white py-16">
                    <div className="container mx-auto px-6 grid md:grid-cols-4 gap-8">
                        <div className="footer-section">
                            <h3 className="text-2xl font-bold mb-4">CyberStorm</h3>
                            <p className="text-gray-400">Նոր սերնդի զինումը՝ անվտանգ թվային գրագիտությամբ և կիբերանվտանգության կրթությամբ։</p>
                        </div>
                        <div className="footer-section">
                            <h4 className="font-bold text-lg mb-4">Հարթակ</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">Դասընթացներ</a></li>
                                <li><a href="#" className="hover:text-white">Meetup-ներ</a></li>
                                <li><a href="#" className="hover:text-white">AI Օգնական</a></li>
                            </ul>
                        </div>
                        <div className="footer-section">
                            <h4 className="font-bold text-lg mb-4">Աջակցություն</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">Օգնության կենտրոն</a></li>
                                <li><a href="#" className="hover:text-white">Կապ մեզ հետ</a></li>
                                <li><a href="#" className="hover:text-white">Գաղտնիության քաղաքականություն</a></li>
                            </ul>
                        </div>
                        <div className="footer-section">
                            <h4 className="font-bold text-lg mb-4">Միացեք մեզ</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">Բլոգ</a></li>
                                <li><a href="#" className="hover:text-white">Համայնք</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="container mx-auto px-6 mt-12 border-t border-gray-700 pt-8 text-center text-gray-500">
                        <p>&copy; 2025 CyberStorm. Բոլոր իրավունքները պաշտպանված են։</p>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default LandingPage;

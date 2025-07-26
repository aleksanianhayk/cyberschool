// /frontend/src/pages/LandingPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

// --- Reusable Components for the Landing Page ---

const Header = () => (
    <header className="absolute top-0 left-0 w-full z-30 p-4">
        <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">CyberStorm</h1>
            <Link to="/authentication" className="bg-white text-indigo-600 font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-gray-200 transition">
                Մուտք
            </Link>
        </div>
    </header>
);

const HeroSection = () => (
    <section className="relative bg-indigo-700 text-white pt-32 pb-20 text-center overflow-hidden">
        <div className="container mx-auto relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
                Կառուցիր քո թվային վահանը
            </h2>
            <p className="mt-4 text-lg md:text-xl text-indigo-200 max-w-2xl mx-auto">
                Սովորիր, թե ինչպես մնալ անվտանգ և վստահ առցանց աշխարհում։ Ինտերակտիվ դասընթացներ ուսանողների, ծնողների և ուսուցիչների համար։
            </p>
            <div className="mt-8">
                <Link to="/authentication" className="bg-white text-indigo-700 font-bold px-8 py-4 rounded-lg text-lg shadow-xl hover:bg-gray-200 transition transform hover:scale-105">
                    Սկսել ուսումը հիմա
                </Link>
            </div>
        </div>
        {/* Abstract background shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 z-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
        </div>
    </section>
);

const FeaturesSection = () => {
    const features = [
        { title: "Ինտերակտիվ դասընթացներ", description: "Սովորեք՝ անելով։ Գործնական առաջադրանքներ, որոնք ուսուցումը դարձնում են արդյունավետ և զվարճալի։" },
        { title: "Ուղիղ եթերով հանդիպումներ", description: "Միացեք ոլորտի փորձագետների հետ ուղիղ եթերով քննարկումներին և ստացեք ձեր հարցերի պատասխանները։" },
        { title: "Ուղեցույց ուսուցիչների համար", description: "Ստացեք ռեսուրսներ և ուղեցույցներ՝ ձեր աշակերտներին թվային գրագիտություն սովորեցնելու համար։" },
        { title: "AI օգնական", description: "Մեր AI օգնականը պատրաստ է 24/7 պատասխանել ձեր հարցերին՝ պարզ և հասկանալի լեզվով։" },
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto text-center">
                <h3 className="text-3xl font-bold mb-12">Այն ամենը, ինչ անհրաժեշտ է խելացի սովորելու համար</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map(feature => (
                        <div key={feature.title} className="bg-white p-6 rounded-lg shadow-md">
                            <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const ValuePropSection = ({ title, description, imageUrl, reverse = false }) => (
    <section className="py-20">
        <div className={`container mx-auto flex flex-col md:flex-row items-center gap-12 ${reverse ? 'md:flex-row-reverse' : ''}`}>
            <div className="md:w-1/2">
                <img src={imageUrl} alt={title} className="rounded-lg shadow-2xl" />
            </div>
            <div className="md:w-1/2">
                <h3 className="text-3xl font-bold mb-4">{title}</h3>
                <p className="text-lg text-gray-600">{description}</p>
            </div>
        </div>
    </section>
);

const Footer = () => (
    <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto text-center">
            <p>&copy; {new Date().getFullYear()} CyberStorm. Բոլոր իրավունքները պաշտպանված են։</p>
        </div>
    </footer>
);

const LandingPage = () => {
    return (
        <div className="bg-white">
            <Header />
            <HeroSection />
            <FeaturesSection />
            <ValuePropSection 
                title="Ուսանողների համար"
                description="Դարձրեք ձեր առցանց փորձը ավելի անվտանգ։ Մեր դասընթացները կօգնեն ձեզ հասկանալ թվային աշխարհի կանոնները՝ պաշտպանելով ձեր անձնական տվյալները և խուսափելով վտանգներից։"
                imageUrl="https://i.imgur.com/3Y1mZ9Q.png"
            />
            <ValuePropSection 
                title="Ծնողների համար"
                description="Ստացեք վստահություն՝ ձեր երեխաներին առցանց աշխարհում ուղղորդելու համար։ Մենք տրամադրում ենք ռեսուրսներ, որոնք կօգնեն ձեզ սկսել կարևոր խոսակցություններ և ստեղծել անվտանգ թվային միջավայր տանը։"
                imageUrl="https://i.imgur.com/jWk5a9Y.png"
                reverse={true}
            />
            <Footer />
        </div>
    );
};

export default LandingPage;

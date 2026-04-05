import Script from 'next/script';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import MobileMenu from '@/components/landing/MobileMenu';

// CSS Imports
import '@/assets/css/bootstrap.min.css';
import '@/assets/css/swiper-bundle.css';
import '@/assets/css/animate.min.css';
import '@/assets/css/custom-animation.css';
import '@/assets/css/magnific-popup.css';
import '@/assets/css/odometer-theme-default.css';
import '@/assets/css/fontawesome-all.min.css';
import '@/assets/css/meanmenu.css';
import '@/assets/css/flaticon.css';
import '@/assets/css/main.css';

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="landing-page-wrapper">
            
            {/* Core jQuery and Bootstrap for Landing */}
            <Script src="/assets/js/vendor/jquery-3.6.0.min.js" strategy="beforeInteractive" />
            <Script src="/assets/js/bootstrap.bundle.min.js" strategy="beforeInteractive" />

            <div id="preloader" style={{ display: 'none' }}>
                <div className="preloader">
                    <span></span>
                    <span></span>
                </div>
            </div>

            <Header />
            <MobileMenu />
            
            <main>
                {children}
            </main>
            
            <Footer />

            {/* Other JS Imports */}
            <Script src="/assets/js/swiper-bundle.js" strategy="afterInteractive" />
            <Script src="/assets/js/isotope.pkgd.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/jquery.meanmenu.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/ajax-form.js" strategy="afterInteractive" />
            <Script src="/assets/js/wow.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/jquery.scrollUp.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/odometer.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/appair.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/imagesloaded.pkgd.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/jquery.magnific-popup.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/plugins.js" strategy="afterInteractive" />
            <Script src="/assets/js/main.js" strategy="afterInteractive" />
        </div>
    );
}

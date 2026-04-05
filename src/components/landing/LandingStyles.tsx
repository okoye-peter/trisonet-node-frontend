'use client';

import { useEffect } from 'react';

const LANDING_STYLES = [
    '/assets/css/bootstrap.min.css',
    '/assets/css/swiper-bundle.css',
    '/assets/css/animate.min.css',
    '/assets/css/custom-animation.css',
    '/assets/css/magnific-popup.css',
    '/assets/css/odometer-theme-default.css',
    '/assets/css/fontawesome-all.min.css',
    '/assets/css/meanmenu.css',
    '/assets/css/flaticon.css',
    '/assets/css/main.css',
];

export default function LandingStyles() {
    useEffect(() => {
        const links: HTMLLinkElement[] = [];

        LANDING_STYLES.forEach((href) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.dataset.landingStyle = 'true';
            document.head.appendChild(link);
            links.push(link);
        });

        return () => {
            links.forEach((link) => {
                if (link.parentNode) {
                    link.parentNode.removeChild(link);
                }
            });
        };
    }, []);

    return null;
}

'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
    return (
        <header>
            <div className="header__top d-none d-md-block">
                <div className="container">
                    <div className="row d-flex align-items-center">
                        <div className="col-lg-9">
                            <div className="grb__cta header-cta">
                                <ul>
                                    <li>
                                        <div className="cta__icon">
                                            <span><i className="fas fa-phone-alt"></i></span>
                                        </div>
                                        <div className="cta__content">
                                            <p>Call Us:</p>
                                            <span><a href="tel:+2349078168453">+2349078168453</a></span>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="cta__icon">
                                            <span><i className="fas fa-envelope"></i></span>
                                        </div>
                                        <div className="cta__content">
                                            <p>Mail Us:</p>
                                            <span><a href="mailto:info@trisonet.com">info@trisonet.com</a></span>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="cta__icon">
                                            <span><i className="fas fa-clock"></i></span>
                                        </div>
                                        <div className="cta__content">
                                            <p>Service Hours</p>
                                            <span>9:00 AM - 6:00 PM</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-3 d-none d-lg-block">
                            <div className="grb__social f-right st-1">
                                <ul>
                                    <li><a href="https://web.facebook.com/profile.php?id=100084876782538&_rdc=1&_rdr" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a></li>
                                    <li><a href="https://www.youtube.com/@trisonetassetchannel" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a></li>
                                    <li><a href="https://www.instagram.com/trisonet_asset_channel/?hl=en" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="header__main header-sticky header-main-1">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-xl-2 col-lg-3 col-8">
                            <div className="logo p-relative">
                                <div className="logo-bg-1">
                                    <Image src="/assets/img/shape/logo-bg-1.png" alt="" width={408} height={118} priority />
                                </div>
                                <Link className="logo-text-white" href="/">
                                    <Image src="/assets/img/logo/logo.png" alt="Trisonet Logo" width={140} height={42} priority />
                                </Link>
                                <Link className="logo-text-black" href="/">
                                    <Image src="/assets/img/logo/logo-text-black.png" alt="Trisonet Logo" width={140} height={42} priority />
                                </Link>
                            </div>
                        </div>
                        <div className="col-xl-10 col-lg-9 col-4">
                            <div className="header__menu-area f-right p-relative">
                                <div className="menu-bg-1">
                                    <Image src="/assets/img/shape/menu-bg-1.png" alt="" width={200} height={100} priority />
                                </div>
                                <div className="main-menu main-menu-1 p-relative z-10">
                                    <nav id="mobile-menu">
                                        <ul>
                                            <li><Link href="/">Home</Link></li>
                                            <li><Link href="/about">About</Link></li>
                                            <li><Link href="/services">Service</Link></li>
                                            <li><Link href="/patron">Patron</Link></li>
                                            <li><Link href="/team">Teams</Link></li>
                                            <li><Link href="/contact">Contact</Link></li>
                                        </ul>
                                    </nav>
                                </div>
                                <div className="header__search p-relative z-10">
                                    <button className="side-toggle d-lg-none" aria-label="Toggle Menu"><i className="fal fa-bars"></i></button>
                                </div>
                                <div className="header__btn d-none d-xl-inline-block p-relative z-10">
                                    <Link href="/login" className="grb-btn">Get Reserved<i className="fas fa-arrow-right"></i></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}



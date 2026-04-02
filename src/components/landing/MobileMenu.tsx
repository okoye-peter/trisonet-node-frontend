'use client';

import Link from 'next/link';

export default function MobileMenu() {
    return (
        <>
            <div className="fix">
                <div className="side-info">
                    <div className="side-info-content">
                        <div className="offset-widget offset-logo mb-30 pb-20">
                            <div className="row align-items-center">
                                <div className="col-9">
                                    <Link href="/">
                                        <img src="/assets/img/logo/logo.png" alt="Logo" />
                                    </Link>
                                </div>
                                <div className="col-3 text-end">
                                    <button className="side-info-close"><i className="fal fa-times"></i></button>
                                </div>
                            </div>
                        </div>
                        <div className="mobile-menu d-lg-none"></div>
                        <div className="contact-infos mt-30 mb-30">
                            <div className="contact-list mb-30">
                                <h4>Contact Info</h4>
                                <div className="flex flex-col gap-3">
                                    <span className="flex items-center gap-2">
                                        <i className="fal fa-map-marker-alt"></i>
                                        <span>41 Eric Moore Street, Wemabod Estate Ikeja, Lagos</span>
                                    </span>
                                    <a href="tel:+2349078168453" className="flex items-center gap-2">
                                        <i className="fal fa-phone"></i>
                                        <span>+2349078168453</span>
                                    </a>
                                    <span className="flex items-center gap-2">
                                        <i className="far fa-envelope"></i>
                                        <span>info@trisonet.com</span>
                                    </span>
                                </div>
                            </div>
                            <div className="grb__social footer-social offset-social">
                                <ul>
                                    <li><a href="https://web.facebook.com/profile.php?id=100084876782538&_rdc=1&_rdr"><i className="fab fa-facebook-f"></i></a></li>
                                    <li><a href="https://www.youtube.com/@trisonetassetchannel"><i className="fab fa-youtube"></i></a></li>
                                    <li><a href="https://www.instagram.com/trisonet_asset_channel/?hl=en"><i className="fab fa-instagram"></i></a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="offcanvas-overlay"></div>
        </>
    );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function MobileMenu() {
    return (
        <div className="fix">
            <div className="side-info">
                <div className="side-info-content">
                    <div className="offset-widget offset-logo mb-30 pb-20">
                        <div className="row align-items-center">
                            <div className="col-9">
                                <Link href="/">
                                    <Image src="/assets/img/logo/logo.png" alt="Logo" width={140} height={42} priority />
                                </Link>
                            </div>
                            <div className="col-3 text-end">
                                <button className="side-info-close" aria-label="Close Menu"><i className="fal fa-times"></i></button>
                            </div>
                        </div>
                    </div>
                    <div className="mobile-menu d-lg-none"></div>
                    <div className="contact-infos mt-30 mb-30">
                        <div className="contact-list mb-30">
                            <h4>Contact Info</h4>
                            <div className="contact-item mb-20">
                                <i className="fal fa-map-marker-alt mr-10"></i>
                                <span>41 Eric Moore Street, Wemabod Estate Ikeja, Lagos</span>
                            </div>
                            <a href="tel:+2349078168453" className="contact-item mb-20 d-block">
                                <i className="fal fa-phone mr-10"></i>
                                <span>+2349078168453</span>
                            </a>
                            <a href="mailto:info@trisonet.com" className="contact-item mb-20 d-block">
                                <i className="far fa-envelope mr-10"></i>
                                <span>info@trisonet.com</span>
                            </a>
                        </div>
                        <div className="grb__social footer-social offset-social">
                            <ul>
                                <li><a href="https://web.facebook.com/profile.php?id=100084876782538&_rdc=1&_rdr" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a></li>
                                <li><a href="https://www.youtube.com/@trisonetassetchannel" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a></li>
                                <li><a href="https://www.instagram.com/trisonet_asset_channel/?hl=en" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a></li>
                             </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="offcanvas-overlay"></div>
        </div>
    );
}



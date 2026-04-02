'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer>
            <section className="footer-area pt-80 pb-40">
                <div className="container">
                    <div className="row wow fadeInUp">
                        <div className="col-lg-4 col-md-6">
                            <div className="footer-widget mb-40">
                                <div className="question-area">
                                    <div className="question-icon">
                                        <i className="flaticon-support"></i>
                                    </div>
                                    <div className="question-text">
                                        <p>Have a question? Call us 24/7</p>
                                        <span><a href="tel:+2349078168453">+2349078168453</a></span>
                                    </div>
                                </div>
                                <div className="footer-address">
                                    <h5>Contact Info</h5>
                                    <p>41 Eric Moore Street, Wemabod Estate Ikeja, Lagos</p>
                                </div>
                                <div className="grb__social footer-social">
                                    <ul>
                                        <li><a href="https://web.facebook.com/profile.php?id=100084876782538&_rdc=1&_rdr"><i className="fab fa-facebook-f"></i></a></li>
                                        <li><a href="https://www.youtube.com/@trisonetassetchannel"><i className="fab fa-youtube"></i></a></li>
                                        <li><a href="https://www.instagram.com/trisonet_asset_channel/?hl=en"><i className="fab fa-instagram"></i></a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="footer-widget mb-40 cat-m">
                                <div className="footer-widget-title">
                                    <h4>Categories</h4>
                                </div>
                                <ul className="footer-list">
                                    <li><Link href="/services">PIM</Link></li>
                                    <li><Link href="/services">E-Commerce</Link></li>
                                    <li><Link href="/services">Health</Link></li>
                                    <li><Link href="/patron">Patron</Link></li>
                                    <li><Link href="/services">Eatery</Link></li>
                                    <li><Link href="/services">Agriculture / Farming</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="footer-widget mb-40">
                                <div className="footer-widget-title">
                                    <h4>Quick Links</h4>
                                </div>
                                <ul className="footer-list">
                                    <li><Link href="/about">About Us</Link></li>
                                    <li><Link href="/contact">Contact Us</Link></li>
                                    <li><Link href="/policy">Privacy Policy</Link></li>
                                    <li><Link href="/terms">Terms & Conditions</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-6">
                            <div className="footer-widget mb-40 srv-m">
                                <div className="footer-widget-title">
                                    <h4>Service Schedule</h4>
                                </div>
                                <ul className="worktime-list">
                                    <li>
                                        <h5>Tuesday - Wed - Thurs</h5>
                                        <span>9:30 AM - 12 PM</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <div className="copyright-area">
                <div className="container">
                    <div className="row wow fadeInUp align-items-center">
                        <div className="col-lg-3 d-none d-lg-block">
                            <div className="copyright-logo logo-shape">
                                <Link href="/">
                                    <img src="/assets/img/logo/logo-white.png" alt="" />
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="copyright-text">
                                <p>Copyrighted by <a href="#">Trisonet</a> | All Rights Reserved</p>
                            </div>
                        </div>
                        <div className="col-lg-5 col-md-6">
                            <ul className="copyright-list f-right">
                                <li><Link href="/terms">Terms & Conditions</Link></li>
                                <li><Link href="/policy">Privacy Policy</Link></li>
                                <li><Link href="/about">About Us</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

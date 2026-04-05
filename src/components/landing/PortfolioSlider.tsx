'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function PortfolioSlider() {
    return (
        <section className="portfolio-area">
            <div className="container">
                <div className="row wow fadeInUp align-items-center counter-head">
                    <div className="col-lg-6 col-md-7">
                        <div className="portfolio-left">
                            <div className="section-title mb-55">
                                <div className="border-left">
                                    <p>Portfolio</p>
                                </div>
                                <h2>Explore some Projects</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="portfolio-container">
                <div className="portfolio-inner">
                    <div className="swiper-container portfolio-active">
                        <div className="swiper-wrapper">
                            <div className="swiper-slide">
                                <div className="single-portfolio">
                                    <div className="portfolio-img">
                                        <Link href="#"><Image src="/assets/img/portfolio/port1.jpg" alt="fish farming" width={400} height={300} className="w-full h-auto" /></Link>
                                    </div>
                                    <div className="portfolio-content">
                                        <h5><Link href="#">fish farming</Link></h5>
                                        <a className="p-link popup-image" href="/assets/img/portfolio/port1.jpg"><i className="fal fa-plus"></i></a>
                                    </div>
                                </div>
                            </div>
                            <div className="swiper-slide">
                                <div className="single-portfolio">
                                    <div className="portfolio-img">
                                        <Link href="#"><Image src="/assets/img/portfolio/dry1.jpg" alt="Dry fish farming" width={400} height={300} className="w-full h-auto" /></Link>
                                    </div>
                                    <div className="portfolio-content">
                                        <h5><Link href="#">Dry fish farming</Link></h5>
                                        <a className="p-link popup-image" href="/assets/img/portfolio/dry.jpg"><i className="fal fa-plus"></i></a>
                                    </div>
                                </div>
                            </div>
                            <div className="swiper-slide">
                                <div className="single-portfolio">
                                    <div className="portfolio-img">
                                        <Link href="#"><Image src="/assets/img/portfolio/spot2.jpg" alt="Healthy Pot" width={400} height={300} className="w-full h-auto" /></Link>
                                    </div>
                                    <div className="portfolio-content">
                                        <h5><Link href="#">Healthy Pot</Link></h5>
                                        <a className="p-link popup-image" href="/assets/img/portfolio/spot2.jpg"><i className="fal fa-plus"></i></a>
                                    </div>
                                </div>
                            </div>
                            <div className="swiper-slide">
                                <div className="single-portfolio">
                                    <div className="portfolio-img">
                                        <Link href="#"><Image src="/assets/img/portfolio/eat.jpg" alt="Eatery" width={400} height={300} className="w-full h-auto" /></Link>
                                    </div>
                                    <div className="portfolio-content">
                                        <h5><Link href="#">Eatery</Link></h5>
                                        <a className="p-link popup-image" href="/assets/img/portfolio/eat2.webp"><i className="fal fa-plus"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="portfolio-nav">
                            <div className="swiper-button-prev"><i className="far fa-arrow-left"></i></div>
                            <div className="swiper-button-next"><i className="far fa-arrow-right"></i></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

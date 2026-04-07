'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function HeroSlider() {
    return (
        <section className="slider-area p-relative fix">
            <div className="slider-active swiper-container">
                <div className="swiper-wrapper">
                    <div className="single-slider slider-height swiper-slide slider-overlay" data-swiper-autoplay="5000">
                        <div className="slide-bg p-absolute h-full w-full">
                            <Image
                                src="/assets/img/bann.jpg"
                                alt="Hero Background"
                                fill
                                priority
                                className="object-cover"
                                sizes="100vw"
                            />
                        </div>
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-9">
                                    <div className="hero-content">
                                        <div className="hero-bg-shape" data-animation="fadeInUp" data-delay=".3s">
                                            <div className="hero-s-1">
                                                <Image src="/assets/img/shape/hero-s-1.png" alt="" width={100} height={100} style={{ height: 'auto' }} />
                                            </div>
                                            <div className="hero-s-2">
                                                <Image src="/assets/img/shape/hero-s-2.png" alt="" width={100} height={100} style={{ height: 'auto' }} />
                                            </div>
                                        </div>
                                        <p data-animation="fadeInUp" data-delay=".6s">Digital Assets</p>
                                        <h1 data-animation="fadeInUp" data-delay=".9s">Commited to Building</h1>
                                        <div className="hero-content-btn" data-animation="fadeInUp" data-delay="1.1s">
                                            <Link href="/login" className="grb-btn">Get Started</Link>
                                        </div>
                                        <div className="hero-video-btn" data-animation="fadeInUp" data-delay="1.2s">
                                            <a className="grb-video popup-video" href="https://www.youtube.com/watch?v=MQAU53mLeDU"><i className="fas fa-play"></i></a>
                                            <p>Watch a Videos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="single-slider slider-height swiper-slide slider-overlay" data-swiper-autoplay="5000">
                        <div className="slide-bg p-absolute h-full w-full">
                            <Image
                                src="/assets/img/ban.jpg"
                                alt="Hero Background"
                                fill
                                className="object-cover"
                                sizes="100vw"
                            />
                        </div>
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-9">
                                    <div className="hero-content">
                                        <div className="hero-bg-shape" data-animation="fadeInUp" data-delay=".3s">
                                            <div className="hero-s-1">
                                                <Image src="/assets/img/shape/hero-s-1.png" alt="" width={100} height={100} style={{ height: 'auto' }} />
                                            </div>
                                            <div className="hero-s-2">
                                                <Image src="/assets/img/shape/hero-s-2.png" alt="" width={100} height={100} style={{ height: 'auto' }} />
                                            </div>
                                        </div>
                                        <p data-animation="fadeInUp" data-delay=".6s">Digital Assets</p>
                                        <h1 data-animation="fadeInUp" data-delay=".9s">Accessing the Globe</h1>
                                        <div className="hero-content-btn" data-animation="fadeInUp" data-delay="1.1s">
                                            <Link href="/contact" className="grb-btn">Get Started</Link>
                                        </div>
                                        <div className="hero-video-btn" data-animation="fadeInUp" data-delay="1.2s">
                                            <a className="grb-video popup-video" href="https://www.youtube.com/watch?v=MQAU53mLeDU"><i className="fas fa-play"></i></a>
                                            <p>Watch a Videos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="single-slider slider-height swiper-slide slider-overlay" data-swiper-autoplay="5000">
                        <div className="slide-bg p-absolute h-full w-full">
                            <Image
                                src="/assets/img/b.jpg"
                                alt="Hero Background"
                                fill
                                className="object-cover"
                                sizes="100vw"
                            />
                        </div>
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-9">
                                    <div className="hero-content">
                                        <div className="hero-bg-shape" data-animation="fadeInUp" data-delay=".3s">
                                            <div className="hero-s-1">
                                                <Image src="/assets/img/shape/hero-s-1.png" alt="" width={100} height={100} style={{ height: 'auto' }} />
                                            </div>
                                            <div className="hero-s-2">
                                                <Image src="/assets/img/shape/hero-s-2.png" alt="" width={100} height={100} style={{ height: 'auto' }} />
                                            </div>
                                        </div>
                                        <p data-animation="fadeInUp" data-delay=".6s">Digital Assets</p>
                                        <h1 data-animation="fadeInUp" data-delay=".9s">A Sustainable Economy</h1>
                                        <div className="hero-content-btn" data-animation="fadeInUp" data-delay="1.1s">
                                            <Link href="/contact" className="grb-btn">Get Started</Link>
                                        </div>
                                        <div className="hero-video-btn" data-animation="fadeInUp" data-delay="1.2s">
                                            <a className="grb-video popup-video" href="https://www.youtube.com/watch?v=MQAU53mLeDU"><i className="fas fa-play"></i></a>
                                            <p>Watch a Videos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="slider-nav">
                    <div className="swiper-button-prev"><i className="far fa-arrow-left"></i></div>
                    <div className="swiper-button-next"><i className="far fa-arrow-right"></i></div>
                </div>
            </div>
        </section>
    );
}

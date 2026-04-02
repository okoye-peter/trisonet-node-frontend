'use client';

export default function Home() {
    return (
        <>
            {/* hero area start here */}
            <section className="slider-area p-relative fix">
                <div className="slider-active swiper-container">
                    <div className="swiper-wrapper">
                        <div className="single-slider slider-height swiper-slide slider-overlay" data-swiper-autoplay="5000">
                            <div className="slide-bg" data-background="/assets/img/bann.jpg"></div>
                            <div className="container">
                                <div className="row">
                                    <div className="col-lg-9">
                                        <div className="hero-content">
                                            <div className="hero-bg-shape" data-animation="fadeInUp" data-delay=".3s">
                                                <div className="hero-s-1">
                                                    <img src="/assets/img/shape/hero-s-1.png" alt="" />
                                                </div>
                                                <div className="hero-s-2">
                                                    <img src="/assets/img/shape/hero-s-2.png" alt="" />
                                                </div>
                                            </div>
                                            <p data-animation="fadeInUp" data-delay=".6s">Digital Assets</p>
                                            <h1 data-animation="fadeInUp" data-delay=".9s">Commited to Building</h1>
                                            <div className="hero-content-btn" data-animation="fadeInUp" data-delay="1.1s">
                                                <a href="/contact" className="grb-btn">Get Started</a>
                                            </div>
                                            <div className="hero-video-btn" data-animation="fadeInUp" data-delay="1.2s">
                                                <a className="grb-video" href="https://www.youtube.com/watch?v=MQAU53mLeDU"><i className="fas fa-play"></i></a>
                                                <p>Watch a Videos</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="single-slider slider-height swiper-slide slider-overlay" data-swiper-autoplay="5000">
                            <div className="slide-bg" data-background="/assets/img/ban.jpg"></div>
                            <div className="container">
                                <div className="row">
                                    <div className="col-lg-9">
                                        <div className="hero-content">
                                            <div className="hero-bg-shape" data-animation="fadeInUp" data-delay=".3s">
                                                <div className="hero-s-1">
                                                    <img src="/assets/img/shape/hero-s-1.png" alt="" />
                                                </div>
                                                <div className="hero-s-2">
                                                    <img src="/assets/img/shape/hero-s-2.png" alt="" />
                                                </div>
                                            </div>
                                            <p data-animation="fadeInUp" data-delay=".6s">Digital Assets</p>
                                            <h1 data-animation="fadeInUp" data-delay=".9s">Accessing the Globe</h1>
                                            <div className="hero-content-btn" data-animation="fadeInUp" data-delay="1.1s">
                                                <a href="/contact" className="grb-btn">Get Started</a>
                                            </div>
                                            <div className="hero-video-btn" data-animation="fadeInUp" data-delay="1.2s">
                                                <a className="grb-video" href="https://www.youtube.com/watch?v=MQAU53mLeDU"><i className="fas fa-play"></i></a>
                                                <p>Watch a Videos</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="single-slider slider-height swiper-slide slider-overlay" data-swiper-autoplay="5000">
                            <div className="slide-bg" data-background="/assets/img/b.jpg"></div>
                            <div className="container">
                                <div className="row">
                                    <div className="col-lg-9">
                                        <div className="hero-content">
                                            <div className="hero-bg-shape" data-animation="fadeInUp" data-delay=".3s">
                                                <div className="hero-s-1">
                                                    <img src="/assets/img/shape/hero-s-1.png" alt="" />
                                                </div>
                                                <div className="hero-s-2">
                                                    <img src="/assets/img/shape/hero-s-2.png" alt="" />
                                                </div>
                                            </div>
                                            <p data-animation="fadeInUp" data-delay=".6s">Digital Assets</p>
                                            <h1 data-animation="fadeInUp" data-delay=".9s">A Sustainable Economy</h1>
                                            <div className="hero-content-btn" data-animation="fadeInUp" data-delay="1.1s">
                                                <a href="/contact" className="grb-btn">Get Started</a>
                                            </div>
                                            <div className="hero-video-btn" data-animation="fadeInUp" data-delay="1.2s">
                                                <a className="grb-video" href="https://www.youtube.com/watch?v=MQAU53mLeDU"><i className="fas fa-play"></i></a>
                                                <p>Watch a Videos</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* If we need navigation buttons */}
                    <div className="slider-nav">
                        <div className="swiper-button-prev"><i className="far fa-arrow-left"></i></div>
                        <div className="swiper-button-next"><i className="far fa-arrow-right"></i></div>
                    </div>
                </div>
            </section>
            {/* hero area end here */}

            {/* about area start  */}
            <section className="about__area pt-120 pb-90">
                <div className="container">
                    <div className="row wow fadeInUp">
                        <div className="col-xl-6 col-lg-5">
                            <div className="about__img p-relative mb-30">
                                <div className="about__img-inner">
                                    <img src="/assets/img/about/about1.jpg" alt="" />
                                </div>
                                <div className="p-element">
                                    <div className="ab-border d-none d-lg-block"></div>
                                    <div className="award">
                                        <img src="/assets/img/icon/batch.png" alt="" />
                                        <p>Won the Digital Awards</p>
                                    </div>
                                    <div className="ab-image">
                                        <img src="/assets/img/about/abp-img.png" alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-6 col-lg-7">
                            <div className="about__content mb-30">
                                <div className="section-title mb-30">
                                    <div className="border-left">
                                        <p>About Us</p>
                                    </div>
                                    <h2>We&apos;re Leading in Digital Asset </h2>
                                </div>
                                <p>Trisonet Metaverse is an immersive virtual world where partners can explore, socialize, and create. It offers avatar customization, land and property ownership, event hosting, and interactive experiences. Designed for innovation and community engagement, Trisonet Metaverse blends entertainment, business, and digital innovation into a seamless 3D virtual environment.</p>
                                <ul className="about-points">
                                    <li>
                                        <div className="points-heading">
                                            <div className="p-icon">
                                                <i className="flaticon-team"></i>
                                            </div>
                                            <h5>Immersive Virtual Experiences</h5>
                                        </div>
                                        <p>Partners can explore a 3D world, customize avatars, own land, and host or attend events, making interactions lifelike and engaging.</p>
                                    </li>
                                    <li>
                                        <div className="points-heading">
                                            <div className="p-icon">
                                                <i className="flaticon-creative-team"></i>
                                            </div>
                                            <h5>Digital Ownership &amp; Economy</h5>
                                        </div>
                                        <p>Partners can buy, build, and trade virtual properties, creating real value within the metaverse ecosystem.</p>
                                    </li>
                                </ul>
                                <div className="about__btn st-1">
                                    <a href="/services" className="grb-btn st-1">Read More<i className="fas fa-arrow-right"></i></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* about area end */}

            {/* choosing area start  */}
            <section className="choosing__area pt-120 pb-90">
                <div className="container">
                    <div className="row wow fadeInUp">
                        <div className="col-lg-6">
                            <div className="choosing__img mb-30">
                                <img src="/assets/img/about/p.jpg" alt="" />
                                <div className="subscribe">
                                    <a href="#"><i className="fab fa-youtube"></i></a>
                                    <div className="subscribe__text">
                                        <h4><a href="https://www.youtube.com/@trisonetassetchannel">Subscribe Us</a></h4>
                                        <p>2k+ Subscribed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="section-title mb-55">
                                <div className="border-left">
                                    <p>Why Choose Us</p>
                                </div>
                                <h2>We Execute Our Ideas from Start to Finish</h2>
                            </div>
                            <div className="choosing__information mb-30">
                                <ul>
                                    <li>
                                        <div className="choosing__number">
                                            <span>01</span>
                                        </div>
                                        <div className="choosing__text">
                                            <h5>Access to personal and business financial support</h5>
                                            <p>Access to financial support can come from various sources like metaverse</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="choosing__number">
                                            <span>02</span>
                                        </div>
                                        <div className="choosing__text">
                                            <h5>Access to Educational fund</h5>
                                            <p>TrisoNet offer free child&apos;s right to education.</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="choosing__number">
                                            <span>03</span>
                                        </div>
                                        <div className="choosing__text">
                                            <h5>Access to electronics, automobiles, and landed property </h5>
                                            <p>Access to electronics, automobiles, and landed property involves various purchasing and financing options.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* choosing area end  */}

            {/* counter area start  */}
            <section className="counter__area pt-110 pb-90" data-background="/assets/img/ban.jpg">
                <div className="container">
                    <div className="row wow fadeInUp align-items-center counter-head">
                        <div className="col-lg-9 col-md-8">
                            <div className="counter-left">
                                <div className="section-title mb-60">
                                    <h2 className="white-color ">TrisoNet Child&apos;s Rights To Education</h2>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-4">
                            <div className="counter-right mb-30">
                                <a href="/contact" className="grb-border-btn">
                                    Contact Us
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="counter-inner">
                        <div className="counter-content">
                            <div className="row wow fadeInUp">
                                <div className="col-lg-6">
                                    <div className="counter-content-left mb-30">
                                        <div className="section-title mb-40">
                                            <h4>We have paid more than 1000 children school fees. <span>3+ Years</span></h4>
                                        </div>
                                        <ul className="counter-items">
                                            <li className="single-counter">
                                                <div className="single-counter-icon">
                                                    <i className="flaticon-crm"></i>
                                                </div>
                                                <div className="single-counter-text">
                                                    <h3>53K+</h3>
                                                    <p>Happy Partners</p>
                                                </div>
                                            </li>
                                            <li className="single-counter">
                                                <div className="single-counter-icon">
                                                    <i className="flaticon-new-product"></i>
                                                </div>
                                                <div className="single-counter-text">
                                                    <h3>25k+</h3>
                                                    <p>Children</p>
                                                </div>
                                            </li>
                                            <li className="single-counter">
                                                <div className="single-counter-icon">
                                                    <i className="flaticon-delivery-box"></i>
                                                </div>
                                                <div className="single-counter-text">
                                                    <h3>50k+</h3>
                                                    <p>Ipad Awardees</p>
                                                </div>
                                            </li>
                                            <li className="single-counter">
                                                <div className="single-counter-icon">
                                                    <i className="flaticon-employee"></i>
                                                </div>
                                                <div className="single-counter-text">
                                                    <h3>100</h3>
                                                    <p>Patrons</p>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="counter-content-right text-end mb-30">
                                        <div className="counter-right-img">
                                            <div className="dot-dot">
                                                <img src="/assets/img/shape/dot-dot.png" alt="" />
                                            </div>
                                            <img src="/assets/img/bg/child2.jpg" alt="" />
                                            <div className="experience-text">
                                                <p><span>5+</span>Years Experiences</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* counter area end */}

            {/* newsletter area start  */}
            <div className="newsletter-area">
                <div className="container">
                    <div className="row wow fadeInUp align-items-center">
                        <div className="col-lg-6">
                            <div className="newsletter-text mb-30">
                                <h4>Subscribe For Newsletter</h4>
                                <p>Get insights on technology trends, product updates, and what&apos;s next — straight to your inbox.</p>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <form className="subscribe-form mb-30" onSubmit={(e) => e.preventDefault()}>
                                <input type="text" placeholder="Enter your email..." />
                                <button type="submit"><i className="fas fa-paper-plane"></i>Subscribe</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {/* newsletter area end */}
        </>
    );
}

'use client';

import Image from 'next/image';

export default function TestimonialSlider() {
    return (
        <section className="testimonial-area st-1 p-relative fix">
            {/* Background shape removed as it is missing from assets */}
            <div className="container p-relative z-10">
                <div className="row wow fadeInUp">
                    <div className="col-lg-12">
                        <div className="section-title mb-55 text-center">
                            <div className="border-c-bottom">
                                <p>Testimonials</p>
                            </div>
                            <h2>Some Expression Of <br /> Our Partner</h2>
                        </div>
                    </div>
                </div>
                <div className="row wow fadeInUp justify-content-center">
                    <div className="col-lg-10">
                        <div className="testimonial-wrapper p-relative">
                            <div className="testimonial-content-inner">
                                <div className="swiper-container testimonial-active">
                                    <div className="swiper-wrapper">
                                        <div className="swiper-slide">
                                            <div className="testimonial-single st-1 text-center">
                                                <div className="testimonial-img">
                                                    <Image src="/assets/img/testimonial/b.png" alt="Solomon Nkopeti" width={70} height={70} style={{ height: 'auto' }} />
                                                </div>
                                                <p className="mb-30">Since I joined TrisoNet Metaverse Community and purchased 1 unit of her Asset (Gkwth) six
                                                    months ago, and I have carefully observed with all sincerity and can boldly testify that TMC is
                                                    very peculiar with her commitment, transparency, simplicity, lucrative, visionary and honesty.
                                                    I was the first beneficiaries of the ongoing mini-awards, with a brand new Hp laptop, followed
                                                    with series of fund withdrawals through Gkwth top-ups.</p>
                                                <div className="testimonial-name">
                                                    <h5>Solomon Nkopeti</h5>
                                                </div>
                                                <ul className="testimonial-review">
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="swiper-slide">
                                            <div className="testimonial-single st-1 text-center">
                                                <div className="testimonial-img">
                                                    <Image src="/assets/img/testimonial/ch.png" alt="Apostle Chinonso Joseph" width={70} height={70} style={{ height: 'auto' }} />
                                                </div>
                                                <p className="mb-30">I was introduced to TrisoNet Metaverse Community on 15/12/2022 by a lady I&apos;ve not met
                                                    before and I got myself registered and purchased one unit of the community assets (Gkwth)
                                                    following the conviction I had after a deep enquiries.</p>
                                                <div className="testimonial-name">
                                                    <h5>Apostle Chinonso Joseph.</h5>
                                                </div>
                                                <ul className="testimonial-review">
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="swiper-slide">
                                            <div className="testimonial-single st-1 text-center">
                                                <div className="testimonial-img">
                                                    <Image src="/assets/img/testimonial/g.png" alt="Ndifreke Akpan" width={70} height={70} style={{ height: 'auto' }} />
                                                </div>
                                                <p className="mb-30">I came in contact with Trisonet Metaverse Community through a close friend few Months ago,
                                                    and confidently become a member and purchased just 1 unit of the capital TrisoNet Asset
                                                    (Gkwth) which has improved my financial status positively.</p>
                                                <div className="testimonial-name">
                                                    <h5>Ndifreke Akpan.</h5>
                                                </div>
                                                <ul className="testimonial-review">
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="swiper-slide">
                                            <div className="testimonial-single st-1 text-center">
                                                <div className="testimonial-img">
                                                    <Image src="/assets/img/testimonial/t.jpg" alt="Dominic Anosike" width={70} height={70} style={{ height: 'auto' }} />
                                                </div>
                                                <p className="mb-30">I registered free with Trisonet Community nine months ago and purchased one unit of TrisoNet
                                                    Asset, and through this asset, I, and majority of my prospects are enjoying series of amazing
                                                    cash withdrawals.</p>
                                                <div className="testimonial-name">
                                                    <h5>Dominic Anosike.</h5>
                                                </div>
                                                <ul className="testimonial-review">
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                    <li><i className="fas fa-star"></i></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="testimonial-nav-1 testimonial-nav-arrow">
                                <div className="testimonial1-button-prev"><i className="far fa-arrow-left"></i></div>
                                <div className="testimonial1-button-next"><i className="far fa-arrow-right"></i></div>
                            </div>
                            <div className="testimonial-quote">
                                <i className="fal fa-quote-right"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

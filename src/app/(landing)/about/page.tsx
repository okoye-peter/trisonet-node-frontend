import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import NewsletterForm from '@/components/landing/NewsletterForm';

export const metadata: Metadata = {
    title: 'About Us | Trisonet - Leading Digital Asset Community',
    description: 'Learn about Trisonet Metaverse mission, vision, and core values. We are a global social connection in a 3D virtual world.',
    keywords: ['About Trisonet', 'Mission', 'Vision', 'Core Values', 'Metaverse Community'],
};

export default function AboutPage() {
    return (
        <>
            {/* page title area start  */}
            <section className="page-title-area p-relative overflow-hidden">
                <Image
                    src="/assets/img/bg/counter-right-img.png"
                    alt="Page title background"
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
                <div className="container p-relative z-10">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="page-title-content text-center">
                                <div className="page-title-heading">
                                    <h1>About Us</h1>
                                </div>
                                <nav className="grb-breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                                        <li className="breadcrumb-item active" aria-current="page">About</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* page title area end */}

            {/* about area start  */}
            <section className="about-details pt-140">
                <div className="container">
                    <div className="row wow fadeInUp align-items-center">
                        <div className="col-lg-6">
                            <div className="section-title mb-30">
                                <h2>We&apos;re Leading Trisonet Metaverse community</h2>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="about-details-right mb-30">
                                <p>TrisoNet Community is a global social connection of people in a 3D virtual world, called metaverse, with virtual beautiful places and environments, through the help of instruments, science, and technologies. It’s not just a business, but an independent virtual governmental system that runs one of the best world’s leading trading firms; navigating global wealth through exclusive marketing methods, leading her active citizens towards experiencing and achieving unusual wealth through the political and digital economy.</p>
                            </div>
                        </div>
                    </div>
                    <div className="about-details-box mt-30 p-relative overflow-hidden" style={{ minHeight: '400px' }}>
                        <Image
                            src="/assets/img/about/TRISONET.jpg"
                            alt="Trisonet Background"
                            fill
                            className="object-cover"
                            sizes="100vw"
                        />
                        <div className="row wow fadeInUp justify-content-end p-relative z-10">
                            <div className="col-xl-6 col-md-10">
                                <div className="about-details-box-content">
                                    <h5>Partners Identification Module (PIM)</h5>
                                    <p>The Partners Identification Module (PIM) serves as a secure digital partner ID system that verifies, profiles, and authenticates partners within the platform. It stores partner credentials, tracks activities, and ensures trusted access, enabling transparent collaboration, efficient onboarding, and reliable identity management for seamless and secure business partnerships.</p>
                                    <ul className="about-points st-ab">
                                        <li>
                                            <div className="points-heading">
                                                <div className="p-icon">
                                                    <i className="flaticon-team"></i>
                                                </div>
                                                <h5>Our Mission</h5>
                                            </div>
                                            <p>To create an engaging, inclusive, and innovative virtual community where users explore, connect, and build. Trisonet Metaverse empowers creativity, digital ownership, and interactive experiences, fostering collaboration, entertainment, and economic opportunities in a safe and immersive 3D environment.</p>
                                        </li>
                                        <li>
                                            <div className="points-heading">
                                                <div className="p-icon">
                                                    <i className="flaticon-creative-team"></i>
                                                </div>
                                                <h5>Our Vision</h5>
                                            </div>
                                            <p>To become a leading metaverse platform that transforms digital interaction, blending technology, social engagement, and virtual economy into a vibrant, global community where imagination meets opportunity.</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* about area end */}

            {/* skill area start  */}
            <section className="skill-area pt-110 pb-85">
                <div className="container">
                    <div className="row wow fadeInUp">
                        <div className="col-lg-6">
                            <div className="about__content mb-30">
                                <div className="section-title mb-30">
                                    <h2>Trisonet Metaverse Core Values</h2>
                                </div>
                                <p>Innovation, community, and creativity drive Trisonet Metaverse, empowering users with digital ownership, collaboration, and safe, immersive experiences, fostering a trusted, inclusive environment where imagination and opportunity thrive.</p>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="grb-skill mt-45 ml-20 mr-10">
                                <div className="skill-wrapper">
                                    <div className="skill-title">
                                        <h5 className="skill-category">Innovation</h5>
                                        <span>100%</span>
                                    </div>
                                    <div className="progress">
                                        <div className="progress-bar wow slideInLeft" role="progressbar" style={{ width: '100%' }} aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}></div>
                                    </div>
                                </div>
                                <div className="skill-wrapper">
                                    <div className="skill-title">
                                        <h5 className="skill-category">Community</h5>
                                        <span>100%</span>
                                    </div>
                                    <div className="progress">
                                        <div className="progress-bar wow slideInLeft" role="progressbar" style={{ width: '100%' }} aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}></div>
                                    </div>
                                </div>
                                <div className="skill-wrapper">
                                    <div className="skill-title">
                                        <h5 className="skill-category">Creativity</h5>
                                        <span>100%</span>
                                    </div>
                                    <div className="progress">
                                        <div className="progress-bar wow slideInLeft" role="progressbar" style={{ width: '100%' }} aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}></div>
                                    </div>
                                </div>
                                <div className="skill-wrapper">
                                    <div className="skill-title">
                                        <h5 className="skill-category">Digital Ownership</h5>
                                        <span>100%</span>
                                    </div>
                                    <div className="progress">
                                        <div className="progress-bar wow slideInLeft" role="progressbar" style={{ width: '100%' }} aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
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
                            <NewsletterForm />
                        </div>
                    </div>
                </div>
            </div>
            {/* newsletter area end */}
        </>
    );
}

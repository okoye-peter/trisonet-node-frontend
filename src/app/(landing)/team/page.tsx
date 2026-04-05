import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import NewsletterForm from '@/components/landing/NewsletterForm';

export const metadata: Metadata = {
    title: 'Our Team | Trisonet - Leading Digital Asset Community',
    description: 'Meet the Trisonet Metaverse team of experts dedicated to building a sustainable digital economy.',
    keywords: ['Trisonet Team', 'Experts', 'Metaverse Leadership', 'Digital Economy'],
};

export default function TeamPage() {
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
                                    <h1>Our Team</h1>
                                </div>
                                <nav className="grb-breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                                        <li className="breadcrumb-item active" aria-current="page">Our Team</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* page title area end */}

            {/* team area start  */}
            <section className="team-area grey-bg pt-110 pb-90">
                <div className="container">
                    <div className="row wow fadeInUp">
                        <div className="col-lg-12">
                            <div className="section-title mb-55 text-center">
                                <h2>Meet Our Team <br /> of Experts</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row wow fadeInUp">
                        <div className="col-lg-3 col-md-6">
                            <div className="team-member mb-30">
                                <div className="member-img">
                                    <Image src="/assets/img/team/team1.png" alt="Happiness Etuk" width={300} height={400} className="w-full h-auto" />
                                </div>
                                <div className="member-name p-relative">
                                    <div className="member-name-bg">
                                        <div className="p-absolute inset-0">
                                            <Image src="/assets/img/shape/member-name-bg.png" alt="" fill className="object-cover" />
                                        </div>
                                        <div className="p-absolute inset-0">
                                            <Image src="/assets/img/shape/member-name-c-bg.png" alt="" fill className="object-cover" />
                                        </div>
                                    </div>
                                    <h5 className="p-relative z-10">Happiness Etuk</h5>
                                    <span className="p-relative z-10">CEO</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="team-member mb-30">
                                <div className="member-img">
                                    <Image src="/assets/img/team/team2.jpg" alt="Udeme Effanga Bassey" width={300} height={400} className="w-full h-auto" />
                                </div>
                                <div className="member-name p-relative">
                                    <div className="member-name-bg">
                                        <div className="p-absolute inset-0">
                                            <Image src="/assets/img/shape/member-name-bg.png" alt="" fill className="object-cover" />
                                        </div>
                                        <div className="p-absolute inset-0">
                                            <Image src="/assets/img/shape/member-name-c-bg.png" alt="" fill className="object-cover" />
                                        </div>
                                    </div>
                                    <h5 className="p-relative z-10">Udeme Effanga Bassey</h5>
                                    <span className="p-relative z-10">VP Media</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="team-member mb-30">
                                <div className="member-img">
                                    <Image src="/assets/img/team/team3.jpg" alt="Imaobong Ekanem" width={300} height={400} className="w-full h-auto" />
                                </div>
                                <div className="member-name p-relative">
                                    <div className="member-name-bg">
                                        <div className="p-absolute inset-0">
                                            <Image src="/assets/img/shape/member-name-bg.png" alt="" fill className="object-cover" />
                                        </div>
                                        <div className="p-absolute inset-0">
                                            <Image src="/assets/img/shape/member-name-c-bg.png" alt="" fill className="object-cover" />
                                        </div>
                                    </div>
                                    <h5 className="p-relative z-10">Imaobong Ekanem</h5>
                                    <span className="p-relative z-10">VP Child’s Right to Education</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="team-member mb-30">
                                <div className="member-img">
                                    <Image src="/assets/img/team/team4.jpg" alt="Ndifreke George Akpan" width={300} height={400} className="w-full h-auto" />
                                </div>
                                <div className="member-name p-relative">
                                    <div className="member-name-bg">
                                        <div className="p-absolute inset-0">
                                            <Image src="/assets/img/shape/member-name-bg.png" alt="" fill className="object-cover" />
                                        </div>
                                        <div className="p-absolute inset-0">
                                            <Image src="/assets/img/shape/member-name-c-bg.png" alt="" fill className="object-cover" />
                                        </div>
                                    </div>
                                    <h5 className="p-relative z-10">Ndifreke George Akpan</h5>
                                    <span className="p-relative z-10">VP Health</span>
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

'use client';

export default function PolicyPage() {
    return (
        <>
            {/* page title area start  */}
            <section className="page-title-area" data-background="/assets/img/bg/counter-right-img.png">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="page-title-content text-center">
                                <div className="page-title-heading">
                                    <h1>Privacy Policy</h1>
                                </div>
                                <nav className="grb-breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item"><a href="/">Home</a></li>
                                        <li className="breadcrumb-item active" aria-current="page">Privacy Policy</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* page title area end */}

            {/* policy content area start  */}
            <section className="service-details-area pt-150 pb-80">
                <div className="container">
                    <div className="service-details-content wow fadeInUp">
                        <div className="service-details-heading">
                            <h2>Our Commitment to Your Privacy</h2>
                        </div>
                        <p>At Trisonet, we take your privacy seriously. This Policy outlines how we collect, use, and protect your personal data when you interact with our platform, metaverse, and services. We are dedicated to ensuring that your personal information is handled with the utmost care and in accordance with global data protection standards.</p>
                        
                        <div className="row mt-40">
                            <div className="col-xl-9">
                                <h5 className="mb-15">Data Collection & Use</h5>
                                <p className="mb-40">We collect information that helps us provide a better experience, including your contact details, identification for the Partners Identification Module (PIM), and usage data within our metaverse. This data is used solely to enhance our services, provide customer support, and ensure a secure environment for all our citizens.</p>
                                
                                <h5 className="mb-15">Securing Your Information</h5>
                                <p className="mb-40">We implement industry-standard security measures to protect against unauthorized access, alteration, or disclosure of your personal data. Your credentials and transaction histories are encrypted and stored securely within our infrastructure.</p>
                                
                                <h5 className="mb-15">Digital Ownership & Rights</h5>
                                <p className="mb-20">In the Trisonet Metaverse, we respect your digital ownership rights. While we facilitate the platform, your virtual assets and creations are managed under clear digital property guidelines to ensure a fair and transparent economy.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* policy content area end */}
        </>
    );
}

'use client';

export default function ContactPage() {
    return (
        <>
            {/* page title area start  */}
            <section className="page-title-area" data-background="/assets/img/bg/counter-right-img.png">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="page-title-content text-center">
                                <div className="page-title-heading">
                                    <h1>Contact Us</h1>
                                </div>
                                <nav className="grb-breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item"><a href="/">Home</a></li>
                                        <li className="breadcrumb-item active" aria-current="page">Contact Us</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* page title area end */}

            {/* contact area start  */}
            <div className="contact-area pt-145 pb-120">
                <div className="container">
                    <div className="row wow fadeInUp">
                        <div className="col-lg-4">
                            <div className="contact-address">
                                <div className="contact-heading">
                                    <h4>Direct Contact Us</h4>
                                </div>
                                <ul className="contact-address-list">
                                    <li>
                                        <div className="contact-list-icon">
                                            <i className="fas fa-phone-alt"></i>
                                        </div>
                                        <div className="contact-list-text">
                                            <span><a href="tel:+2349078168453">+2349078168453</a></span>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="contact-list-icon st-3">
                                            <i className="fas fa-envelope"></i>
                                        </div>
                                        <div className="contact-list-text">
                                            <span><a href="mailto:info@trisonet.com">info@trisonet.com</a></span>
                                            <span><a href="mailto:trisonetasset@gmail.com">trisonetasset@gmail.com</a></span>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="contact-list-icon">
                                            <i className="fas fa-map-marker-alt"></i>
                                        </div>
                                        <div className="contact-list-text">
                                            <span><a href="#">41 Eric Moore Street, Wemabod Estate Ikeja, Lagos</a></span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-8">
                            <div className="get-in-touch">
                                <div className="contact-heading">
                                    <h4>Get in Touch</h4>
                                </div>
                                <form className="contact-form" action="#" onSubmit={(e) => e.preventDefault()}>
                                    <div className="row wow fadeInUp">
                                        <div className="col-md-6 mb-30">
                                            <input type="text" placeholder="First Name" />
                                        </div>
                                        <div className="col-md-6 mb-30">
                                            <input type="text" placeholder="Last Name" />
                                        </div>
                                        <div className="col-md-6 mb-30">
                                            <input type="text" placeholder="Email" />
                                        </div>
                                        <div className="col-md-6 mb-30">
                                            <input type="text" placeholder="Phone" />
                                        </div>
                                        <div className="col-md-12 mb-30">
                                            <input type="text" placeholder="Subject" />
                                        </div>
                                        <div className="col-md-12 mb-30">
                                            <textarea name="message" placeholder="Messages....."></textarea>
                                        </div>
                                        <div className="col-md-6">
                                            <button type="submit"><i className="fas fa-paper-plane"></i>SUBMIT</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* contact area end */}
        </>
    );
}

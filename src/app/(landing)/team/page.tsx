'use client';

export default function TeamPage() {
    return (
        <>
            {/* page title area start  */}
            <section className="page-title-area" data-background="/assets/img/bg/counter-right-img.png">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="page-title-content text-center">
                                <div className="page-title-heading">
                                    <h1>Our Team</h1>
                                </div>
                                <nav className="grb-breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item"><a href="/">Home</a></li>
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
                                <h2>Meet Our Team <br /> of Expect</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row wow fadeInUp">
                        <div className="col-lg-3 col-md-6">
                            <div className="team-member mb-30">
                                <div className="member-img">
                                    <img src="/assets/img/team/team1.png" alt="" />
                                </div>
                                <div className="member-name p-relative">
                                    <div className="member-name-bg">
                                        <img src="/assets/img/shape/member-name-bg.png" alt="" />
                                        <img src="/assets/img/shape/member-name-c-bg.png" alt="" />
                                    </div>
                                    <h5>Happiness Etuk</h5>
                                    <span>CEO</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="team-member mb-30">
                                <div className="member-img">
                                    <img src="/assets/img/team/team2.jpg" alt="" />
                                </div>
                                <div className="member-name p-relative">
                                    <div className="member-name-bg">
                                        <img src="/assets/img/shape/member-name-bg.png" alt="" />
                                        <img src="/assets/img/shape/member-name-c-bg.png" alt="" />
                                    </div>
                                    <h5>Udeme Effanga Bassey</h5>
                                    <span>VP Media</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="team-member mb-30">
                                <div className="member-img">
                                    <img src="/assets/img/team/team3.jpg" alt="" />
                                </div>
                                <div className="member-name p-relative">
                                    <div className="member-name-bg">
                                        <img src="/assets/img/shape/member-name-bg.png" alt="" />
                                        <img src="/assets/img/shape/member-name-c-bg.png" alt="" />
                                    </div>
                                    <h5>Imaobong Ekanem</h5>
                                    <span>VP Child’s Right to Education</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="team-member mb-30">
                                <div className="member-img">
                                    <img src="/assets/img/team/team4.jpg" alt="" />
                                </div>
                                <div className="member-name p-relative">
                                    <div className="member-name-bg">
                                        <img src="/assets/img/shape/member-name-bg.png" alt="" />
                                        <img src="/assets/img/shape/member-name-c-bg.png" alt="" />
                                    </div>
                                    <h5>Ndifreke George Akpan</h5>
                                    <span>VP Health</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* team area end */}
        </>
    );
}

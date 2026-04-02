'use client';

export default function PatronPage() {
    return (
        <>
            {/* page title area start  */}
            <section className="page-title-area" data-background="/assets/img/bg/counter-right-img.png">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="page-title-content text-center">
                                <div className="page-title-heading">
                                    <h1>Patron Pricing Plans</h1>
                                </div>
                                <nav className="grb-breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item"><a href="/">Home</a></li>
                                        <li className="breadcrumb-item active" aria-current="page">Patron Pricing Plans</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* page title area end */}

            {/* pricing area start  */}
            <section className="pricing-area pt-140">
                <div className="container">
                    <div className="pricing-inner">
                        <div className="row wow fadeInUp">
                            <div className="col-lg-7 col-md-8">
                                <div className="section-title mb-30">
                                    <h2>Become a Patron today and earn base on the plan.</h2>
                                </div>
                            </div>
                        </div>
                        <div className="pricing-plans wow fadeInUp">
                            <ul className="nav nav-tabs" id="myTab" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">First Plan</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Second Plan</button>
                                </li>
                            </ul>
                            <div className="tab-content" id="myTabContent">
                                <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                                    <div className="row g-0">
                                        <div className="col-lg-4 col-md-6">
                                            <div className="single-pricing mb-30">
                                                <div className="pricing-title">
                                                    <h5>Bronze Patron</h5>
                                                    <span>&#x20A6;1m - &#x20A6;9m</span>
                                                </div>
                                                <ul className="pricing-list">
                                                    <li>Beneffit 40%</li>
                                                </ul>
                                                <div className="pricing-btn text-center">
                                                    <a href="/contact" className="grb-border-btn st-1">
                                                        Choose Plan
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-6">
                                            <div className="single-pricing mb-30">
                                                <div className="pricing-title">
                                                    <h5>Silver Patron</h5>
                                                    <span>&#x20A6;10m - &#x20A6;49m</span>
                                                </div>
                                                <ul className="pricing-list">
                                                    <li>Benefits 45%</li>
                                                </ul>
                                                <div className="pricing-btn text-center">
                                                    <a href="/contact" className="grb-border-btn st-1">
                                                        Choose Plan
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-6">
                                            <div className="single-pricing mb-30">
                                                <div className="pricing-title">
                                                    <h5>Gold Patron </h5>
                                                    <span>&#x20A6;50m - &#x20A6;99m</span>
                                                </div>
                                                <ul className="pricing-list">
                                                    <li>Benefits 50%</li>
                                                </ul>
                                                <div className="pricing-btn text-center">
                                                    <a href="/contact" className="grb-border-btn st-1">
                                                        Choose Plan
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                                    <div className="row g-0">
                                        <div className="col-lg-4 col-md-6">
                                            <div className="single-pricing mb-30">
                                                <div className="pricing-title">
                                                    <h5>Daimon Patron</h5>
                                                    <span>&#x20A6;100 - &#x20A6;999m</span>
                                                </div>
                                                <ul className="pricing-list">
                                                    <li>Benefits 60%</li>
                                                </ul>
                                                <div className="pricing-btn text-center">
                                                    <a href="/contact" className="grb-border-btn st-1">
                                                        Choose Plan
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-6">
                                            <div className="single-pricing mb-30">
                                                <div className="pricing-title">
                                                    <h5>Platinum Patron</h5>
                                                    <span>&#x20A6;1b - &#x20A6;10b</span>
                                                </div>
                                                <ul className="pricing-list">
                                                    <li>Benefits 70%</li>
                                                </ul>
                                                <div className="pricing-btn text-center">
                                                    <a href="/contact" className="grb-border-btn st-1">
                                                        Choose Plan
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* pricing area end */}
        </>
    );
}

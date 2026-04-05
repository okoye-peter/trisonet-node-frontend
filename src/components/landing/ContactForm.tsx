'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function ContactForm() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.email || !formData.message) {
            toast.error('Please fill in all required fields.');
            return;
        }

        setIsLoading(true);

        try {
            // Simulated API delay
            await new Promise((resolve) => setTimeout(resolve, 1500));
            
            toast.success('Your message has been sent successfully! We\'ll get back to you soon.');
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
        } catch {
            toast.error('Failed to send message. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="contact-form" onSubmit={handleSubmit}>
            <div className="row wow fadeInUp">
                <div className="col-md-6 mb-30">
                    <input 
                        type="text" 
                        name="firstName"
                        placeholder="First Name" 
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                </div>
                <div className="col-md-6 mb-30">
                    <input 
                        type="text" 
                        name="lastName"
                        placeholder="Last Name" 
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                </div>
                <div className="col-md-6 mb-30">
                    <input 
                        type="email" 
                        name="email"
                        placeholder="Email" 
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                        required
                    />
                </div>
                <div className="col-md-6 mb-30">
                    <input 
                        type="text" 
                        name="phone"
                        placeholder="Phone" 
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                </div>
                <div className="col-md-12 mb-30">
                    <input 
                        type="text" 
                        name="subject"
                        placeholder="Subject" 
                        value={formData.subject}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                </div>
                <div className="col-md-12 mb-30">
                    <textarea 
                        name="message" 
                        placeholder="Messages....."
                        value={formData.message}
                        onChange={handleChange}
                        disabled={isLoading}
                        required
                    ></textarea>
                </div>
                <div className="col-md-6">
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                            <i className="fas fa-paper-plane"></i>
                        )}
                        {isLoading ? ' SUBMITTING...' : ' SUBMIT'}
                    </button>
                </div>
            </div>
        </form>
    );
}

'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            toast.error('Please enter a valid email address.');
            return;
        }

        setIsLoading(true);

        try {
            // Simulated API delay
            await new Promise((resolve) => setTimeout(resolve, 1500));
            
            toast.success('Thank you for subscribing! We\'ve added you to our mailing list.');
            setEmail('');
        } catch (error) {
            toast.error('Something went wrong. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="subscribe-form mb-30" onSubmit={handleSubmit}>
            <input 
                type="email" 
                placeholder="Enter your email..." 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
            />
            <button type="submit" disabled={isLoading}>
                {isLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                ) : (
                    <i className="fas fa-paper-plane"></i>
                )}
                {isLoading ? ' Subscribing...' : ' Subscribe'}
            </button>
        </form>
    );
}

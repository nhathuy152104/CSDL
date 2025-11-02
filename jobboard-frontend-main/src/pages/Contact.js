import { useState } from 'react';
import axios from 'axios';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    contactMethod: 'email',
    agree: false,
  });

  const [status, setStatus] = useState({ loading: false, success: null, error: null });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, message, agree } = formData;

    if (!name || !email || !message) {
      setStatus({ loading: false, success: null, error: 'Name, Email, and Message are required.' });
      return;
    }

    if (!validateEmail(email)) {
      setStatus({ loading: false, success: null, error: 'Invalid email address.' });
      return;
    }

    if (!agree) {
      setStatus({ loading: false, success: null, error: 'You must agree to the privacy policy.' });
      return;
    }

    try {
      setStatus({ loading: true, success: null, error: null });
      await axios.post('http://localhost:5000/api/contact', formData);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        contactMethod: 'email',
        agree: false,
      });
      setStatus({ loading: false, success: 'Your message has been sent!', error: null });
    } catch (err) {
      setStatus({ loading: false, success: null, error: 'Failed to send. Please try again.' });
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto bg-white shadow-xl rounded-2xl mt-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6">
        Contact <span className="text-blue-600">Us</span>
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone (optional)</label>
          <input
            name="phone"
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91-XXXXXXXXXX"
            className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
          <input
            name="subject"
            id="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="e.g. Job Inquiry, Feedback, etc."
            className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            name="message"
            id="message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            placeholder="Write your message here..."
            className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Preferred Contact Method */}
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact Method</span>
          <div className="flex gap-6">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="contactMethod"
                value="email"
                checked={formData.contactMethod === 'email'}
                onChange={handleChange}
                className="text-blue-600"
              />
              <span className="ml-2 text-sm">Email</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="contactMethod"
                value="phone"
                checked={formData.contactMethod === 'phone'}
                onChange={handleChange}
                className="text-blue-600"
              />
              <span className="ml-2 text-sm">Phone</span>
            </label>
          </div>
        </div>

        {/* Consent Checkbox */}
        <div>
          <label className="inline-flex items-center text-sm">
            <input
              type="checkbox"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
              className="mr-2 text-blue-600"
            />
            I agree to the <a href="/privacy" className="underline text-blue-600">Privacy Policy</a>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={status.loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-60"
        >
          {status.loading ? <Loader2 className="animate-spin h-5 w-5" /> : null}
          {status.loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {/* Success Message */}
      {status.success && (
        <div className="mt-6 flex items-center justify-center text-green-600 font-medium">
          <CheckCircle className="h-5 w-5 mr-2" />
          {status.success}
        </div>
      )}

      {/* Error Message */}
      {status.error && (
        <div className="mt-6 flex items-center justify-center text-red-600 font-medium">
          <AlertCircle className="h-5 w-5 mr-2" />
          {status.error}
        </div>
      )}
    </div>
  );
}

export default Contact;
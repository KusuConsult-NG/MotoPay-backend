-- Seed Services
INSERT INTO services (id, icon, title, description, features, "order", isActive, createdAt, updatedAt) VALUES
('vehicle-registration', 'description', 'Vehicle Registration', 'Quick and easy vehicle registration for private, commercial, and motorcycle vehicles.', '["Online application", "Document verification", "Instant receipt"]', 1, 1, datetime('now'), datetime('now')),
('license-renewal', 'credit_card', 'License Renewal', 'Renew your vehicle license online with instant payment processing.', '["Multiple payment options", "SMS confirmation", "Digital receipts"]', 2, 1, datetime('now'), datetime('now')),
('compliance-check', 'verified', 'Compliance Check', 'Verify your vehicle compliance status and required documents.', '["Real-time verification", "Compliance dashboard", "Document tracking"]', 3, 1, datetime('now'), datetime('now')),
('commercial-permits', 'local_shipping', 'Commercial Permits', 'Apply for and manage commercial vehicle permits and badges.', '["Hackney permits", "Driver''s badges", "Fleet management"]', 4, 1, datetime('now'), datetime('now')),
('transaction-history', 'receipt_long', 'Transaction History', 'Access your complete payment and renewal history anytime.', '["Detailed records", "Export to PDF", "Email receipts"]', 5, 1, datetime('now'), datetime('now')),
('agent-services', 'support_agent', 'Agent Services', 'Authorized agents can assist with registrations and renewals.', '["Commission tracking", "Bulk renewals", "Customer support"]', 6, 1, datetime('now'), datetime('now'));

-- Seed About Sections
INSERT INTO about_sections (id, section, title, content, items, "order", isActive, createdAt, updatedAt) VALUES
('mission', 'mission', 'Our Mission', 'MotoPay is the official digital platform for the Plateau State Internal Revenue Service (PSIRS) designed to simplify vehicle licensing, renewals, and compliance management. We are committed to providing efficient, transparent, and accessible services to all vehicle owners in Plateau State.', NULL, 1, 1, datetime('now'), datetime('now')),
('what-we-do', 'what-we-do', 'What We Do', '', '["Process vehicle registrations and license renewals online", "Verify vehicle compliance with state regulations", "Manage commercial vehicle permits and badges", "Provide secure payment processing through Paystack", "Support authorized agents with commission tracking"]', 2, 1, datetime('now'), datetime('now')),
('why-choose', 'why-choose', 'Why Choose MotoPay?', '', ''[{"icon":"speed","title":"Fast & Efficient","description":"Complete renewals in minutes, not hours"},{"icon":"security","title":"Secure Payments","description":"Bank-grade encryption for all transactions"},{"icon":"phone_android","title":"Mobile Friendly","description":"Access from any device, anywhere"},{"icon":"support_agent","title":"24/7 Support","description":"We''re here to help when you need us"}]'', 3, 1, datetime('now'), datetime('now'));

-- Seed FAQs
INSERT INTO faqs (id, category, question, answer, "order", isActive, createdAt, updatedAt) VALUES
('faq-1', 'general', 'How do I renew my vehicle license?', 'Start by entering your vehicle plate number on the lookup page. Verify your details, select renewal options, and proceed to payment. You will receive your receipt via email and SMS.', 1, 1, datetime('now'), datetime('now')),
('faq-2', 'payments', 'What payment methods are accepted?', 'We accept all major debit and credit cards through our secure Paystack payment gateway. You can also pay using bank transfers and USSD.', 2, 1, datetime('now'), datetime('now')),
('faq-3', 'general', 'How long does processing take?', 'Most renewals are processed instantly after payment confirmation. Your receipt and license documents are sent to your email immediately upon successful payment.', 3, 1, datetime('now'), datetime('now')),
('faq-4', 'registration', 'What documents do I need?', 'For renewals, you typically need your vehicle registration, proof of ownership, road worthiness certificate, and insurance. Commercial vehicles may require additional permits.', 4, 1, datetime('now'), datetime('now')),
('faq-5', 'general', 'Can I renew for multiple vehicles?', 'Yes! You can renew multiple vehicles by completing the process for each vehicle separately. Authorized agents can also handle bulk renewals.', 5, 1, datetime('now'), datetime('now')),
('faq-6', 'compliance', 'How do I become an agent?', 'Contact PSIRS at agent@motopay.ng with your application. Approved agents receive login credentials and can track commissions through the agent portal.', 6, 1, datetime('now'), datetime('now')),
('faq-7', 'general', 'What if my vehicle information is wrong?', 'If you notice incorrect vehicle information, please contact our support team immediately. Exceptions can be raised through the admin panel for resolution.', 7, 1, datetime('now'), datetime('now')),
('faq-8', 'payments', 'How do I get a receipt?', 'Receipts are automatically sent to your email and phone number after successful payment. You can also access and download receipts from your transaction history.', 8, 1, datetime('now'), datetime('now'));

-- Seed Help Categories
INSERT INTO help_categories (id, icon, title, link, description, "order", isActive, createdAt, updatedAt) VALUES
('help-registration', 'directions_car', 'Vehicle Registration', '/lookup', 'Learn about registering new and used vehicles', 1, 1, datetime('now'), datetime('now')),
('help-payments', 'payment', 'Payments & Fees', '/services', 'Understanding fees, charges, and payment options', 2, 1, datetime('now'), datetime('now')),
('help-compliance', 'verified', 'Compliance', '/commercial', 'Requirements for commercial and private vehicles', 3, 1, datetime('now'), datetime('now')),
('help-agent', 'support_agent', 'Agent Support', '/login', 'Resources for authorized agents', 4, 1, datetime('now'), datetime('now'));

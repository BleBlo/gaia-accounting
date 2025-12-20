-- GAIA Accounting System Seed Data
-- Run this after schema.sql in your Supabase SQL Editor

-- Insert default services (with Turkish translations)
INSERT INTO services (name_en, name_tr, default_price, is_variable_price, min_price, max_price, sort_order) VALUES
('Dress Cutting', 'Elbise Kesimi', 40, FALSE, NULL, NULL, 1),
('Pants/Shorts Cutting', 'Pantolon/Şort Kesimi', 35, FALSE, NULL, NULL, 2),
('Abaya Making', 'Abaya Dikimi', 200, FALSE, NULL, NULL, 3),
('Jacket Making', 'Ceket Dikimi', 250, FALSE, NULL, NULL, 4),
('Simple Alteration', 'Basit Tadilat', 30, FALSE, NULL, NULL, 5),
('Zipper Change', 'Fermuar Değişimi', 20, FALSE, NULL, NULL, 6),
('Hand Work', 'El İşi', 50, TRUE, 50, 300, 7),
('Wedding Dress Work', 'Gelinlik Dikimi', 400, TRUE, 400, 2000, 8),
('Custom Work', 'Özel Sipariş', 0, TRUE, 0, 10000, 9)
ON CONFLICT DO NOTHING;

-- Insert expense categories (with Turkish translations)
INSERT INTO expense_categories (name_en, name_tr, icon, sort_order) VALUES
('Rent', 'Kira', 'building', 1),
('DEWA (Utilities)', 'Faturalar', 'zap', 2),
('Phone/Internet', 'Telefon/Internet', 'phone', 3),
('Salaries', 'Maaşlar', 'users', 4),
('Fabrics', 'Kumaşlar', 'scissors', 5),
('Sewing Supplies', 'Dikiş Malzemeleri', 'package', 6),
('Machine Repair', 'Makine Tamiri', 'wrench', 7),
('Government Fees', 'Resmi Harçlar', 'file-text', 8),
('Delivery', 'Teslimat', 'truck', 9),
('Advertisement', 'Reklam', 'megaphone', 10),
('Other', 'Diğer', 'more-horizontal', 11)
ON CONFLICT DO NOTHING;

-- Insert default suppliers
INSERT INTO suppliers (name, category) VALUES
('Al Bastaki', 'Fabrics'),
('Nazim Trading', 'Fabrics'),
('Al Hosn Textile', 'Fabrics'),
('New Ashkar', 'Supplies'),
('Mikees Fashion', 'Fabrics')
ON CONFLICT DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value) VALUES
('business', '{"businessName": "GAIA Fashion House", "businessNameAr": "GAIA Moda Evi", "address": "Abu Dhabi, UAE", "phone": "", "email": "", "trnNumber": ""}'),
('app', '{"language": "en", "currency": "AED", "vatRate": 5, "defaultPaymentMethod": "cash", "showVatOnReceipts": true}')
ON CONFLICT (key) DO NOTHING;

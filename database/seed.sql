-- Sample data for Squizzy

-- Insert sample quiz
INSERT INTO quizzes (id, title, description) VALUES 
('00000000-0000-0000-0000-000000000001', 'Quiz de Conhecimentos Gerais', 'Teste seus conhecimentos gerais com este quiz divertido!');

-- Insert sample questions
INSERT INTO questions (id, quiz_id, question_text, time_limit, points, order_index) VALUES 
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Qual é a capital do Brasil?', 20, 100, 1),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Quanto é 2 + 2?', 15, 100, 2),
('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Qual é o maior planeta do Sistema Solar?', 20, 100, 3);

-- Insert choices for question 1
INSERT INTO choices (question_id, choice_text, is_correct, order_index) VALUES 
('00000000-0000-0000-0000-000000000101', 'São Paulo', false, 1),
('00000000-0000-0000-0000-000000000101', 'Rio de Janeiro', false, 2),
('00000000-0000-0000-0000-000000000101', 'Brasília', true, 3),
('00000000-0000-0000-0000-000000000101', 'Salvador', false, 4);

-- Insert choices for question 2
INSERT INTO choices (question_id, choice_text, is_correct, order_index) VALUES 
('00000000-0000-0000-0000-000000000102', '3', false, 1),
('00000000-0000-0000-0000-000000000102', '4', true, 2),
('00000000-0000-0000-0000-000000000102', '5', false, 3),
('00000000-0000-0000-0000-000000000102', '22', false, 4);

-- Insert choices for question 3
INSERT INTO choices (question_id, choice_text, is_correct, order_index) VALUES 
('00000000-0000-0000-0000-000000000103', 'Terra', false, 1),
('00000000-0000-0000-0000-000000000103', 'Marte', false, 2),
('00000000-0000-0000-0000-000000000103', 'Júpiter', true, 3),
('00000000-0000-0000-0000-000000000103', 'Saturno', false, 4);

-- Insert a sample match
INSERT INTO matches (id, slug, quiz_id, status) VALUES 
('00000000-0000-0000-0000-000000000201', 'demo-match', '00000000-0000-0000-0000-000000000001', 'waiting');

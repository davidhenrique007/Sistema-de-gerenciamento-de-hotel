-- backend/scripts/gerar_dados_teste.sql
-- Gerar 1000+ reservas para teste de performance

DO $$
DECLARE
    i INTEGER;
    guest_id UUID;
    room_id UUID;
    checkin_date DATE;
    checkout_date DATE;
    statuses TEXT[] := ARRAY['confirmed', 'pending', 'cancelled', 'finished'];
    payment_methods TEXT[] := ARRAY['mpesa', 'cartao', 'dinheiro'];
    payment_statuses TEXT[] := ARRAY['paid', 'pending', 'partial'];
    guest_names TEXT[] := ARRAY[
        'João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira', 'Carlos Ferreira',
        'Sofia Rodrigues', 'Miguel Almeida', 'Beatriz Martins', 'Rui Pereira', 'Catarina Gomes'
    ];
BEGIN
    -- Garantir que há quartos suficientes
    INSERT INTO rooms (id, room_number, type, floor, price_per_night, status, capacity)
    SELECT 
        gen_random_uuid(),
        i::text,
        CASE WHEN i <= 15 THEN 'standard' WHEN i <= 30 THEN 'deluxe' WHEN i <= 40 THEN 'suite' ELSE 'presidencial' END,
        floor(i / 10) + 1,
        CASE WHEN i <= 15 THEN 3000 WHEN i <= 30 THEN 4500 WHEN i <= 40 THEN 6000 ELSE 8000 END,
        'available',
        2
    FROM generate_series(1, 50) i
    ON CONFLICT (room_number) DO NOTHING;

    -- Gerar hóspedes
    FOR i IN 1..100 LOOP
        INSERT INTO guests (id, name, email, phone, document)
        VALUES (
            gen_random_uuid(),
            guest_names[floor(random() * 10 + 1)] || ' ' || i,
            'guest' || i || '@email.com',
            '84' || floor(random() * 9000000 + 1000000),
            'ID' || floor(random() * 1000000)
        );
    END LOOP;

    -- Gerar reservas
    FOR i IN 1..2000 LOOP
        -- Selecionar guest aleatório
        SELECT id INTO guest_id FROM guests ORDER BY random() LIMIT 1;
        -- Selecionar quarto aleatório
        SELECT id INTO room_id FROM rooms ORDER BY random() LIMIT 1;
        
        -- Gerar datas (últimos 12 meses)
        checkin_date := CURRENT_DATE - (floor(random() * 365) || ' days')::interval;
        checkout_date := checkin_date + (floor(random() * 7 + 1) || ' days')::interval;
        
        INSERT INTO reservations (
            id, reservation_code, guest_id, room_id, check_in, check_out,
            total_price, status, payment_status, payment_method, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            'RES-TEST-' || LPAD(i::text, 6, '0'),
            guest_id,
            room_id,
            checkin_date,
            checkout_date,
            (EXTRACT(DAY FROM (checkout_date - checkin_date)) * 
                (SELECT price_per_night FROM rooms WHERE id = room_id)),
            statuses[floor(random() * 4 + 1)],
            payment_statuses[floor(random() * 3 + 1)],
            payment_methods[floor(random() * 3 + 1)],
            checkin_date - (floor(random() * 30) || ' days')::interval,
            NOW()
        );
        
        IF i % 100 = 0 THEN
            RAISE NOTICE '% reservas geradas...', i;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ 2000 reservas geradas com sucesso!';
END $$;
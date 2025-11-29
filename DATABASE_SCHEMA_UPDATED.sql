-- =====================================
-- База данных: OPEN_CTI
-- Обновленная схема (2025-11-28)
-- =====================================

-- Схема: public (можно использовать свои схемы при желании)
-- Создание таблиц

-- ------------------------
-- Пользователи
-- ------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'analyst',
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- ------------------------
-- APT-группы
-- ------------------------
CREATE TABLE apt_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    aliases TEXT[],
    country VARCHAR(100),
    description TEXT,
    first_seen DATE,
    last_seen DATE,
    mitre_attack_id VARCHAR(50),
    sources TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- ------------------------
-- Вредоносное ПО
-- ------------------------
CREATE TABLE malware (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    type VARCHAR(100), -- Trojan, Ransomware, etc.
    family VARCHAR(100),
    description TEXT,
    first_seen DATE,
    last_seen DATE,
    hashes TEXT[],
    capabilities TEXT[],
    sources TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- ------------------------
-- Отчёты
-- ------------------------
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author VARCHAR(150),
    source_url TEXT,
    publication_date DATE,
    summary TEXT,
    full_text TEXT,
    status VARCHAR(50) DEFAULT 'In Process', -- НОВАЯ КОЛОНКА
    created_at TIMESTAMP DEFAULT NOW(),
    user_id INT REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------
-- IOC
-- ------------------------
CREATE TABLE iocs (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50), -- IP, domain, URL, hash, email, etc.
    value TEXT UNIQUE NOT NULL,
    first_seen DATE,
    last_seen DATE,
    confidence INTEGER CHECK (confidence BETWEEN 0 AND 100),
    source TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ------------------------
-- Кампании
-- ------------------------
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    targeted_countries TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- ------------------------
-- Уязвимости
-- ------------------------
CREATE TABLE vulnerabilities (
    id SERIAL PRIMARY KEY,
    cve_id VARCHAR(50) UNIQUE NOT NULL,
    cwe_id VARCHAR(50),
    cvss_score NUMERIC(3,1),
    description TEXT,
    affected_products TEXT[],
    published_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- Промежуточные таблицы для связей "многие-ко-многим"
-- =====================================

-- APT ↔ Malware
CREATE TABLE apt_malware (
    apt_id INT REFERENCES apt_groups(id) ON DELETE CASCADE,
    malware_id INT REFERENCES malware(id) ON DELETE CASCADE,
    PRIMARY KEY (apt_id, malware_id)
);

-- Malware ↔ IOC
CREATE TABLE malware_ioc (
    malware_id INT REFERENCES malware(id) ON DELETE CASCADE,
    ioc_id INT REFERENCES iocs(id) ON DELETE CASCADE,
    PRIMARY KEY (malware_id, ioc_id)
);

-- Reports ↔ APT
CREATE TABLE report_apt (
    report_id INT REFERENCES reports(id) ON DELETE CASCADE,
    apt_id INT REFERENCES apt_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (report_id, apt_id)
);

-- Reports ↔ Malware
CREATE TABLE report_malware (
    report_id INT REFERENCES reports(id) ON DELETE CASCADE,
    malware_id INT REFERENCES malware(id) ON DELETE CASCADE,
    PRIMARY KEY (report_id, malware_id)
);

-- Reports ↔ IOC
CREATE TABLE report_ioc (
    report_id INT REFERENCES reports(id) ON DELETE CASCADE,
    ioc_id INT REFERENCES iocs(id) ON DELETE CASCADE,
    PRIMARY KEY (report_id, ioc_id)
);

-- Campaigns ↔ APT
CREATE TABLE campaign_apt (
    campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
    apt_id INT REFERENCES apt_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (campaign_id, apt_id)
);

-- Campaigns ↔ Malware
CREATE TABLE campaign_malware (
    campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
    malware_id INT REFERENCES malware(id) ON DELETE CASCADE,
    PRIMARY KEY (campaign_id, malware_id)
);

-- Campaigns ↔ Reports
CREATE TABLE campaign_reports (
    campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
    report_id INT REFERENCES reports(id) ON DELETE CASCADE,
    PRIMARY KEY (campaign_id, report_id)
);

-- Malware ↔ Vulnerabilities
CREATE TABLE malware_vuln (
    malware_id INT REFERENCES malware(id) ON DELETE CASCADE,
    vuln_id INT REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    PRIMARY KEY (malware_id, vuln_id)
);

-- APT ↔ Vulnerabilities
CREATE TABLE apt_vuln (
    apt_id INT REFERENCES apt_groups(id) ON DELETE CASCADE,
    vuln_id INT REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    PRIMARY KEY (apt_id, vuln_id)
);

-- =====================================
-- Дополнительные таблицы (если используются)
-- =====================================

-- Sigma Rules
CREATE TABLE IF NOT EXISTS sigma_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    filename VARCHAR(255),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_title VARCHAR(120) DEFAULT 'Analyst',
    plan VARCHAR(20) DEFAULT 'free'
);

-- =====================================
-- Комментарии к важным колонкам
-- =====================================

COMMENT ON COLUMN reports.status IS 'Current status of the report: In Process or Done';
COMMENT ON TABLE sigma_rules IS 'Storage for Sigma detection rules in YAML format';

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ARRAY

# Создаем экземпляр SQLAlchemy, который будет использоваться во всем приложении
db = SQLAlchemy()

# =====================================
# Промежуточные таблицы для связей "многие-ко-многим"
# =====================================
# Эти таблицы не являются классами, так как они не содержат собственных данных,
# кроме внешних ключей. SQLAlchemy использует их для построения связей.

apt_malware = db.Table('apt_malware',
    db.Column('apt_id', db.Integer, db.ForeignKey('apt_groups.id'), primary_key=True),
    db.Column('malware_id', db.Integer, db.ForeignKey('malware.id'), primary_key=True)
)

malware_ioc = db.Table('malware_ioc',
    db.Column('malware_id', db.Integer, db.ForeignKey('malware.id'), primary_key=True),
    db.Column('ioc_id', db.Integer, db.ForeignKey('iocs.id'), primary_key=True)
)

report_apt = db.Table('report_apt',
    db.Column('report_id', db.Integer, db.ForeignKey('reports.id'), primary_key=True),
    db.Column('apt_id', db.Integer, db.ForeignKey('apt_groups.id'), primary_key=True)
)

report_malware = db.Table('report_malware',
    db.Column('report_id', db.Integer, db.ForeignKey('reports.id'), primary_key=True),
    db.Column('malware_id', db.Integer, db.ForeignKey('malware.id'), primary_key=True)
)

report_ioc = db.Table('report_ioc',
    db.Column('report_id', db.Integer, db.ForeignKey('reports.id'), primary_key=True),
    db.Column('ioc_id', db.Integer, db.ForeignKey('iocs.id'), primary_key=True)
)

campaign_apt = db.Table('campaign_apt',
    db.Column('campaign_id', db.Integer, db.ForeignKey('campaigns.id'), primary_key=True),
    db.Column('apt_id', db.Integer, db.ForeignKey('apt_groups.id'), primary_key=True)
)

campaign_malware = db.Table('campaign_malware',
    db.Column('campaign_id', db.Integer, db.ForeignKey('campaigns.id'), primary_key=True),
    db.Column('malware_id', db.Integer, db.ForeignKey('malware.id'), primary_key=True)
)

campaign_reports = db.Table('campaign_reports',
    db.Column('campaign_id', db.Integer, db.ForeignKey('campaigns.id'), primary_key=True),
    db.Column('report_id', db.Integer, db.ForeignKey('reports.id'), primary_key=True)
)

malware_vuln = db.Table('malware_vuln',
    db.Column('malware_id', db.Integer, db.ForeignKey('malware.id'), primary_key=True),
    db.Column('vuln_id', db.Integer, db.ForeignKey('vulnerabilities.id'), primary_key=True)
)

apt_vuln = db.Table('apt_vuln',
    db.Column('apt_id', db.Integer, db.ForeignKey('apt_groups.id'), primary_key=True),
    db.Column('vuln_id', db.Integer, db.ForeignKey('vulnerabilities.id'), primary_key=True)
)

# =====================================
# Основные модели данных
# =====================================

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    role = db.Column(db.String(50), default='user')  # admin, analyst, user
    is_blocked = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    last_login = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    profile = db.relationship('UserProfile', back_populates='user', uselist=False, cascade='all, delete-orphan')

    def to_dict(self, include_profile=False):
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'is_blocked': self.is_blocked,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
        if include_profile and self.profile:
            data['profile'] = self.profile.to_dict()
        return data

class APTGroup(db.Model):
    __tablename__ = 'apt_groups'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), unique=True, nullable=False)
    aliases = db.Column(ARRAY(db.Text))
    country = db.Column(db.String(100))
    description = db.Column(db.Text)
    first_seen = db.Column(db.Date)
    last_seen = db.Column(db.Date)
    mitre_attack_id = db.Column(db.String(50))
    sources = db.Column(ARRAY(db.Text))
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'aliases': self.aliases,
            'country': self.country,
            'description': self.description,
            'first_seen': self.first_seen.isoformat() if self.first_seen else None,
            'last_seen': self.last_seen.isoformat() if self.last_seen else None,
            'mitre_attack_id': self.mitre_attack_id,
            'sources': self.sources
        }

class Malware(db.Model):
    __tablename__ = 'malware'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), unique=True, nullable=False)
    type = db.Column(db.String(100))
    family = db.Column(db.String(100))
    description = db.Column(db.Text)
    first_seen = db.Column(db.Date)
    last_seen = db.Column(db.Date)
    hashes = db.Column(ARRAY(db.Text))
    capabilities = db.Column(ARRAY(db.Text))
    sources = db.Column(ARRAY(db.Text))
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'family': self.family,
            'description': self.description,
            'first_seen': self.first_seen.isoformat() if self.first_seen else None,
            'last_seen': self.last_seen.isoformat() if self.last_seen else None,
            'hashes': self.hashes,
            'capabilities': self.capabilities,
            'sources': self.sources
        }

class Report(db.Model):
    __tablename__ = 'reports'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(150))
    source_url = db.Column(db.Text)
    publication_date = db.Column(db.Date)
    summary = db.Column(db.Text)
    full_text = db.Column(db.Text)
    status = db.Column(db.String(50), default='In Process')
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'source_url': self.source_url,
            'publication_date': self.publication_date.isoformat() if self.publication_date else None,
            'summary': self.summary,
            'status': self.status,
            'user_id': self.user_id
        }

class IOC(db.Model):
    __tablename__ = 'iocs'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50))
    value = db.Column(db.Text, unique=True, nullable=False)
    first_seen = db.Column(db.Date)
    last_seen = db.Column(db.Date)
    confidence = db.Column(db.Integer)
    source = db.Column(db.Text)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'value': self.value,
            'first_seen': self.first_seen.isoformat() if self.first_seen else None,
            'last_seen': self.last_seen.isoformat() if self.last_seen else None,
            'confidence': self.confidence,
            'source': self.source
        }

class Campaign(db.Model):
    __tablename__ = 'campaigns'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), unique=True, nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    targeted_countries = db.Column(ARRAY(db.Text))
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'targeted_countries': self.targeted_countries
        }

class Vulnerability(db.Model):
    __tablename__ = 'vulnerabilities'
    id = db.Column(db.Integer, primary_key=True)
    cve_id = db.Column(db.String(50), unique=True, nullable=False)
    cwe_id = db.Column(db.String(50))
    cvss_score = db.Column(db.Numeric(3, 1))
    description = db.Column(db.Text)
    affected_products = db.Column(ARRAY(db.Text))
    published_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'cve_id': self.cve_id,
            'cwe_id': self.cwe_id,
            'cvss_score': str(self.cvss_score) if self.cvss_score else None,
            'description': self.description,
            'affected_products': self.affected_products,
            'published_date': self.published_date.isoformat() if self.published_date else None
        }


class SigmaRule(db.Model):
    """Simple storage for Sigma rules (YAML content)."""

    __tablename__ = 'sigma_rules'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    filename = db.Column(db.String(255))
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'filename': self.filename,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    job_title = db.Column(db.String(120), default='Analyst')
    plan = db.Column(db.String(20), default='free')  # free / pro
    avatar = db.Column(db.Text)  # Base64 encoded image

    user = db.relationship('User', back_populates='profile')

    def to_dict(self):
        return {
            'job_title': self.job_title,
            'plan': self.plan,
            'avatar': self.avatar,
        }


class Alert(db.Model):
    """Model for storing system alerts/notifications"""
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)  # 'report', 'sigma', 'threat'
    message = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    username = db.Column(db.String(100))
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    
    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'message': self.message,
            'user_id': self.user_id,
            'username': self.username,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


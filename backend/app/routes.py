# app/routes.py
import os
import bcrypt
import requests
from datetime import datetime
from flask import request, jsonify
from flask import current_app as app
from sqlalchemy import extract, func
from .models import (
    db,
    User,
    Malware,
    Report,
    IOC,
    APTGroup,
    SigmaRule,
    UserProfile,
    Alert,
    report_malware,
)

VIRUSTOTAL_API_KEY = os.environ.get('VIRUSTOTAL_API_KEY') or os.environ.get('VT_API_KEY')

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('username'):
        return jsonify({'message': 'Missing required fields!'}), 400

    # Проверяем, не существует ли уже пользователь с таким email или username
    if User.query.filter_by(email=data['email']).first() or User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'User with this email or username already exists!'}), 409

    # Хешируем пароль
    password = data['password'].encode('utf-8')
    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())

    # Создаем нового пользователя
    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=hashed_password.decode('utf-8'),
        role=data.get('role') or 'Analyst'
    )

    db.session.add(new_user)
    db.session.flush()
    _ensure_profile(new_user, auto_commit=False)
    db.session.commit()

    return jsonify({'message': 'User registered successfully!'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields!'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user:
        return jsonify({'message': 'User not found!'}), 401

    # Check if user is blocked
    if user.is_blocked:
        return jsonify({'message': 'Your account has been blocked. Contact administrator.'}), 403

    password = data['password'].encode('utf-8')
    stored_hash = user.password_hash.encode('utf-8')

    if bcrypt.checkpw(password, stored_hash):
        profile = _ensure_profile(user)
        user_dict = user.to_dict(include_profile=True)
        if not user_dict.get('profile') and profile:
            user_dict['profile'] = profile.to_dict()
        return jsonify({'message': 'Login successful!', 'user': user_dict}), 200
    else:
        return jsonify({'message': 'Invalid credentials!'}), 401


# ===============================
# API: Malware
# ===============================
@app.route('/api/malware', methods=['GET', 'POST'])
def malware_collection():
    if request.method == 'POST':
        data = request.get_json() or {}
        if not data.get('name'):
            return jsonify({'message': 'name is required'}), 400
        try:
            m = Malware(
                name=data['name'],
                type=data.get('type'),
                family=data.get('family'),
                description=data.get('description'),
                first_seen=_parse_date(data.get('first_seen')),
                last_seen=_parse_date(data.get('last_seen')),
                hashes=data.get('hashes'),
                capabilities=data.get('capabilities'),
                sources=data.get('sources'),
            )
            db.session.add(m)
            db.session.commit()
            
            # Create alert notification
            _create_alert(
                alert_type='threat',
                message=f'Угроза "{m.name}" была добавлена в систему',
                username='System'
            )
            
            return jsonify(m.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'failed to create malware', 'error': str(e)}), 400

    # GET
    q = request.args.get('q', type=str)
    query = Malware.query
    if q:
        ilike = f"%{q}%"
        query = query.filter(Malware.name.ilike(ilike))
    items = [m.to_dict() for m in query.order_by(Malware.created_at.desc()).limit(200)]
    return jsonify(items)

@app.route('/api/malware/<int:malware_id>', methods=['GET'])
def malware_detail(malware_id: int):
    m = Malware.query.get_or_404(malware_id)
    return jsonify(m.to_dict())


# ===============================
# API: Reports
# ===============================
@app.route('/api/reports', methods=['GET', 'POST'])
def reports_collection():
    if request.method == 'POST':
        data = request.get_json() or {}
        if not data.get('title'):
            return jsonify({'message': 'title is required'}), 400
        try:
            r = Report(
                title=data['title'],
                author=data.get('author'),
                source_url=data.get('source_url'),
                publication_date=_parse_date(data.get('publication_date')),
                summary=data.get('summary'),
                full_text=data.get('full_text'),
                user_id=data.get('user_id'),
            )
            db.session.add(r)
            db.session.flush()

            # Опционально привязать malware к отчету по именам или id
            malware_ids = data.get('malware_ids') or []
            malware_names = data.get('malware_names') or []
            if malware_names:
                found = Malware.query.filter(Malware.name.in_(malware_names)).all()
                malware_ids.extend([x.id for x in found])
            for mid in set(malware_ids):
                db.session.execute(report_malware.insert().values(report_id=r.id, malware_id=mid))

            db.session.commit()
            
            # Create alert notification
            _create_alert(
                alert_type='report',
                message=f'Отчет "{r.title}" был создан',
                user_id=r.user_id,
                username=r.author or 'Unknown'
            )
            
            return jsonify(r.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'failed to create report', 'error': str(e)}), 400

    q = request.args.get('q', type=str)
    query = Report.query
    if q:
        ilike = f"%{q}%"
        query = query.filter(Report.title.ilike(ilike))
    items = [r.to_dict() for r in query.order_by(Report.created_at.desc()).limit(200)]
    return jsonify(items)

@app.route('/api/reports/<int:report_id>', methods=['GET', 'PATCH', 'DELETE'])
def report_detail(report_id: int):
    r = Report.query.get_or_404(report_id)
    
    if request.method == 'DELETE':
        try:
            db.session.delete(r)
            db.session.commit()
            return jsonify({'message': 'Report deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Failed to delete report', 'error': str(e)}), 400
    
    if request.method == 'PATCH':
        data = request.get_json() or {}
        try:
            if 'status' in data:
                r.status = data['status']
            if 'title' in data:
                r.title = data['title']
            if 'author' in data:
                r.author = data['author']
            if 'summary' in data:
                r.summary = data['summary']
            if 'full_text' in data:
                r.full_text = data['full_text']
                
            db.session.commit()
            return jsonify(r.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Failed to update report', 'error': str(e)}), 400
    
    # GET
    data = r.to_dict()
    # добавим связанные malware имена как теги
    rows = db.session.execute(
        db.select(Malware).join(report_malware, Malware.id == report_malware.c.malware_id).where(report_malware.c.report_id == report_id)
    ).scalars().all()
    data['malware_tags'] = [m.name for m in rows]
    return jsonify(data)


# ===============================
# API: IOCs
# ===============================
@app.route('/api/iocs', methods=['GET', 'POST'])
def iocs_collection():
    if request.method == 'POST':
        data = request.get_json() or {}
        if not data.get('type') or not data.get('value'):
            return jsonify({'message': 'type and value are required'}), 400
        try:
            ioc = IOC(
                type=data['type'],
                value=data['value'],
                first_seen=_parse_date(data.get('first_seen')),
                last_seen=_parse_date(data.get('last_seen')),
                confidence=data.get('confidence'),
                source=data.get('source'),
            )
            db.session.add(ioc)
            db.session.commit()
            return jsonify(ioc.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'failed to create ioc', 'error': str(e)}), 400

    q = request.args.get('q', type=str)
    query = IOC.query
    if q:
        ilike = f"%{q}%"
        query = query.filter(IOC.value.ilike(ilike))
    items = [i.to_dict() for i in query.order_by(IOC.created_at.desc()).limit(200)]
    return jsonify(items)


# ===============================
# API: APT Groups
# ===============================
@app.route('/api/apt-groups', methods=['GET'])
def apt_groups_collection():
    q = request.args.get('q', type=str)
    query = APTGroup.query
    if q:
        ilike = f"%{q}%"
        query = query.filter(APTGroup.name.ilike(ilike))
    items = [a.to_dict() for a in query.order_by(APTGroup.created_at.desc()).limit(200)]
    return jsonify(items)


# ===============================
# API: Search across malware, APT, IOC
# ===============================
@app.route('/api/search', methods=['GET'])
def search_all():
    q = request.args.get('q', '')
    if not q:
        return jsonify({'malware': [], 'apt_groups': [], 'iocs': [], 'reports': []})
    ilike = f"%{q}%"
    return jsonify({
        'malware': [m.to_dict() for m in Malware.query.filter(Malware.name.ilike(ilike)).limit(50)],
        'apt_groups': [a.to_dict() for a in APTGroup.query.filter(APTGroup.name.ilike(ilike)).limit(50)],
        'iocs': [i.to_dict() for i in IOC.query.filter(IOC.value.ilike(ilike)).limit(50)],
        'reports': [r.to_dict() for r in Report.query.filter(Report.title.ilike(ilike)).limit(50)],
    })


# ===============================
# API: Stats for charts (last 12 months)
# ===============================
@app.route('/api/stats/overview', methods=['GET'])
def stats_overview():
    now = datetime.utcnow()
    labels = []
    malware_counts = []
    ioc_counts = []
    report_counts = []

    for i in range(11, -1, -1):
        year = (now.year if now.month - i > 0 else now.year - 1) if (now.month - i) <= 0 else now.year
        month = ((now.month - i - 1) % 12) + 1
        labels.append(datetime(year, month, 1).strftime('%b %Y'))
        malware_counts.append(_count_by_month(Malware, year, month))
        ioc_counts.append(_count_by_month(IOC, year, month))
        report_counts.append(_count_by_month(Report, year, month))

    return jsonify({
        'labels': labels,
        'datasets': {
            'malware': malware_counts,
            'iocs': ioc_counts,
            'reports': report_counts,
        }
    })


@app.route('/api/stats/metrics', methods=['GET'])
def stats_metrics():
    return jsonify({
        'reports': db.session.query(func.count(Report.id)).scalar() or 0,
        'malware': db.session.query(func.count(Malware.id)).scalar() or 0,
        'iocs': db.session.query(func.count(IOC.id)).scalar() or 0,
        'sigmaRules': db.session.query(func.count(SigmaRule.id)).scalar() or 0,
    })


# ===============================
# API: Sigma rules
# ===============================
@app.route('/api/sigma-rules', methods=['GET', 'POST'])
def sigma_rules_collection():
    """List existing Sigma rules or create a new one.

    POST expects JSON with at least:
      - name: display name of the rule
      - content: raw YAML string
    Optional fields:
      - description: text description
      - filename: original file name
    """
    if request.method == 'POST':
        data = request.get_json() or {}
        name = (data.get('name') or '').strip()
        content = (data.get('content') or '').strip()
        if not name or not content:
            return jsonify({'message': 'name and content are required'}), 400

        try:
            rule = SigmaRule(
                name=name,
                description=data.get('description'),
                filename=data.get('filename'),
                content=content,
            )
            db.session.add(rule)
            db.session.commit()
            
            # Create alert notification
            _create_alert(
                alert_type='sigma',
                message=f'Sigma Rule "{rule.name}" было создано',
                username='System'
            )
            
            return jsonify(rule.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'failed to create sigma rule', 'error': str(e)}), 400

    # GET
    q = request.args.get('q', type=str)
    query = SigmaRule.query.order_by(SigmaRule.created_at.desc())
    if q:
        ilike = f"%{q}%"
        query = query.filter(SigmaRule.name.ilike(ilike))
    items = [r.to_dict() for r in query.limit(200)]
    return jsonify(items)


@app.route('/api/sigma-rules/<int:rule_id>', methods=['GET', 'DELETE'])
def sigma_rule_detail(rule_id: int):
    rule = SigmaRule.query.get_or_404(rule_id)
    if request.method == 'DELETE':
        try:
            db.session.delete(rule)
            db.session.commit()
            return jsonify({'message': 'deleted'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'failed to delete sigma rule', 'error': str(e)}), 400

    data = rule.to_dict()
    # include raw content for detail view / debugging
    data['content'] = rule.content
    return jsonify(data)


@app.route('/api/virustotal/scan', methods=['POST'])
def virustotal_scan():
    """Proxy VirusTotal lookups to keep API key on the server."""
    payload = request.get_json() or {}
    indicator = (payload.get('indicator') or '').strip()
    if not indicator:
        return jsonify({'message': 'Indicator is required'}), 400

    api_key = VIRUSTOTAL_API_KEY
    if not api_key:
        return jsonify({'message': 'VirusTotal API key is not configured on the server'}), 500

    headers = {'x-apikey': api_key}
    
    try:
        # First, try to get file report by hash
        if len(indicator) in [32, 40, 64]:  # MD5, SHA-1, or SHA-256
            try:
                resp = requests.get(
                    f'https://www.virustotal.com/api/v3/files/{indicator}',
                    headers=headers,
                    timeout=15,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return process_vt_response(data, indicator)
            except requests.RequestException:
                pass  # Fall through to search if direct lookup fails
        
        # If not a hash or hash lookup failed, try search
        params = {'query': indicator}
        resp = requests.get(
            'https://www.virustotal.com/api/v3/search',
            headers=headers,
            params=params,
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        
        hits = data.get('data', [])
        if not hits:
            return jsonify({
                'message': 'No results found in VirusTotal',
                'indicator': indicator,
                'found': False
            }), 404
            
        # Get the most relevant result
        result = hits[0].get('attributes', {})
        return process_vt_response({'data': {'attributes': result}}, indicator)
        
    except requests.RequestException as exc:
        return jsonify({
            'message': 'Failed to get response from VirusTotal',
            'error': str(exc)
        }), 502
    except (ValueError, KeyError) as e:
        return jsonify({
            'message': 'Invalid response from VirusTotal',
            'error': str(e)
        }), 502

def process_vt_response(vt_data, indicator):
    """Process VirusTotal API response into a standardized format."""
    try:
        # Handle direct file report response
        if 'data' in vt_data and 'attributes' in vt_data['data']:
            attrs = vt_data['data']['attributes']
            last_analysis_stats = attrs.get('last_analysis_stats', {})
            malicious = last_analysis_stats.get('malicious', 0)
            suspicious = last_analysis_stats.get('suspicious', 0)
            total = sum(last_analysis_stats.values())
            detection_ratio = f"{malicious + suspicious}/{total}" if total > 0 else "0/0"
            
            # Get top 5 detection engines that marked it as malicious or suspicious
            engines = []
            if 'last_analysis_results' in attrs:
                engines = [
                    {'engine': k, 'result': v.get('result', 'unknown')}
                    for k, v in attrs['last_analysis_results'].items()
                    if v.get('category') in ['malicious', 'suspicious'] or v.get('result') in ['malicious', 'suspicious']
                ][:5]  # Limit to top 5
            
            # Format analysis date if available
            last_analysis_date = None
            if 'last_analysis_date' in attrs:
                try:
                    last_analysis_date = datetime.utcfromtimestamp(attrs['last_analysis_date']).isoformat() + 'Z'
                except (TypeError, ValueError):
                    pass
            
            return jsonify({
                'data': {
                    'indicator': indicator,
                    'type': 'file',
                    'detection_ratio': detection_ratio,
                    'reputation': attrs.get('reputation', 0),
                    'last_analysis_date': last_analysis_date,
                    'engines': engines,
                    'permalink': f"https://www.virustotal.com/gui/file/{indicator}/detection"
                }
            })
        
        # Handle search response (shouldn't normally reach here with the current implementation)
        return jsonify({
            'message': 'Unexpected response format from VirusTotal',
            'data': None
        }), 500
        
    except Exception as e:
        return jsonify({
            'message': 'Error processing VirusTotal response',
            'error': str(e)
        }), 500


@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id: int):
    user = User.query.get_or_404(user_id)
    _ensure_profile(user)
    return jsonify(user.to_dict(include_profile=True))


@app.route('/api/users/<int:user_id>/password', methods=['POST'])
def update_password(user_id: int):
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    current_password = (data.get('current_password') or '').encode('utf-8')
    new_password = (data.get('new_password') or '').encode('utf-8')

    if not current_password or not new_password:
        return jsonify({'message': 'current_password и new_password обязательны'}), 400

    if not bcrypt.checkpw(current_password, user.password_hash.encode('utf-8')):
        return jsonify({'message': 'Текущий пароль неверен'}), 400

    if len(new_password) < 6:
        return jsonify({'message': 'Новый пароль должен быть длиннее 6 символов'}), 400

    user.password_hash = bcrypt.hashpw(new_password, bcrypt.gensalt()).decode('utf-8')
    db.session.commit()
    return jsonify({'message': 'Пароль обновлен'}), 200


@app.route('/api/users/<int:user_id>/avatar', methods=['POST'])
def update_avatar(user_id: int):
    """Update user avatar (base64 encoded image)"""
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    avatar = data.get('avatar')
    
    if not avatar:
        return jsonify({'message': 'avatar is required'}), 400
    
    try:
        profile = _ensure_profile(user)
        profile.avatar = avatar
        db.session.commit()
        return jsonify({'message': 'Avatar updated', 'avatar': avatar}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update avatar: {str(e)}'}), 400


# ===============================
# Helpers
# ===============================
def _parse_date(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value).date()
    except Exception:
        return None

def _count_by_month(model, year, month):
    return db.session.query(model).filter(
        extract('year', model.created_at) == year,
        extract('month', model.created_at) == month
    ).count()


def _ensure_profile(user: User, auto_commit=True):
    if user.profile:
        return user.profile
    profile = UserProfile(user_id=user.id, job_title=user.role or 'Analyst', plan='free')
    db.session.add(profile)
    if auto_commit:
        db.session.commit()
    return profile


def _create_alert(alert_type, message, user_id=None, username=None):
    """Helper function to create system alerts"""
    try:
        alert = Alert(
            type=alert_type,
            message=message,
            user_id=user_id,
            username=username
        )
        db.session.add(alert)
        db.session.commit()
        return alert
    except Exception as e:
        print(f"Error creating alert: {e}")
        db.session.rollback()
        return None


# ===============================
# API: Alerts (Notifications)
# ===============================
@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get all alerts, sorted by newest first"""
    try:
        alerts = Alert.query.order_by(Alert.created_at.desc()).limit(100).all()
        return jsonify([alert.to_dict() for alert in alerts])
    except Exception as e:
        return jsonify({'message': f'Error fetching alerts: {str(e)}'}), 500


@app.route('/api/alerts/<int:alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    """Delete a specific alert"""
    try:
        alert = Alert.query.get_or_404(alert_id)
        db.session.delete(alert)
        db.session.commit()
        return jsonify({'message': 'Alert deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error deleting alert: {str(e)}'}), 500


# ===============================
# API: Admin User Management
# ===============================
@app.route('/api/admin/users', methods=['GET'])
def admin_get_users():
    """Get all users (admin only)"""
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict(include_profile=True) for u in users])


@app.route('/api/admin/users', methods=['POST'])
def admin_create_user():
    """Create a new user (admin only)"""
    data = request.get_json() or {}
    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'username, email and password are required'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User with this email already exists'}), 409
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'User with this username already exists'}), 409
    
    try:
        password = data['password'].encode('utf-8')
        hashed = bcrypt.hashpw(password, bcrypt.gensalt())
        
        user = User(
            username=data['username'],
            email=data['email'],
            password_hash=hashed.decode('utf-8'),
            role=data.get('role', 'user')
        )
        db.session.add(user)
        db.session.flush()
        _ensure_profile(user, auto_commit=False)
        db.session.commit()
        return jsonify(user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create user: {str(e)}'}), 400


@app.route('/api/admin/users/<int:user_id>', methods=['PATCH'])
def admin_update_user(user_id):
    """Update user role or block status (admin only)"""
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    
    try:
        if 'role' in data:
            user.role = data['role']
        if 'is_blocked' in data:
            user.is_blocked = data['is_blocked']
        db.session.commit()
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update user: {str(e)}'}), 400


@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def admin_delete_user(user_id):
    """Delete a user (admin only)"""
    user = User.query.get_or_404(user_id)
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to delete user: {str(e)}'}), 400

// src/components/BillingModal.js
import { FiX, FiCheck, FiStar, FiZap, FiAward } from 'react-icons/fi';
import './BillingModal.css';

function BillingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const plans = [
    {
      name: 'FREE',
      price: '$0',
      period: '/forever',
      icon: <FiStar />,
      description: 'Идеально для начала работы',
      features: [
        'Базовый доступ к отчетам',
        'До 10 Sigma Rules',
        'Просмотр угроз',
        'Email поддержка'
      ],
      buttonText: 'GET NOW',
      buttonClass: 'plan-btn-free',
      popular: false
    },
    {
      name: 'VIP',
      price: '$20',
      period: '/month',
      icon: <FiZap />,
      description: 'Для профессионалов',
      features: [
        'Всё из FREE',
        'Неограниченные Sigma Rules',
        'Приоритетная поддержка',
        'API доступ',
        'Экспорт данных'
      ],
      buttonText: 'UPGRADE',
      buttonClass: 'plan-btn-vip',
      popular: true
    },
    {
      name: 'ENTERPRISE',
      price: '$100',
      period: '/month',
      icon: <FiAward />,
      description: 'Для команд и организаций',
      features: [
        'Всё из VIP',
        'Неограниченные пользователи',
        'Выделенный менеджер',
        'SLA 99.9%',
        'Кастомные интеграции',
        'On-premise развертывание'
      ],
      buttonText: 'CONTACT US',
      buttonClass: 'plan-btn-enterprise',
      popular: false
    }
  ];

  return (
    <div className="billing-modal-overlay" onClick={onClose}>
      <div className="billing-modal" onClick={(e) => e.stopPropagation()}>
        <button className="billing-modal-close" onClick={onClose}>
          <FiX />
        </button>
        
        <div className="billing-modal-header">
          <h2>Выберите план</h2>
          <p>Выберите подписку, которая подходит именно вам</p>
        </div>

        <div className="billing-plans-grid">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`billing-plan-card ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && <div className="popular-badge">Популярный</div>}
              
              <div className="plan-icon">{plan.icon}</div>
              <h3 className="plan-name">{plan.name}</h3>
              <p className="plan-description">{plan.description}</p>
              
              <div className="plan-price">
                <span className="price-amount">{plan.price}</span>
                <span className="price-period">{plan.period}</span>
              </div>

              <ul className="plan-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    <FiCheck className="feature-check" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`plan-btn ${plan.buttonClass}`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BillingModal;

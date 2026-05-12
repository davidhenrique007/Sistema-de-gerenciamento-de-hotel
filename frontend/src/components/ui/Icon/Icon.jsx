// src/components/ui/Icon/Icon.jsx
import React from 'react';

const Icon = ({ name, className = '' }) => {
    const icons = {
        check: '✓',
        success: '✓',
        warning: '⚠',
        lock: '🔒',
        hotel: '🏨',
        calendar: '📅',
        night: '🌙',
        room: '🛏️',
        price: '💰',
        service: '✨',
        total: '🎯',
        list: '📋',
        email: '📧',
        phone: '📱',
        card: '💳',
        cash: '💵'
    };

    return <span className={className}>{icons[name] || '•'}</span>;
};

export default Icon;

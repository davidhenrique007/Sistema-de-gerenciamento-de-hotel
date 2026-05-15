import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import Button from './ui/Button/Button';

const LogoutButton = ({ variant = 'outline', size = 'md', className = '' }) => {
  const { logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
      translateKey="common.logout"
    >
      {t('common.logout')}
    </Button>
  );
};

export default LogoutButton;

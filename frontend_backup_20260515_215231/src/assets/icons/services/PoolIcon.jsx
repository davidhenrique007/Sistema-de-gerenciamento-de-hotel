import React from 'react';
import Icon from '../Icon';

const PoolIcon = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <rect x="4" y="10" width="16" height="8" rx="2" />
    <path d="M8 18v4M16 18v4" />
    <path d="M4 14h16" />
    <circle cx="8" cy="6" r="2" fill="currentColor" />
    <circle cx="16" cy="6" r="2" fill="currentColor" />
  </Icon>
);

export default PoolIcon;
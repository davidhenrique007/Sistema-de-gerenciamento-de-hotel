import React from 'react';
import Icon from '../Icon';

const AirconIcon = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <rect x="4" y="6" width="16" height="12" rx="2" />
    <path d="M8 18v4M16 18v4M8 6V2M16 6V2" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </Icon>
);

export default AirconIcon;
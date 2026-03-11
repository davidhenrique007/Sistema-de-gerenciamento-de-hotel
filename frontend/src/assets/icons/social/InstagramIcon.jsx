import React from 'react';
import Icon from '../Icon';

const InstagramIcon = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="18" cy="6" r="0.5" fill="currentColor" />
  </Icon>
);

export default InstagramIcon;
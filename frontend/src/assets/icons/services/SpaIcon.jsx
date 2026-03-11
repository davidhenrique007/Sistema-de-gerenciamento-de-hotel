import React from 'react';
import Icon from '../Icon';

const SpaIcon = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path d="M12 22c-2.5-2.5-4-5-4-8s1.5-5.5 4-8c2.5 2.5 4 5 4 8s-1.5 5.5-4 8z" />
    <path d="M8 8c-1.5 1-3 2.5-3 5" />
    <path d="M16 8c1.5 1 3 2.5 3 5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </Icon>
);

export default SpaIcon;
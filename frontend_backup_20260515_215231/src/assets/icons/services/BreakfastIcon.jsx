import React from 'react';
import Icon from '../Icon';

const BreakfastIcon = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path d="M4 8h16v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z" />
    <path d="M8 4v4M16 4v4M12 4v4" />
    <circle cx="8" cy="14" r="1" fill="currentColor" />
    <circle cx="12" cy="14" r="1" fill="currentColor" />
    <circle cx="16" cy="14" r="1" fill="currentColor" />
  </Icon>
);

export default BreakfastIcon;
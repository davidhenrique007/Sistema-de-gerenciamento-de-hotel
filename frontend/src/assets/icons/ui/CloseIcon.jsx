import React from 'react';
import Icon from '../Icon';

const CloseIcon = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Icon>
);

export default CloseIcon;
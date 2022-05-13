import React from 'react';
import { INavStyles, Nav } from "@fluentui/react"
import { useLocation, Location } from 'react-router-dom';

import { useResolvedPath } from 'react-router-dom'
const navStyles: Partial<INavStyles> = {
  root: {
    width: 208,
    height: 350,
    boxSizing: 'border-box',
    border: '1px solid #eee',
    overflowY: 'auto',
  },
};

const navProfile = {
  key: 'profile',
  name: '配置',
  to: '/profile',
  url: '#/profile',
}
const navMatch = {
  key: 'match',
  name: '智能匹配',
  to: '/match',
  url: '#/match',
}

const navs = [
  navProfile,
  navMatch
]
const navLinks = [
  {
    links: [
      navProfile,
      navMatch
    ]
  }
]

function getKey(location: Location) {
  let locationPathname = location.pathname;

  return navs.filter(nav => {
    const path = useResolvedPath(nav.to);
    let toPathname = path.pathname;
    return locationPathname === toPathname || (locationPathname.startsWith(toPathname) &&
      locationPathname.charAt(toPathname.length) === "/");
  })[0]?.key;
}


export const SettingsNav = () => {
  const location = useLocation();
  const key = getKey(location);
  return (
    <Nav groups={navLinks} styles={navStyles}
      selectedKey={key}
    />
  )
}
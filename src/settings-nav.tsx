import React from 'react';
import { useLocation, useNavigate, Location } from 'react-router-dom';

import { NavDrawer, NavItem, makeStyles, NavDrawerBody, tokens } from '@fluentui/react-components';

import { useResolvedPath } from 'react-router-dom';

const useStyles = makeStyles({
  root: {
    width: '208px',
    height: '350px',
    boxSizing: 'border-box',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  nav: {
    width: '100%',
    height: '100%',
  },

})


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

function getKey(location: Location) {
  let locationPathname = location.pathname;

  return navs.filter(nav => {
    const path = useResolvedPath(nav.to);
    let toPathname = path.pathname;
    return locationPathname === toPathname || (locationPathname.startsWith(toPathname) &&
      locationPathname.charAt(toPathname.length) === "/");
  })[0]?.key || '';
}


export const SettingsNav = () => {
  const styles = useStyles();
  const location = useLocation();

  const navigate = useNavigate();
  const selectedValue = getKey(location);


  return (
    <div className={styles.root}>
      <NavDrawer
        className={styles.nav}
        selectedValue={selectedValue}
        type="inline"
        open={true}
        onNavItemSelect={(_, data) => {
          const target = navs.find(n => n.key === data.value);
          if (target) {
            navigate(target.to);
          }
        }}
      >
        <NavDrawerBody>
          {navs.map((nav) => (
            <NavItem
              key={nav.key}
              value={nav.key}
            >
              {nav.name}
            </NavItem>
          ))}
        </NavDrawerBody>
      </NavDrawer>
    </div>
  );
}
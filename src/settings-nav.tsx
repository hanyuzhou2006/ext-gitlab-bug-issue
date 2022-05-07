import React from 'react';
import { INavStyles, Nav } from "@fluentui/react"

const navStyles: Partial<INavStyles> = {
  root: {
    width: 208,
    height: 350,
    boxSizing: 'border-box',
    border: '1px solid #eee',
    overflowY: 'auto',
  },
};

const navLinks = [
  {
    links: [
      {
        name: "Profile",
        url: "#/",
        key: "profile",
      },
      {
        name: "智能匹配",
        url: "#/match",
        key: "match",
      }
    ]
  }
]

export const SettingsNav = () => {
  return (
    <Nav groups={navLinks} styles={navStyles} />
  )
}
import React from 'react';

// export const theme = {
//   primary: '#6A4EB7',
//   secondary: '#A522A6',
//   accent: '#C30A18',
//   neutral: '#dddddd',
//   inverted_neutral: '#3c3c3c'
// };

export const theme = {
  primary: '#6A4EB7',
  secondary: '#1969be',
  accent: '#A6ABBD',
  neutral: '#303030',
  inverted_neutral: '#DDDDDD'
};

export const withTheme = Component => props => <Component themecolors={theme} {...props}/>;

import { keyframes, style } from '@vanilla-extract/css';
import { color, config, toRem } from 'folds';

export const MembersDrawer = style({
  width: toRem(266),
  backgroundColor: color.Background.Container,
  color: color.Background.OnContainer,
});

export const MembersDrawerHeader = style({
  flexShrink: 0,
  padding: `0 ${config.space.S200} 0 ${config.space.S300}`,
  borderBottomWidth: config.borderWidth.B300,
});

export const MemberDrawerContentBase = style({
  position: 'relative',
  overflow: 'hidden',
});

export const MemberDrawerContent = style({
  padding: `${config.space.S200} 0`,
});

const ScrollBtnAnime = keyframes({
  '0%': {
    transform: `translate(-50%, -100%) scale(0)`,
  },
  '100%': {
    transform: `translate(-50%, 0) scale(1)`,
  },
});

export const DrawerScrollTop = style({
  position: 'absolute',
  top: config.space.S200,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1,
  animation: `${ScrollBtnAnime} 100ms`,
});

export const DrawerGroup = style({
  paddingLeft: config.space.S200,
});

export const MembersGroup = style({
  paddingLeft: config.space.S200,
});
export const MembersGroupLabel = style({
  padding: config.space.S200,
  selectors: {
    '&:not(:first-child)': {
      paddingTop: config.space.S500,
    },
  },
});

export const DrawerVirtualItem = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
});

export const ExternalIcon = style({
  position: 'absolute',
  bottom: '-4px',
  marginLeft: '0.5em',
  zIndex: 1,
  padding: '0 2px',
  backgroundColor: color.Background.Container,
  borderRadius: '6px',
  selectors: {
    '&:hover': {
      backgroundColor: color.Background.ContainerHover,
    },
    '&:active': {
      backgroundColor: color.Background.ContainerActive,
    },
  },
});

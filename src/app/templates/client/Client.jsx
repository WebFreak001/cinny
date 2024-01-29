import React, { use, useState, useEffect, useRef } from 'react';
import './Client.scss';

import { initHotkeys } from '../../../client/event/hotkeys';
import { initRoomListListener } from '../../../client/event/roomList';

import Text from '../../atoms/text/Text';
import Spinner from '../../atoms/spinner/Spinner';
import Navigation from '../../organisms/navigation/Navigation';
import ContextMenu, { MenuItem } from '../../atoms/context-menu/ContextMenu';
import IconButton from '../../atoms/button/IconButton';
import ReusableContextMenu from '../../atoms/context-menu/ReusableContextMenu';
import Windows from '../../organisms/pw/Windows';
import Dialogs from '../../organisms/pw/Dialogs';
import { Outlet, useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import navigation from '../../../client/state/navigation';
import cons from '../../../client/state/cons';

import VerticalMenuIC from '../../../../public/res/ic/outlined/vertical-menu.svg';
import { MatrixClientProvider } from '../../hooks/useMatrixClient';
import { useSetting } from '../../state/hooks/settings';
import { settingsAtom } from '../../state/settings';
import initMatrix from '../../../client/initMatrix';

function SystemEmojiFeature() {
  const [twitterEmoji] = useSetting(settingsAtom, 'twitterEmoji');

  if (twitterEmoji) {
    document.documentElement.style.setProperty('--font-emoji', 'Twemoji');
  } else {
    document.documentElement.style.setProperty('--font-emoji', 'Twemoji_DISABLED');
  }

  return null;
}

function Client() {
  const matrixClient = use(initMatrix.initAndLoad());
  const classNameHidden = 'client__item-hidden';

  const [isSetup, setSetup] = useState(false);

  if (!isSetup) {
    setSetup(true);
    initHotkeys();
    initRoomListListener(initMatrix.roomList);
  }

  const navWrapperRef = useRef(null);
  const roomWrapperRef = useRef(null);
  const navigate = useNavigate();

  function onRoomSelected(selectedRoomId, prevRoomId, eventId) {
    navigate("/" + encodeURIComponent(selectedRoomId) + "/" + encodeURIComponent(eventId || ""));
    navWrapperRef.current?.classList.add(classNameHidden);
    roomWrapperRef.current?.classList.remove(classNameHidden);
  }
  function onNavigationSelected() {
    navWrapperRef.current?.classList.remove(classNameHidden);
    roomWrapperRef.current?.classList.add(classNameHidden);
  }

  useEffect(() => {
    navigation.on(cons.events.navigation.ROOM_SELECTED, onRoomSelected);
    navigation.on(cons.events.navigation.NAVIGATION_OPENED, onNavigationSelected);

    return () => {
      navigation.removeListener(cons.events.navigation.ROOM_SELECTED, onRoomSelected);
      navigation.removeListener(cons.events.navigation.NAVIGATION_OPENED, onNavigationSelected);
    };
  }, []);

  return (
    <MatrixClientProvider value={matrixClient}>
      <div className="client-container">
        <div className="navigation__wrapper" ref={navWrapperRef}>
          <Navigation />
        </div>
        <div className={`room__wrapper ${classNameHidden}`} ref={roomWrapperRef}>
          <Outlet />
        </div>
        <Windows />
        <Dialogs />
        <ReusableContextMenu />
        <SystemEmojiFeature />
      </div>
    </MatrixClientProvider>
  );
}

export default Client;

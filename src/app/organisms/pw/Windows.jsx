import React, { useState, useEffect } from 'react';

import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';

import InviteList from '../invite-list/InviteList';
import NotiList from '../noti-list/NotiList';
import PublicRooms from '../public-rooms/PublicRooms';
import InviteUser from '../invite-user/InviteUser';
import Settings from '../settings/Settings';
import SpaceSettings from '../space-settings/SpaceSettings';
import SpaceManage from '../space-manage/SpaceManage';

function Windows() {
  const [isInviteList, changeInviteList] = useState(false);
  const [isNotiList, changeNotiList] = useState(false);
  const [publicRooms, changePublicRooms] = useState({
    isOpen: false,
    searchTerm: undefined,
  });
  const [inviteUser, changeInviteUser] = useState({
    isOpen: false,
    roomId: undefined,
    term: undefined,
  });

  function openInviteList() {
    changeInviteList(true);
  }
  function openNotiList() {
    changeNotiList(true);
  }
  function openPublicRooms(searchTerm) {
    changePublicRooms({
      isOpen: true,
      searchTerm,
    });
  }
  function openInviteUser(roomId, searchTerm) {
    changeInviteUser({
      isOpen: true,
      roomId,
      searchTerm,
    });
  }

  useEffect(() => {
    navigation.on(cons.events.navigation.INVITE_LIST_OPENED, openInviteList);
    navigation.on(cons.events.navigation.NOTI_LIST_OPENED, openNotiList);
    navigation.on(cons.events.navigation.PUBLIC_ROOMS_OPENED, openPublicRooms);
    navigation.on(cons.events.navigation.INVITE_USER_OPENED, openInviteUser);
    return () => {
      navigation.removeListener(cons.events.navigation.INVITE_LIST_OPENED, openInviteList);
      navigation.removeListener(cons.events.navigation.NOTI_LIST_OPENED, openNotiList);
      navigation.removeListener(cons.events.navigation.PUBLIC_ROOMS_OPENED, openPublicRooms);
      navigation.removeListener(cons.events.navigation.INVITE_USER_OPENED, openInviteUser);
    };
  }, []);

  return (
    <>
      <InviteList isOpen={isInviteList} onRequestClose={() => changeInviteList(false)} />
      <NotiList isOpen={isNotiList} onRequestClose={() => changeNotiList(false)} />
      <PublicRooms
        isOpen={publicRooms.isOpen}
        searchTerm={publicRooms.searchTerm}
        onRequestClose={() => changePublicRooms({ isOpen: false, searchTerm: undefined })}
      />
      <InviteUser
        isOpen={inviteUser.isOpen}
        roomId={inviteUser.roomId}
        searchTerm={inviteUser.searchTerm}
        onRequestClose={() => changeInviteUser({ isOpen: false, roomId: undefined })}
      />
      <Settings />
      <SpaceSettings />
      <SpaceManage />
    </>
  );
}

export default Windows;

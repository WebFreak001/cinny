import React, { useState, useEffect } from 'react';
import { MatrixEvent } from 'matrix-js-sdk';
import PropTypes from 'prop-types';

import '../room/RoomViewContent.scss';

import initMatrix from '../../../client/initMatrix';
import { selectRoom } from '../../../client/action/navigation';

import {
  emojifyAndLinkify,
  getReactCustomHtmlParser,
} from '../../plugins/react-custom-html-parser';

import parse from 'html-react-parser';
import { sanitizeCustomHtml } from '../../utils/sanitize';
import { trimReplyFromBody } from '../../utils/room';
import { Message } from '../room/message';
import { color } from 'folds';
import {
  MessageTextBody,
  MessageEmptyContent,
  MessageBrokenContent,
} from '../../components/message';
import IconButton from '../../atoms/button/IconButton';
import PopupWindow from '../../molecules/popup-window/PopupWindow';

import CrossIC from '../../../../public/res/ic/outlined/cross.svg';

const renderBody = (body: string, customBody: string | undefined) => {
  if (body === '') <MessageEmptyContent />;
  if (customBody) {
    if (customBody === '') <MessageEmptyContent />;
    return parse(sanitizeCustomHtml(customBody));
  }
  return emojifyAndLinkify(body, true);
};

function NotiList({ isOpen, onRequestClose }: { isOpen: boolean, onRequestClose: (...args: any[]) => any }) {
  const [notis, setNotis] = useState<any[]>([]);
  const [nextToken, setNextToken] = useState(null);

  const mx = initMatrix.matrixClient;

  useEffect(() => {
    if (!mx) return;

    fetch(new URL('/_matrix/client/v3/notifications?limit=10', mx.getHomeserverUrl()), {
      headers: {
        Authorization: `Bearer ${mx.getAccessToken()}`,
      },
    })
      .then((res) => res.json())
      .then(async (notificationsResponse) => {
        const { notifications, next_token } = notificationsResponse;

        setNotis(notifications);

        for (const noti of notifications) {
          const room = mx.getRoom(noti.room_id);
          noti.mEvent = new MatrixEvent(await mx.fetchRoomEvent(noti.room_id, noti.event.event_id));

          setNotis(notifications);
        }

        setNextToken(next_token);
      });
  }, [mx]);

  if (!mx)
    return undefined;

  return (
    <PopupWindow
      isOpen={isOpen}
      title="Notifications (WIP)"
      contentOptions={<IconButton src={CrossIC} onClick={onRequestClose} tooltip="Close" />}
      onRequestClose={onRequestClose}
    >
      <div style={{ color: color.Surface.OnContainer }}>
        {notis.map((noti) => {
          const eventId = noti.event.event_id;
          const roomId = noti.room_id;

          const room = mx.getRoom(roomId);

          if (room == null) return <div>a</div>;

          const mEvent = noti.mEvent;

          if (mEvent == null) return <div>a</div>;

          const { body, formatted_body: customBody } = mEvent.event.content;

          if (typeof body !== 'string') return <div>a</div>;

          const trimmedBody = trimReplyFromBody(body);

          return (
            <Message
              mEvent={mEvent}
              room={room}
              onClick={() => {
                selectRoom(roomId, eventId);
                onRequestClose();
              }}
              key={noti.event.event_id}
            >
              <MessageTextBody preWrap={typeof customBody !== 'string'}>
                {renderBody(trimmedBody, typeof customBody === 'string' ? customBody : undefined)}
              </MessageTextBody>
            </Message>
          );
        })}
      </div>
    </PopupWindow>
  );
}

NotiList.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
};

export default NotiList;

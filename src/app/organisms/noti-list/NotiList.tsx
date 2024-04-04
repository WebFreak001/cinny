import React, { useState, useEffect, useMemo } from 'react';
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
import { color, Button, Spinner } from 'folds';
import {
  MessageTextBody,
  MessageEmptyContent,
  MessageBrokenContent,
} from '../../components/message';
import IconButton from '../../atoms/button/IconButton';
import PopupWindow from '../../molecules/popup-window/PopupWindow';

import CrossIC from '../../../../public/res/ic/outlined/cross.svg';
import cons from '../../../client/state/cons';

const renderBody = (body: string, customBody: string | undefined) => {
  if (body === '') <MessageEmptyContent />;
  if (customBody) {
    if (customBody === '') <MessageEmptyContent />;
    return parse(sanitizeCustomHtml(customBody));
  }
  return emojifyAndLinkify(body, true);
};

export function useNotifications() {
  const [notis, setNotis] = useState<any[]>([]);
  const [nextToken, setNextToken] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [receivedNotifications, setReceivedNotifications] = useState(0);

  const mx = initMatrix.matrixClient;

  const fetchNotifications = async (from?:any, limit = 10) => {
    if (!mx) return;

    const url = new URL('/_matrix/client/v3/notifications', mx.getHomeserverUrl());
    const params = new URLSearchParams();
    
    params.append('limit', limit.toString());
    if (from != null) params.append('from', from.toString());

    url.search = params.toString();

    const notificationsResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${mx.getAccessToken()}`,
      },
    }).then((res) => res.json());

    const { notifications, next_token } = notificationsResponse;

    setNotis(notis => {
        const newNotis = [...notis];

        for (const noti of notifications) {
            if (notis.find(x => x.event.event_id == noti.event.event_id) != null)
                continue;

            newNotis.push(noti);
        }

        return newNotis.sort((a, b) => b.ts - a.ts);
    });

    if (nextToken == null || from != null)
        setNextToken(next_token);
  }

  useEffect(() => {
    if (!initMatrix.notifications) return;
    const notifs = initMatrix.notifications;
    const cb = () => {
      setReceivedNotifications((n) => n + 1);
    };
    notifs.on(cons.events.notifications.NOTI_CHANGED, cb);
    return () => {
      notifs.off(cons.events.notifications.NOTI_CHANGED, cb);
    };
  }, [initMatrix.notifications]);

  useEffect(() => {
    fetchNotifications();
  }, [mx, receivedNotifications]);

  const paginate = () => {
    setLoading(true);
    fetchNotifications(nextToken, 20).finally(() => { setLoading(false); });
  };

  const rooms = useMemo(() => Array.from(new Set(notis.map((n) => n.room_id))), [notis]);
  const [sumTotal, sumHighlight] = useMemo(
    () =>
      initMatrix.notifications
        ? rooms.reduce(
            ([sumTotal, sumHighlight], room) => [
              sumTotal + initMatrix.notifications!.getTotalNoti(room),
              sumHighlight + initMatrix.notifications!.getHighlightNoti(room),
            ],
            [0, 0]
          )
        : [0, 0],
    [rooms, initMatrix.notifications]
  );

  return { notis, sumTotal, sumHighlight, hasMore: nextToken !== null, paginate, isLoading };
}

function NotiList({
  isOpen,
  onRequestClose,
}: {
  isOpen: boolean;
  onRequestClose: (...args: any[]) => any;
}) {
  const mx = initMatrix.matrixClient;

  const { notis, hasMore, paginate, isLoading } = useNotifications();

  if (!mx) return undefined;

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

          const mEvent = new MatrixEvent(noti.event);

          if (mEvent == null) return undefined;

          let { body, formatted_body: customBody } = noti.event.content;

          if (typeof body !== 'string') body = '';

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
              collapse={false}
              highlight={false}
              messageLayout={0}
              messageSpacing="100"
            >
              <MessageTextBody preWrap={typeof customBody !== 'string'}>
                {renderBody(trimmedBody, typeof customBody === 'string' ? customBody : undefined)}
              </MessageTextBody>
            </Message>
          );
        })}
      </div>
      <br />
      {hasMore &&
        <div className="room-search__more">
            { isLoading ? <Spinner /> : <Button fill={'None'} onClick={paginate}>Load more</Button> }
      </div>
      }
    </PopupWindow>
  );
}

NotiList.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
};

export default NotiList;

import React, { useState, useEffect } from 'react';

import Text from '../../atoms/text/Text';
import Spinner from '../../atoms/spinner/Spinner';
import ContextMenu, { MenuItem } from '../../atoms/context-menu/ContextMenu';
import IconButton from '../../atoms/button/IconButton';

import initMatrix from '../../../client/initMatrix';

import VerticalMenuIC from '../../../../public/res/ic/outlined/vertical-menu.svg';

export function Loading() {
	const [loadingMsg, setLoadingMsg] = useState('Heating up');

	useEffect(() => {
		let counter = 0;
		const iId = setInterval(() => {
		  const msgList = ['Almost there...', 'Looks like you have a lot of stuff to heat up!'];
		  if (counter === msgList.length - 1) {
			setLoadingMsg(msgList[msgList.length - 1]);
			clearInterval(iId);
			return;
		  }
		  setLoadingMsg(msgList[counter]);
		  counter += 1;
		}, 15000);
	});

	return (
		<div className="loading-display">
		  <div className="loading__menu">
			<ContextMenu
			  placement="bottom"
			  content={
				<>
				  <MenuItem onClick={() => initMatrix.clearCacheAndReload()}>
					Clear cache & reload
				  </MenuItem>
				  <MenuItem onClick={() => initMatrix.logout()}>Logout</MenuItem>
				</>
			  }
			  render={(toggle) => (
				<IconButton size="extra-small" onClick={toggle} src={VerticalMenuIC} />
			  )}
			/>
		  </div>
		  <Spinner />
		  <Text className="loading__message" variant="b2">
			{loadingMsg}
		  </Text>

		  <div className="loading__appname">
			<Text variant="h2" weight="medium">
			  Cinny
			</Text>
		  </div>
		</div>
	  );
}
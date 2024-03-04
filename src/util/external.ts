export function mightBeDiscord(userId: string): boolean {
  return userId.startsWith('@_discord_') || userId.startsWith('@discord_');
}

export function mightBeTelegram(userId: string): boolean {
  return userId.startsWith('@_telegram_') || userId.startsWith('@telegram_');
}

export const mightBeExternal = (userId: string) =>
  mightBeDiscord(userId) || mightBeTelegram(userId);

export const externalServicePart = (userId: string) => {
  if (userId.startsWith('_')) userId = userId.substring(1);
  let end = userId.indexOf('_');
  return userId.substring(0, end);
};

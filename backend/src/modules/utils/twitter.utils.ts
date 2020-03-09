import Twit from 'twit';
import { Twitter } from 'twit';
import { CacheService } from 'cache/cache.service';

const CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

export async function createTwitter(cacheService: CacheService, owner: string): Promise<Twit> {
  if (!(await cacheService.hasStoredUserToken(owner, 'twitter'))) {
    throw new Error('No twitter token found for connected user');
  }

  if (!(await cacheService.hasStoredUserToken(owner, 'twitter-secret'))) {
    throw new Error('No twitter token secret found for connected tuser');
  }

  return new Twit({
    consumer_key: CONSUMER_KEY,
    consumer_secret: CONSUMER_SECRET,
    access_token: await cacheService.getStoredUserToken(owner, 'twitter'),
    access_token_secret: await cacheService.getStoredUserToken(owner, 'twitter-secret'),
  });
}

export async function getTwitterUser(
  cacheService: CacheService, owner: string, account: string
): Promise<Twitter.User> {
  const twitter = await createTwitter(cacheService, owner);

  const user = (await twitter.get('users/show', {
    screen_name: account,
  })).data as Twitter.User;

  if (!(await cacheService.hasStoredState(null, 'twitter', `${account}-id`))) {
    await cacheService.storeState(null, 'twitter', `${account}-id`, user.id_str, -1);
  }

  if (!(await cacheService.hasStoredState(null, 'twitter', `${account}-followers`))) {
    await cacheService.storeState(null, 'twitter', `${account}-followers`, user.followers_count);
  }

  return user;
}

export async function getTwitterTweet(
  cacheService: CacheService, owner: string, tweetId: string
): Promise<Twitter.Status> {
  const twitter = await createTwitter(cacheService, owner);

  return (await twitter.get('statuses/lookup', {
    id: tweetId,
  })).data[0] as Twitter.Status;
}

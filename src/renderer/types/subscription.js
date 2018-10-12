// @flow

// Subscription redux types
export type SubscriptionState = {
  subscriptions: Array<Subscription>,
  unread: UnreadSubscriptions,
  loading: boolean,
};

export type Subscription = {
  channelName: string, // @CryptoCandor,
  uri: string, // lbry://@CryptoCandor#9152f3b054f692076a6882d1b58a30e8781cc8e6
  latest: string, // substratum#b0ab143243020e7831fd070d9f871e1fda948620
};

export type UnreadSubscriptions = {
  [string]: Array<string>, // Keep track of every channels latest videos
};

// Subscription action types
type doChannelSubscribe = {
  type: ACTIONS.CHANNEL_SUBSCRIBE,
  data: Subscription,
};

type doChannelUnsubscribe = {
  type: ACTIONS.CHANNEL_UNSUBSCRIBE,
  data: Subscription,
};

type setSubscriptionLatest = {
  type: ACTIONS.SET_SUBSCRIPTION_LATEST,
  data: {
    subscription: Subscription,
    uri: string,
  },
};

type setSubscriptionNotification = {
  type: ACTIONS.SET_SUBSCRIPTION_NOTIFICATION,
  data: {
    subscription: Subscription,
    uri: string,
    type: NotificationType,
  },
};

type setSubscriptionNotifications = {
  type: ACTIONS.SET_SUBSCRIPTION_UNREADS,
  data: {
    unread: SubscriptionNotifications,
  },
};

type CheckSubscriptionStarted = {
  type: ACTIONS.CHECK_SUBSCRIPTION_STARTED,
};

type CheckSubscriptionCompleted = {
  type: ACTIONS.CHECK_SUBSCRIPTION_COMPLETED,
};

type fetchedSubscriptionsSucess = {
  type: ACTIONS.FETCH_SUBSCRIPTIONS_SUCCESS,
  data: Array<Subscription>,
};

export type Action =
  | doChannelSubscribe
  | doChannelUnsubscribe
  | setSubscriptionLatest
  | setSubscriptionNotification
  | CheckSubscriptionStarted
  | CheckSubscriptionCompleted
  | Function;
export type Dispatch = (action: Action) => any;

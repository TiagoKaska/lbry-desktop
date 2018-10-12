// @flow
import * as ACTIONS from 'constants/action_types';
import * as NOTIFICATION_TYPES from 'constants/notification_types';
import { handleActions } from 'util/redux-utils';
import type { Subscription } from 'types/subscription';


const defaultState = {
  subscriptions: [],
  unread: {},
  loading: false,
};

export default handleActions(
  {
    [ACTIONS.CHANNEL_SUBSCRIBE]: (
      state: SubscriptionState,
      action: doChannelSubscribe
    ): SubscriptionState => {
      const newSubscription: Subscription = action.data;
      const newSubscriptions: Array<Subscription> = state.subscriptions.slice();
      newSubscriptions.unshift(newSubscription);

      return {
        ...state,
        subscriptions: newSubscriptions,
      };
    },
    [ACTIONS.CHANNEL_UNSUBSCRIBE]: (
      state: SubscriptionState,
      action: doChannelUnsubscribe
    ): SubscriptionState => {
      const subscriptionToRemove: Subscription = action.data;

      const newSubscriptions = state.subscriptions
        .slice()
        .filter(subscription => subscription.channelName !== subscriptionToRemove.channelName);

      return {
        ...state,
        subscriptions: newSubscriptions,
      };
    },
    [ACTIONS.SET_SUBSCRIPTION_LATEST]: (
      state: SubscriptionState,
      action: setSubscriptionLatest
    ): SubscriptionState => ({
      ...state,
      subscriptions: state.subscriptions.map(
        subscription =>
          subscription.channelName === action.data.subscription.channelName
            ? { ...subscription, latest: action.data.uri }
            : subscription
      ),
    }),
    [ACTIONS.SET_SUBSCRIPTION_UNREADS]: (
      state: SubscriptionState,
      action: setSubscriptionNotifications
    ): SubscriptionState => {
      const { channel, unreadUris } = action.data;
      const currentUnreadUris = state.unread[channel] || [];
      const newUnreads = unreadUris.filter(uri => !currentUnreadUris.includes(uri)).concat(currentUnreadUris)

      return {
        ...state,
        unread: {
          ...state.unread,
          [channel]: newUnreads
        }
      }
    },
    [ACTIONS.CLEAR_SUBSCRIPTION_UNREADS]: (
      state: SubscriptionState,
      action: setSubscriptionNotifications
    ): SubscriptionState => ({
      ...state,
      unread: action.data.unread
    }),
    [ACTIONS.FETCH_SUBSCRIPTIONS_START]: (state: SubscriptionState): SubscriptionState => ({
      ...state,
      loading: true,
    }),
    [ACTIONS.FETCH_SUBSCRIPTIONS_FAIL]: (state: SubscriptionState): SubscriptionState => ({
      ...state,
      loading: false,
    }),
    [ACTIONS.FETCH_SUBSCRIPTIONS_SUCCESS]: (
      state: SubscriptionState,
      action: fetchedSubscriptionsSucess
    ): SubscriptionState => ({
      ...state,
      loading: false,
      subscriptions: action.data,
    }),
  },
  defaultState
);

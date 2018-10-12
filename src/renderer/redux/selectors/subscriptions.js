import { createSelector } from 'reselect';
import {
  selectAllClaimsByChannel,
  selectClaimsById,
  selectAllFetchingChannelClaims,
  makeSelectChannelForClaimUri,
  parseURI
} from 'lbry-redux';

// Returns the entire subscriptions state
const selectState = state => state.subscriptions || {};

// Returns the list of channel uris a user is subscribed to
export const selectSubscriptions = createSelector(selectState, state => state.subscriptions);

// Fetching list of users subscriptions
export const selectIsFetchingSubscriptions = createSelector(selectState, state => state.loading);

// Fetching any claims that are a part of a users subscriptions
export const selectSubscriptionsBeingFetched = createSelector(
  selectSubscriptions,
  selectAllFetchingChannelClaims,
  (subscriptions, fetchingChannelClaims) => {
    const fetchingSubscriptionMap = {};
    subscriptions.forEach(sub => {
      const isFetching = fetchingChannelClaims && fetchingChannelClaims[sub.uri];
      if (isFetching) {
        fetchingSubscriptionMap[sub.uri] = 1;
      }
    });

    return fetchingSubscriptionMap;
  }
);

// Returns the uris for any channel that has unread subscriptions
export const selectUnreadSubscriptions = createSelector(selectState, state => state.unread);

// Returns the current total of unread subscriptions
export const selectUnreadAmount = createSelector(selectUnreadSubscriptions, (unread) => {
  let badges = 0;

  if (!Object.keys(unread).length) {
    return badges;
  }

  Object.keys(unread).forEach(channel => {
    badges += unread[channel].length;
  })

  return badges;
});

// Returns all unread subscriptions for a uri passed in
export const makeSelectUnreadByUri = uri => createSelector(selectUnreadSubscriptions, (notifications) => notifications[uri]);

// Returns the first page of claims for every channel a user is subscribed to
export const selectSubscriptionClaims = createSelector(
  selectAllClaimsByChannel,
  selectClaimsById,
  selectSubscriptions,
  selectUnreadSubscriptions,
  (channelIds, allClaims, savedSubscriptions, notifications) => {
    // no claims loaded yet
    if (!Object.keys(channelIds).length) {
      return [];
    }

    let fetchedSubscriptions = [];

    savedSubscriptions.forEach(subscription => {
      let channelClaims = [];

      // if subscribed channel has content
      if (channelIds[subscription.uri] && channelIds[subscription.uri]['1']) {
        // This will need to be more robust, we will want to be able to load more than the first page

        // Strip out any ids that will be shown as notifications
        const pageOneChannelIds = channelIds[subscription.uri]['1']

        // we have the channel ids and the corresponding claims
        // loop over the list of ids and grab the claim
        pageOneChannelIds.forEach(id => {
          const grabbedClaim = allClaims[id];

          if (notifications[subscription.uri] && notifications[subscription.uri].some(uri => uri.includes(id))) {
            grabbedClaim.isUnread = true;
          }

          channelClaims = channelClaims.concat([grabbedClaim]);
        });
      }

      fetchedSubscriptions = fetchedSubscriptions.concat(channelClaims);
    });

    return fetchedSubscriptions;
  }
);

// Returns all subscriptions that are not in "unread" state
export const selectReadSubscriptions = createSelector(selectSubscriptionClaims, selectUnreadSubscriptions,
  (subscriptionsWithClaims, unreadSubscriptions) => {
    // Filter list of subsctriptions if that uri is unread
    if (!Object.keys(unreadSubscriptions).length) {
      return subscriptionsWithClaims;
    }

    return subscriptionsWithClaims.filter(claim => {
      const channelUri = `lbry://${claim.channel_name}#${claim.value.publisherSignature.certificateId}`
      if (unreadSubscriptions[channelUri]) {
        const claimUri = `lbry://${claim.name}#${claim.claim_id}`;
        return !unreadSubscriptions[channelUri].includes(claimUri);
      }

      return true;
    });
  });

// Returns true if a user is subscribed to the channel associated with the uri passed in
// Accepts content or channel uris
export const makeSelectIsSubscribed = (uri, debug) =>
  createSelector(selectSubscriptions, makeSelectChannelForClaimUri(uri, true), (subscriptions, channelUri) => {
    if (channelUri) {
      return subscriptions.some(sub => sub.uri === channelUri);
    }

    // If we couldn't get a channel uri from the claim uri, the uri passed in might be a channel already
    const { isChannel } = parseURI(uri);
    if (isChannel) {
      const uriWithPrefix = uri.startsWith('lbry://') ? uri : `lbry://${uri}`;
      return subscriptions.some(sub => sub.uri === uriWithPrefix);
    }
  });

// @flow
import React from 'react';
import Page from 'component/page';
import * as settings from 'constants/settings';
import type { Subscription } from 'types/subscription';
import * as NOTIFICATION_TYPES from 'constants/notification_types';
import Button from 'component/button';
import FileList from 'component/fileList';
import type { Claim } from 'types/claim';
import HiddenNsfwClaims from 'component/hiddenNsfwClaims';
import { FormField, FormRow } from 'component/common/form';
import FileCard from 'component/fileCard';

type Props = {
  doFetchMySubscriptions: () => void,
  setSubscriptionNotifications: ({}) => void,
  subscriptions: Array<Subscription>,
  subscriptionClaims: Array<{ uri: string, claims: Array<Claim> }>,
  notifications: {},
  loading: boolean,
  autoDownload: boolean,
  doSetClientSetting: (string, boolean) => void,
};

export default class extends React.PureComponent<Props> {
  constructor() {
    super();

    this.state = {
      view: 'all',
    };
    (this: any).onAutoDownloadChange = this.onAutoDownloadChange.bind(this);
  }

  componentDidMount() {
    const { doFetchMySubscriptions } = this.props;
    doFetchMySubscriptions();
  }

  onAutoDownloadChange(event: SyntheticInputEvent<*>) {
    this.props.doSetClientSetting(settings.AUTO_DOWNLOAD, event.target.checked);
  }

  renderSubscriptions() {
    const { view } = this.state;
    const { subscriptionsLessUnread, unreadSubscriptions, allSubscriptions } = this.props;
    // const { subscriptions, subscriptionClaims, loading, autoDownload, notifications } = this.props;
// console.log("all", allSubscriptions)s
    if (view === 'all') {
      return (
        <React.Fragment>
          <div className="card__title">{__("Your subscriptions")}</div>
          <FileList hideFilter sortByHeight fileInfos={allSubscriptions} />
        </React.Fragment>
      )
    } else {
      return (
        <React.Fragment>
          {!!Object.keys(unreadSubscriptions).length && Object.keys(unreadSubscriptions).map(key => {
            const notification = unreadSubscriptions[key];
            const hashIndex = key.indexOf('#');
            const keyWithoutClaimId = key.slice(0, hashIndex);
            // console.log("key", key);
            // console.log("notification: ", notification)
            // return "test"
            return (
              <section key={key}>
                <div className="card__title">
                  <Button button="link" navigate="/show" navigateParams={{ uri: key }} label={keyWithoutClaimId} />
                </div>
                <div className="card__list card__content">
                  {notification.map(uri => <FileCard uri={uri} />)}
                </div>
              </section>
            )
          })}
          {!!subscriptionsLessUnread.length && (
            <React.Fragment>
              <div className="card__title">{__("Older subscriptions")}</div>
              <FileList hideFilter sortByHeight fileInfos={subscriptionsLessUnread} />
            </React.Fragment>
          )}
        </React.Fragment>
      )
    }


    // let claimList = [];
    // subscriptionClaims.forEach(claimData => {
    //   claimList = claimList.concat(claimData.claims);
    // });
    //
    // const subscriptionUris = claimList.map(claim => `lbry://${claim.name}#${claim.claim_id}`);
    // if (view !== 'all') {
    //   claimList = claimList.filter((claim) => {
    //     console.log("claim", claim)
    //     if (!notifications[subscription.uri]) {
    //       return true;
    //     }
    //
    //     return !notifications[subscription.uri].some(uri => uri.includes(id));
    //   });
    //
    //
    // } else {
    //
    // }
  }

  render() {
    const { subscriptions, subscriptionClaims, loading, autoDownload, notifications } = this.props;

    // let claimList = [];
    // subscriptionClaims.forEach(claimData => {
    //   claimList = claimList.concat(claimData.claims);
    // });

    // const subscriptionUris = claimList.map(claim => `lbry://${claim.name}#${claim.claim_id}`);
    const subscriptionUris = [];

    return (
      <Page notContained loading={loading}>
        <HiddenNsfwClaims uris={subscriptionUris} />
        <div className="card--space-between">
          <Button
            button="button"
            label={this.state.view === 'all' ? __('By Channel') : 'All'}
            onClick={() => {
              this.setState({ view: this.state.view === 'all' ? 'new' : 'all' })
            }} />
              <FormField
                type="checkbox"
                name="auto_download"
                onChange={this.onAutoDownloadChange}
                checked={autoDownload}
                prefix={__('Auto download')}
                />
        </div>
        {!subscriptions.length && (
          <div className="page__empty">
            {__("It looks like you aren't subscribed to any channels yet.")}
            <div className="card__actions card__actions--center">
              <Button button="primary" navigate="/discover" label={__('Explore new content')} />
            </div>
          </div>
        )}
        {!!subscriptions.length && (
          <div className="card__content">
            {this.renderSubscriptions()}
          </div>)}
      </Page>
    );
  }
}

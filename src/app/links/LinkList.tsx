import React, { Fragment } from 'react';
import { navigate } from '@reach/router';
import { useQuery, useSubscription } from '@apollo/react-hooks';

import Link from './Link';
import { Link as LinkType, LinkOrderByInput } from '../../types/index';
import { FEED_QUERY, NEW_LINKS_SUBSCRIPTION } from './schemas';
import { RouteComponentProps } from '@reach/router';
import { LINKS_PER_PAGE } from '../../constants';

type Data = {
  feed: {
    links: LinkType[];
    count: number;
  };
};

type OwnProps = {
  page?: string;
};

type Props = OwnProps & RouteComponentProps;

const LinkList: React.FC<Props> = ({location, page}) => {
  useSubscription(NEW_LINKS_SUBSCRIPTION, {
    onSubscriptionData: ({client, subscriptionData}) => {
      const newLink = subscriptionData.data.newLink;
      const prev = client.readQuery({
        query: FEED_QUERY,
      });
      const exists = prev.feed.links.find(({id}: { id: string }) => id === newLink.id);
      if (exists) {
        client.writeQuery({
          query: FEED_QUERY,
          data: {
            ...prev,
            feed: {
              links: [newLink, ...prev.feed.links],
              count: prev.feed.links.length + 1,
              __typename: prev.feed.__typename,
            }
          }
        });
      }
    }
  });

  const isNewPage = () => location ? location.pathname.includes('new') : false;

  const getPage = () => page ? parseInt(page, 10) : 1;

  const updateCacheAfterVote = (store: any, createdVote: any, linkId: string) => {
    const skip = isNewPage() ? (getPage() - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage() ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage() ? LinkOrderByInput.createdAt_DESC : null;
    const data = store.readQuery({
      query: FEED_QUERY,
      variables: { first, skip, orderBy }
    });
    data.feed.links.forEach((link: LinkType) => {
      if (link.id === linkId) {
        link.votes.push(createdVote);
      }
      return link;
    });

    store.writeQuery({query: FEED_QUERY, data});
  };

  const getQueryVariables = () => {
    const skip = isNewPage() ? (getPage() - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage() ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage() ? LinkOrderByInput.createdAt_DESC : null;
    return {first, skip, orderBy};
  };

  const getLinksToRender = (data: Data) => {
    if (isNewPage()) {
      return data.feed.links;
    }
    const rankedLinks = data.feed.links.slice();
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length);
    return rankedLinks;
  };

  const getPageIndex = () => page ? (getPage() - 1) * LINKS_PER_PAGE : 0;

  const handleNextPage = () => {
    const nextPage = getPage() + 1;
    navigate(`/new/${nextPage}`);
  };

  const handlePreviousPage = () => {
    if (getPage() > 1) {
      const previousPage = getPage() - 1;
      navigate(`/new/${previousPage}`);
    }
  };

  const showNext = (data?: Data) => data && getPage() < data.feed.count / LINKS_PER_PAGE;

  const showPrev = () => getPage() > 1;

  const {loading, error, data} =
    useQuery<Data>(FEED_QUERY, {variables: {...getQueryVariables()}});

  const linksToRender = data && data.feed ? getLinksToRender(data) : [];

  if (loading) {
    return <div>Fetching</div>;
  }
  if (error) {
    return <div>Error</div>;
  }

  return (
    <Fragment>
      {linksToRender.map((link, index) => (
        <Link
          key={link.id}
          link={link}
          index={index + getPageIndex()}
          onUpdate={updateCacheAfterVote}
        />)
      )}
      {isNewPage() && (
        <div className="flex ml4 mv3 gray">
          {showPrev() && (
            <div className="pointer mr2" onClick={handlePreviousPage}>
              Previous
            </div>
          )}
          {showNext(data) && (
            <div className="pointer" onClick={handleNextPage}>
              Next
            </div>
          )}
        </div>
      )}
    </Fragment>
  );
};

export default LinkList;

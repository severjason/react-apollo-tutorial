import React, { lazy } from 'react';
import { RouteComponentProps } from '@reach/router';

import { Layouts } from '../app/shared';

const LinkListComponent = lazy(() => import('../app/links/LinkList'));

const LinksPage: React.FC<RouteComponentProps> = (props) => (
    <Layouts.Base>
      <LinkListComponent {...props}/>
    </Layouts.Base>
  );

export default LinksPage;

import React, { Suspense } from 'react';
import { Router, Redirect } from '@reach/router';

import { Errors } from '../app/shared';
import { LinksPage, NotFoundPage, CreateLinkPage, LoginPage, SearchPage } from '../pages';

const Routes: React.FC = () => {
  return (
    <Errors.Boundary>
      <Suspense fallback={<div>Loading...</div>}>
        <Router>
          <Redirect noThrow={true} from="/" to="/new/1"/>
          <Redirect noThrow={true} from="/new" to="/new/1"/>
          <LinksPage path="/top"/>
          <LinksPage path="/new/:page"/>
          <CreateLinkPage path="/create"/>
          <LoginPage path="/login"/>
          <SearchPage path="/search"/>
          <NotFoundPage default={true}/>
        </Router>
      </Suspense>
    </Errors.Boundary>
  );
};

export default Routes;

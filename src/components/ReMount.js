import React from 'react';
import PT from 'prop-types';
import { withRouter } from 'react-router';
import { propOr, pathOr } from 'ramda';
import { parseQueryString } from '../utils/stringUtils'

//
// forces a ReMount of a component
// expects query param `to=path-to-reroute-to'
//

//******************************************************************************
// Component
//******************************************************************************

class ReMount extends React.Component {

  static contextTypes = {
    router: PT.object.isRequired
  };

  componentDidMount() {
    const params = parseQueryString(pathOr({}, [ 'location', 'search' ], this.props))
    const to = propOr('', 'to', params);
    to && this.props.history.push(to);
  }

  render = () => <div></div>;
}

export default withRouter(ReMount);

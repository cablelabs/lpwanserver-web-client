import React, {Component} from "react";
import PropTypes from 'prop-types';
import sessionStore from "../../stores/SessionStore";
import applicationStore from "../../stores/ApplicationStore";
import ApplicationForm from "../../components/ApplicationForm";
import BreadCrumbs from '../../components/BreadCrumbs';
import networkTypeStore from "../../stores/NetworkTypeStore";

const breadCrumbs = [
  { to: `/?tab=applications`, text: 'Home' }
];

class ApplicationLayout extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      application: {},
      supportsIp: false,
      isAdmin: sessionStore.isAdmin(),
    };
  }

  sessionChange() {
    this.setState({ isAdmin: (sessionStore.isAdmin()) });
  }

  async componentDidMount() {
    const [ application, applicationNtls ] = await Promise.all([
      applicationStore.getApplication(this.props.match.params.applicationID),
      applicationStore.getAllApplicationNetworkTypes(this.props.match.params.applicationID)
    ])
    const ntIds = applicationNtls.map(x => x.networkTypeId)
    const networkTypes = await Promise.all(ntIds.map(x => networkTypeStore.getNetworkType(x)))

    this.setState({
      application,
      supportsIp: networkTypes.some(x => x.name === 'IP')
    })

    this.sessionChange();

    sessionStore.on("change", this.sessionChange );
  }

  componentWillUnmount() {
    sessionStore.removeListener("change", this.sessionChange );
  }

  render() {
    let { page = 1 } = this.props.history.location.state || {}
    return (
      <div>
        <BreadCrumbs trail={breadCrumbs} destination={this.state.application.name} />
        <div className="panel-body">
          <ApplicationForm
            application={this.state.application}
            supportsIp={this.state.supportsIp}
            update={true}
            page={page}
          />
        </div>
      </div>
    );
  }
}

export default ApplicationLayout;

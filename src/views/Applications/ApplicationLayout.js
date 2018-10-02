import React, {Component} from "react";
import PropTypes from 'prop-types';
import sessionStore from "../../stores/SessionStore";
import applicationStore from "../../stores/ApplicationStore";
import ApplicationForm from "../../components/ApplicationForm";
import BreadCrumbs from '../../components/BreadCrumbs';

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
      isAdmin: sessionStore.isAdmin(),
    };

    this.onDelete = this.onDelete.bind(this);

  }

  sessionChange() {
    this.setState({
      isAdmin: (sessionStore.isAdmin())
    });
  }

  componentDidMount() {
    applicationStore.getApplication( this.props.match.params.applicationID )
    .then( (application) => {
        this.setState({application: application});
    });

    this.sessionChange();

    sessionStore.on("change", this.sessionChange );
  }

  componentWillUnmount() {
       sessionStore.removeListener("change", this.sessionChange );
  }

  onDelete() {

  }

  render() {

    let page = 1;
    if (this.props.history.location.state !== undefined)
      page = this.props.history.location.state.page;
    return (
      <div>
        <BreadCrumbs trail={breadCrumbs} destination={this.state.application.name} />
        <div className="panel-body">
          <ApplicationForm application={this.state.application} onSubmit={this.onSubmit} update={true} page={page}/>
        </div>
      </div>
    );
  }
}

export default ApplicationLayout;

import React, {Component} from "react";
import PropTypes from 'prop-types';
import sessionStore from "../../stores/SessionStore";
import deviceStore from "../../stores/DeviceStore";
import applicationStore from "../../stores/ApplicationStore";
import DeviceForm from "../../components/DeviceForm";
import BreadCrumbs from '../../components/BreadCrumbs';

class DeviceLayout extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor() {
    super();

    this.state = {
      application: {},
      device: {},
      isAdmin: sessionStore.isAdmin(),
      loading: true
    };

    this.onDelete = this.onDelete.bind(this);
    this.sessionChange = this.sessionChange.bind(this)

  }

  sessionChange() {
     this.setState({
       isAdmin: (sessionStore.isAdmin())
     });
   }

  componentDidMount() {
    const { params } = this.props.match
    Promise.all([
      applicationStore.getApplication(params.applicationID),
      deviceStore.getDevice(params.deviceID)
    ])
    .then(([application, device]) => {
      this.setState({ application, device, loading: false })
    })

    sessionStore.on("change", this.sessionChange );
  }

  componentWillUnmount() {
       sessionStore.removeListener("change", this.sessionChange );
  }

  onDelete() {
  }

  render() {
    const { state, props } = this
    if (state.loading) return false
    let page = 1;
    if (props.history.location.state !== undefined)
      page = props.history.location.state.page;
    const breadCrumbs = [
      { to: `/?tab=applications`, text: 'Home' },
      { to: `/applications/${state.application.id}`, text: state.application.name }
    ];

    return (
      <div>
        <BreadCrumbs trail={breadCrumbs} destination={state.device.name} />
        <div className="panel-body">
          <DeviceForm device={this.state.device} onSubmit={this.onSubmit} update={true} page={page}/>
        </div>
      </div>
    );
  }
}

export default DeviceLayout;

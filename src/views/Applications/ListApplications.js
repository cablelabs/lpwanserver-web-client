import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import Pagination from "../../components/Pagination";
import applicationStore from "../../stores/ApplicationStore";
import reportingProtocolStore from "../../stores/ReportingProtocolStore";
import sessionStore from "../../stores/SessionStore";
import userStore from "../../stores/UserStore";
import deviceStore from "../../stores/DeviceStore";
import { parse as qs_parse } from 'qs'

function ApplicationRow (props) {
  const { application: app } = props
  return (
    <tr data-is="application" data-name={app.name}>
      <td><Link to={`/applications/${app.id}`}>{app.name}</Link></td>
      <td>{props.reportingProtocolsMap[app.reportingProtocolId]}</td>
      <td>{app.baseUrl}</td>
      <td>{app.running.toString()}</td>
      <td>
          <div className="btn-group pull-right">
              <button type="button"
                      className="btn btn-default btn-sm"
                      onClick={props.toggleRunning}>
                  { app.running ? "Stop" : "Start" }
              </button>
          </div>
      </td>
    </tr>
  )
}

function UserRow ({ user }) {
  return (
    <tr>
      <td><Link to={`/users/${user.id}`}>{user.username}</Link></td>
      <td>{user.email || 'Unlisted'}</td>
      <td>{user.emailVerified ? 'True' : 'False'}</td>
      <td>{user.role}</td>
    </tr>
  )
}

function DeviceProfileRow ({ deviceProfile: dp }) {
  return (
    <tr data-is="device-profile" data-name={dp.name}>
      <td><Link to={`/deviceProfile/${dp.id}`}>{dp.name}</Link></td>
    </tr>
  )
}

class ListApplications extends Component {
  constructor(props) {
      super(props);
      var isGlobalAdmin = sessionStore.isGlobalAdmin();
      var isAdmin = sessionStore.isAdmin();

      this.state = {
          pageSize: 20,
          activeTab: "applications",
          reportingProtocolsMap: {},
          applications: [],
          users: [],
          deviceProfiles: [],
          organization: {},
          isGlobalAdmin: isGlobalAdmin,
          isAdmin: isAdmin,
          appPageNumber: 1,
          appPages: 1,
          userPageNumber: 1,
          userPages: 1,
          dpPageNumber: 1,
          dpPages: 1,
          filterList: undefined,
          reloadCount: 0,
      };

      this.changeTab = this.changeTab.bind(this);
      this.sessionWatch = this.sessionWatch.bind(this);
 }

  changeTab(e) {
    e.preventDefault();
    this.setState({
      activeTab: e.target.getAttribute('aria-controls'),
    });
  }

  sessionWatch() {
    this.setState({
      isGlobalAdmin: sessionStore.isGlobalAdmin(),
    });
  }

  componentWillReceiveProps(nextProps) {
    this.updatePage(nextProps);
  }

  updatePage(props) {
      this.sessionWatch();
  }

  componentDidMount = async function() {
      let { history, location: { search } } = this.props

      // Check for a user, and redirect to login if none is set.
      let user = sessionStore.getUser();
      if ( !user || !user.id || ( user.id === 0 ) ) {
          history.push("/login");
          return;
      }

      // check for active tab setting in location search
      if (search[0] === '?') search = search.slice(1)
      const query = qs_parse(search)
      if (query.tab) {
        this.setState({ activeTab: query.tab }, () => history.replace('/'))
      }

      sessionStore.on("change", this.sessionWatch );

      try {
          let reportingProtocols = await reportingProtocolStore.getReportingProtocols();
          let reportingProtocolsMap = {};
          for (let i = 0; i < reportingProtocols.length; ++i) {
              reportingProtocolsMap[reportingProtocols[i].id] = reportingProtocols[i].name;
          }
          this.setState({reportingProtocolsMap: reportingProtocolsMap});
      }
      catch( err ) {
          console.log( "Error getting reporting protocols: " + err );
      }

      this.reloadBasedOnFilter( );
  }

  reloadBasedOnFilter = async function( ) {
    const { state } = this
    try {
        let apps = await applicationStore.getAll(
            state.pageSize,
            (state.appPage - 1) * state.pageSize
        )
        this.setState({
            applications: apps.records,
            appPages: Math.ceil(apps.totalCount / state.pageSize),
        });
    }
    catch( err ) {
         console.log( "Error getting applications: " + err );
    }
    window.scrollTo(0, 0);

    try {
        if ( state.isAdmin ) {
            let userret = await userStore.getAll(
                state.pageSize,
                (state.userPage - 1) * state.pageSize
            )
            let users = userret.records;
            this.setState({
                users: users,
                userPages: Math.ceil( userret.totalCount / state.pageSize),
            });
            window.scrollTo(0, 0);
        }
    }
    catch( err ) {
         console.log( "Error getting users: " + err );
    }

    try {
        let devsret = await deviceStore.getAllDeviceProfiles(
            state.pageSize,
            (state.dpPage - 1) * state.pageSize
        )
        let deviceProfiles = devsret.records;
        this.setState({
            deviceProfiles: deviceProfiles,
            dpPages: Math.ceil( devsret.totalCount / state.pageSize),
        });
        window.scrollTo(0, 0);
    }
    catch( err ) {
         console.log( "Error getting deviceProfiles: " + err );
    }
  }

  componentWillUnmount() {
      sessionStore.removeListener("change", this.sessionWatch );
  }

  toggleRunning(app, i) {
    if (app.running) {
      applicationStore.stopApplication(app.id)
    }
    else {
      applicationStore.startApplication(app.id)
    }
    let apps = this.state.applications
    apps[i].running = !apps[i].running
    this.setState( { applications: apps } )
  }

  render() {
    const ApplicationRows = this.state.applications.map((application, i) =>
        <ApplicationRow key={application.id}
                        toggleRunning={() => this.toggleRunning(application, i)}
                        application={application}
                        isGlobalAdmin={this.state.isGlobalAdmin}
                        reportingProtocolsMap={this.state.reportingProtocolsMap}
                        />);
    const UserRows = this.state.users.map((user, i) =>
        <UserRow key={user.id}
                 user={user}
                 isGlobalAdmin={this.state.isGlobalAdmin} />);
    const DeviceProfileRows = this.state.deviceProfiles.map((dp, i) =>
        <DeviceProfileRow key={dp.id}
                          deviceProfile={dp}
                          isGlobalAdmin={this.state.isGlobalAdmin} /> );

    return (
      <div>
        <ol className="breadcrumb">
          <li><Link to={`/`}>Home</Link></li>
        </ol>


        <div className="panel panel-default">

          <div className={`panel-heading clearfix `}>

            <div className={`btn-group pull-right ${this.state.activeTab === "applications" ? '' : 'hidden'}`}>
              <Link to={`/create/application`}>
                <button type="button" className="btn btn-default btn-sm">Create Application</button>
              </Link>
            </div>

            <div className={`btn-group pull-right ${this.state.activeTab === "users" ? '' : 'hidden'}`}>
              <Link to={`/create/user`}>
                <button type="button" className="btn btn-default btn-sm">Create User</button>
              </Link>
            </div>

            <div className={`btn-group pull-right ${this.state.activeTab === "deviceProfiles" ? '' : 'hidden'}`}>
              <Link to={`/create/deviceProfile`}>
                <button type="button" className="btn btn-default btn-sm">Create Device Profile</button>
              </Link>
            </div>

            <ul className="nav nav-tabs">
              <li role="presentation" className={(this.state.activeTab === "applications" ? 'active' : '')}><a
                onClick={this.changeTab} href="#applications" aria-controls="applications">Applications</a></li>
              <li role="presentation" className={(this.state.activeTab === "users" ? 'active' : '') + ((sessionStore.isAdmin()) ? '' : ' hidden' ) }><a
                onClick={this.changeTab} href="#users" aria-controls="users">Users</a></li>
              <li role="presentation" className={(this.state.activeTab === "deviceProfiles" ? 'active' : '')}><a
                onClick={this.changeTab} href="#deviceProfiles" aria-controls="deviceProfiles">Device Profiles</a></li>
            </ul>
          </div>

          <div className={`panel-body clearfix ${this.state.activeTab === "applications" ? '' : 'hidden'}`}>
            <table className="table table-hover" data-is="application-list">
              <thead>
              <tr>
                <th className="col-md-3">Name</th>
                <th className="col-md-3">Reporting Protocol</th>
                <th className="col-md-3">To URL</th>
                <th className="col-md-1">Running?</th>
                <th className="col-md-1">Start/Stop</th>
              </tr>
              </thead>
              <tbody>
              {ApplicationRows}
              </tbody>
            </table>
            <Pagination pages={this.state.appPages}
                        currentPage={this.state.appPageNumber}
                        pathname={`/applications`}/>
          </div>

          <div className={`panel-body clearfix ${this.state.activeTab === "users" ? '' : 'hidden'}`}>
            <table className="table table-hover">
              <thead>
              <tr>
                <th className="col-md-3">User Name</th>
                <th className="col-md-3">Email</th>
                <th className="col-md-2">Verified Email</th>
                <th className="col-md-1">Role</th>
              </tr>
              </thead>
              <tbody>
              {UserRows}
              </tbody>
            </table>
            <Pagination pages={this.state.userPages}
                        currentPage={this.state.userPageNumber}
                        pathname={`/applications`}/>
          </div>

          <div className={`panel-body clearfix ${this.state.activeTab === "deviceProfiles" ? '' : 'hidden'}`}>
            <table className="table table-hover">
              <thead>
              <tr>
                <th className="col-md-6">Device Profile Name</th>
              </tr>
              </thead>
              <tbody>
              {DeviceProfileRows}
              </tbody>
            </table>
            <Pagination pages={this.state.dpPages}
                        currentPage={this.state.dpPageNumber}
                        pathname={`/applications`}/>
          </div>

        </div>
      </div>
    );
  }
}

//
export default ListApplications;

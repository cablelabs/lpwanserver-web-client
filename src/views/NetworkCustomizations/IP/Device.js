import React, {Component} from 'react';
import deviceStore from "../../../stores/DeviceStore";
import { assocPath, find, equals, mergeDeepRight, pathOr } from 'ramda'

// The LoRa device network settings data entry.
//
// Note that the naming of the component is always:
//    {NetworkType.name}DeviceNetworkSettings
class IpDeviceNetworkSettings extends Component {
    constructor( props ) {
        super( props );

        // initial state
        let initValue = {
            devEUI: ''
        };
        this.state = {
            enabled: false,
            wasEnabled: false,
            deviceProfileId: '',
            deviceProfileIdOrig: '',
            value: initValue,
            original: initValue,
            rec: null,
            deviceProfileList: [],
            loading: true
        };

        this.select = this.select.bind(this);
        this.deselect = this.deselect.bind(this);
        this.onSubmit = this.onSubmit.bind( this );
        this.isChanged = this.isChanged.bind( this );
        this.isEnabled = this.isEnabled.bind( this );
    }

    deviceProfile () {
        return find(x => x.id === this.state.deviceProfileId, this.state.deviceProfileList)
    }

    async getDeviceProfiles(appId, netId) {
        try {
            const { records } = await deviceStore.getAllDeviceProfilesForAppAndNetType(appId, netId)
            if (!records.length) throw new Error('No records')
            return records
        } catch (err) {
            console.log( "Error getting device's possible deviceProfiles: " + err );
            return [{ id: 0, name: "(None Available)", networkSettings: {} }]
        }
    }

    async componentDidMount() {
        const { props, state } = this
        const deviceProfileList = await this.getDeviceProfiles(props.referenceDataId, props.netRec.id)
        let { rec, ...rest } = await this.getLinkRecordState(props, deviceProfileList);
        this.setState(
            {
              ...rest,
              rec,
              value: rest.value || state.value,
              deviceProfileList,
              loading: false
            },
            props.onChange
        )
    }

    async getLinkRecordState(props, deviceProfileList) {
        const deviceProfileId = pathOr('', [0, 'id'], deviceProfileList)
        // Skip trying to load new records
        if (!props.parentRec || (!props.parentRec.id || 0 === props.parentRec.id)) {
            // alert(JSON.stringify(props.parentRec))
            return { deviceProfileId }
        }
        try {
            const rec = await deviceStore.getDeviceNetworkTypeLink(props.parentRec.id, props.netRec.id)
            if (!rec) throw new Error('No device network type')
            // Javascript libraries can get whiny with null.
            if ( !rec.networkSettings ) rec.networkSettings = {};
            // We are saying we're enabled based on the database returned
            // data.  Let the parent know that they shoud rerender so show
            // that we are not enabled.  We do this from the setState
            // callback to ensure our state is, in fact, properly set.
            return {
                rec,
                value: rec.networkSettings,
                original: rec.networkSettings,
                enabled: true,
                wasEnabled: true,
                deviceProfileId: rec.deviceProfileId || deviceProfileId,
                deviceProfileIdOrig: rec.deviceProfileId
            }
        } catch (err) {
            console.log( "Failed to get deviceNetworkTypeLink:" + err );
            return { deviceProfileId }
        }
    }

    deselect() {
        let me = this;
        return new Promise( function( resolve, reject ) {
            me.setState( { enabled: false }, () => resolve() );
        });
    }

    select() {
        let me = this;
        return new Promise( function( resolve, reject ) {
            me.setState( { enabled: true }, () => resolve() );
        });
    }

    onSelectionChange(field, e) {
        this.setState({ [field]: e.target.value })
    }

    onNwkSettingChange (field, e) {
        this.setState({ value: { ...this.state.value, [field]: e.target.value } })
    }

    // Not an onSubmit for the framework, but called from the parent component
    // when the submit happens.  Do what needs to be done for this networkType.
    onSubmit = async function () {
        const { props, state } = this
        try {
            // Not enabled and record exists
            if (!state.enabled && state.rec) {
                await deviceStore.deleteDeviceNetworkType(state.rec.id)
                return props.netRec.name + " device deleted."
            }
            // Not Enabled and no record exists
            if (!state.enabled) return props.netRec.name + " is unchanged."
            // Enabled and no record exists
            const networkSettings = state.value
            if (!state.rec) {
                await deviceStore.createDeviceNetworkType(
                    props.parentRec.id,
                    props.netRec.id,
                    state.deviceProfileId,
                    networkSettings
                )
                return props.netRec.name + " device created."
            // Enabled and record exists
            } else if (!equals(state.value, state.original)) {
                var updRec = {
                    id: state.rec.id,
                    networkSettings,
                    deviceProfileId: state.deviceProfileId,
                }
                await deviceStore.updateDeviceNetworkType(updRec)
                return props.netRec.name + " device updated."
            }
        } catch (err) {
            return props.netRec.name + " error: " + err
        }
    }

    isChanged() {
        const { state } = this
        return (state.enabled !== state.wasEnabled) ||
            (!equals(state.value, state.original)) ||
            (state.deviceProfileId !== state.deviceProfileIdOrig)
    }

    isEnabled() {
        return this.state.enabled;
    }

    getRandom( field, size, e ) {
       e.preventDefault();
       let rnd = '';
       const chars = '0123456789abcdef';
       for( let i = 0; i < size; ++i ) {
           rnd += chars.charAt( Math.floor( Math.random() * chars.length ) );
       }
       this.setState({ value: assocPath(field.split('.'), rnd, this.state.value) })
    }

    render() {
        const { state } = this
        const deviceProfile = this.deviceProfile() || {}

        if (this.state.loading) return false

        return !!state.enabled && (
            <div>
                <div className="form-group">
                  <label className="control-label" htmlFor="deviceProfileId">Device Profile</label>
                  <select className="form-control"
                          id="deviceProfileId"
                          required
                          value={state.deviceProfileId}
                          onChange={this.onSelectionChange.bind(this, 'deviceProfileId')}>
                    {state.deviceProfileList.map(x => <option value={x.id} key={"typeSelector" + x.id }>{x.name}</option>)}
                  </select>
                  <p className="help-block">
                    Specifies the Device Profile that defines the communications settings this device will use.
                  </p>
                </div>
                <div className="form-group">
                    <label className="control-label" htmlFor="devEUI">
                        The Device EUI identifying the device
                    </label>
                    <input type="text"
                           className="form-control"
                           name="devEUI"
                           value={state.value.devEUI}
                           placeholder="0000000000000000"
                           pattern="[0-9a-fA-F]{16}"
                           onChange={this.onNwkSettingChange.bind( this, 'devEUI' )} />
                    <p className="help-block">
                        A 16-hex-digit string used to identify the device.
                    </p>
                </div>
            </div>
        );
      }
}

export default IpDeviceNetworkSettings;

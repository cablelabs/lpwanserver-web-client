import React, {Component} from 'react';
import deviceStore from "../../../stores/DeviceStore";
import { assocPath, find, equals, mergeDeepRight, pathOr } from 'ramda'

// The LoRa device network settings data entry.
//
// Note that the naming of the component is always:
//    {NetworkType.name}DeviceNetworkSettings
class LoRaDeviceNetworkSettings extends Component {
    constructor( props ) {
        super( props );
        let initValue = {
            devEUI: '',
            appKey: '',
            skipFCntCheck: false,
            deviceActivation: {
                devAddr: '',
                fCntUp: 0,
                aFCntDown: 0
            }
        };
        this.state = {
            enabled: false,
            wasEnabled: false,
            deviceProfileId: 0,
            deviceProfileIdOrig: 0,
            value: initValue,
            original: initValue,
            rec: null,
            deviceProfileList: [],
        };

        this.select = this.select.bind(this);
        this.deselect = this.deselect.bind(this);
        this.onActivationChange = this.onActivationChange.bind(this);
        this.onSubmit = this.onSubmit.bind( this );
        this.isChanged = this.isChanged.bind( this );
        this.isEnabled = this.isEnabled.bind( this );
    }

    deviceProfile () {
        return find(x => x.id === this.state.deviceProfileId, this.state.deviceProfileList)
    }

    async getDeviceProfiles( appId, netId ) {
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
        const { props } = this
        const deviceProfileList = await this.getDeviceProfiles(props.referenceDataId, props.netRec.id)
        const linkRecord = await this.getMyLinkRecord(props, deviceProfileList);
        this.setState({ ...linkRecord, deviceProfileList }, props.onChange)
    }

    async getMyLinkRecord(props, deviceProfileList) {
        const defaultDeviceProfileId = pathOr(0, [0, 'id'], deviceProfileList)
        // Skip trying to load new records
        if ( !props.parentRec ||
             ( !props.parentRec.id || 0 === props.parentRec.id ) ) {
            return { enabled: false, deviceProfileId: defaultDeviceProfileId }
        }
        try {
            const rec = await deviceStore.getDeviceNetworkType(props.parentRec.id, props.netRec.id)
            if (!rec) throw new Error('No device network type')
            // Javascript libraries can get whiny with null.
            if ( !rec.networkSettings ) rec.networkSettings = {};
            // We are saying we're enabled based on the database returned
            // data.  Let the parent know that they shoud rerender so show
            // that we are not enabled.  We do this from the setState
            // callback to ensure our state is, in fact, properly set.
            const deviceProfile = find(x => x.id === rec.deviceProfileId, deviceProfileList)
            const deviceActivation = this.getDeviceActivation(deviceProfile, rec.networkSettings.deviceActivation, true)
            const value = mergeDeepRight(rec.networkSettings, { deviceActivation })
            const deviceProfileId = deviceProfile ? deviceProfile.id : defaultDeviceProfileId
            return {
                rec,
                value,
                original: value,
                enabled: true,
                wasEnabled: true,
                deviceProfileId,
                deviceProfileIdOrig: rec.deviceProfileId
            }
        } catch (err) {
            console.log( "Failed to get deviceNetworkTypeLink:" + err );
            return { enabled: false, wasEnabled: false }
        }
    }

    getDeviceActivation (deviceProfile, data = {}, toClientSchema) {
        const { supportsJoin, macVersion: mac } = deviceProfile.networkSettings
        const result = {}
        if (supportsJoin && mac >= '1.1.0' && mac < '1.2.0') {
            result.nwkKey = data.nwkKey
        } else if (!supportsJoin && mac >= '1.0.0' && mac <= '1.02.0') {
            result.appSKey = data.appSKey
            if (toClientSchema) {
                result.nwkSKey = data.sNwkSIntKey
            } else {
                result.nwkSEncKey = data.nwkSKey
                result.sNwkSIntKey = data.nwkSKey
                result.fNwkSIntKey = data.nwkSKey
            }
        } else if (!supportsJoin && mac >= '1.1.0' && mac < '1.2.0') {
            result.appSKey = data.appSKey
            result.nwkSEncKey = data.nwkSEncKey
            result.sNwkSIntKey = data.sNwkSIntKey
            result.fNwkSIntKey = data.fNwkSIntKey
        }
        return result
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

    getEventValue ({ target }) {
        switch (target.type) {
            case 'number': return parseInt(target.value, 10)
            case 'checkbox': return target.checked
            default: return target.value
        }
    }

    onActivationChange( field, e ) {
        e.preventDefault();
        this.setState({
            value: assocPath(field.split('.'), this.getEventValue(e), this.state.value)
        })
    }

    onSelectionChange(field, e) {
        this.setState({ [field]: parseInt(e.target.value, 10) })
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
            const networkSettings = {
                ...state.value,
                deviceActivation: {
                    ...state.value.deviceActivation,
                    ...this.getDeviceActivation(this.deviceProfile(), state.value.deviceActivation, false)
                }
            }
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
        if ( null == state.deviceProfileList ) {
            return ( <div></div> );
        }
        const deviceProfile = this.deviceProfile() || {}
        let { supportsJoin, macVersion: mac } = deviceProfile.networkSettings || {}
        const isABP = !supportsJoin
        mac = mac || '0.0.0'
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
                        The Device EUI identifying the device on a LoRa network
                    </label>
                    <input type="text"
                           className="form-control"
                           name="devEUI"
                           value={state.value.devEUI}
                           placeholder="0000000000000000"
                           pattern="[0-9a-fA-F]{16}"
                           onChange={this.onActivationChange.bind( this, 'devEUI' )} />
                    <p className="help-block">
                        A 16-hex-digit string used to identify the device
                        on LoRa networks.
                    </p>
                </div>
                {isABP &&
                <div>
                    <div className="form-group">
                        <label className="control-label"
                               htmlFor="devAddr">Device Address</label>
                        &emsp;
                        <button onClick={this.getRandom.bind(this, 'deviceActivation.devAddr', 8 )} className="btn btn-xs">generate</button>
                        <input className="form-control"
                               id="devAddr"
                               type="text"
                               placeholder="00000000"
                               pattern="[a-fA-F0-9]{8}"
                               required={isABP}
                               value={state.value.deviceActivation.devAddr || ''}
                               onChange={this.onActivationChange.bind(this, 'deviceActivation.devAddr')} />
                    </div>
                    { mac >= '1.0.0' && mac <= '1.02.0' &&
                    <div className="form-group">
                        <label className="control-label" htmlFor="nwkSKey">
                        Network session key
                        </label>
                        &emsp;
                        <button onClick={this.getRandom.bind(this, 'deviceActivation.nwkSKey', 32 )} className="btn btn-xs">generate</button>
                        <input className="form-control"
                            id="nwkSKey"
                            type="text"
                            placeholder="00000000000000000000000000000000"
                            pattern="[A-Fa-f0-9]{32}"
                            required={isABP}
                            value={state.value.deviceActivation.nwkSKey || ''}
                            onChange={this.onActivationChange.bind(this, 'deviceActivation.nwkSKey')} />
                    </div>
                    }
                    { mac >= '1.1.0' && mac <= '1.2.0' && 
                    <div>
                        <div className="form-group">
                            <label className="control-label" htmlFor="nwkSEncKey">
                            Network session encryption key
                            </label>
                            &emsp;
                            <button onClick={this.getRandom.bind(this, 'deviceActivation.nwkSEncKey', 32 )} className="btn btn-xs">generate</button>
                            <input className="form-control"
                                id="nwkSEncKey"
                                type="text"
                                placeholder="00000000000000000000000000000000"
                                pattern="[A-Fa-f0-9]{32}"
                                required={isABP}
                                value={state.value.deviceActivation.nwkSEncKey || ''}
                                onChange={this.onActivationChange.bind(this, 'deviceActivation.nwkSEncKey')} />
                        </div>
                        <div className="form-group">
                            <label className="control-label" htmlFor="sNwkSIntKey">
                                Service network session integrity key
                            </label>
                            &emsp;
                            <button onClick={this.getRandom.bind(this, 'deviceActivation.sNwkSIntKey', 32 )} className="btn btn-xs">generate</button>
                            <input className="form-control"
                                    id="sNwkSIntKey"
                                    type="text"
                                    placeholder="00000000000000000000000000000000"
                                    pattern="[A-Fa-f0-9]{32}"
                                    required={isABP}
                                    value={state.value.deviceActivation.sNwkSIntKey || ''}
                                    onChange={this.onActivationChange.bind(this, 'deviceActivation.sNwkSIntKey')} />
                        </div>
                        <div className="form-group">
                            <label className="control-label" htmlFor="fNwkSIntKey">
                                Forwarding network session integrity key
                            </label>
                            &emsp;
                            <button onClick={this.getRandom.bind(this, 'deviceActivation.fNwkSIntKey', 32 )} className="btn btn-xs">generate</button>
                            <input className="form-control"
                                id="fNwkSIntKey"
                                type="text"
                                placeholder="00000000000000000000000000000000"
                                pattern="[A-Fa-f0-9]{32}"
                                required={isABP}
                                value={state.value.deviceActivation.fNwkSIntKey || ''}
                                onChange={this.onActivationChange.bind(this, 'deviceActivation.fNwkSIntKey')} />
                        </div>
                    </div>
                    }
                    <div className="form-group">
                        <label className="control-label"
                               htmlFor="appSKey">Application session key</label>
                        &emsp;
                        <button onClick={this.getRandom.bind(this, 'deviceActivation.appSKey', 32 )} className="btn btn-xs">generate</button>
                        <input className="form-control"
                               id="appSKey"
                               type="text" placeholder="00000000000000000000000000000000"
                               pattern="[A-Fa-f0-9]{32}"
                               required={isABP}
                               value={state.value.deviceActivation.appSKey || ''} 
                               onChange={this.onActivationChange.bind(this, 'deviceActivation.appSKey')} />
                    </div>
                    <div className="form-group">
                        <label className="control-label"
                               htmlFor="rx2DR">Uplink frame-counter</label>
                        <input className="form-control"
                               id="fCntUp"
                               type="number"
                               min="0"
                               required={isABP}
                               value={state.value.deviceActivation.fCntUp || 0}
                               onChange={this.onActivationChange.bind(this, 'deviceActivation.fCntUp')} />
                    </div>
                    <div className="form-group">
                        <label className="control-label"
                               htmlFor="rx2DR">Downlink frame-counter</label>
                        <input className="form-control"
                               id="aFCntDown"
                               type="number"
                               min="0"
                               required={isABP}
                               value={state.value.deviceActivation.aFCntDown || 0}
                               onChange={this.onActivationChange.bind(this, 'deviceActivation.aFCntDown')}
                             />
                    </div>
                    <div className="form-group">
                        <label className="control-label"
                               htmlFor="skipFCntCheck">
                            Disable frame-counter validation
                        </label>
                        <div className="checkbox">
                            <label>
                                <input type="checkbox"
                                       name="skipFCntCheck"
                                       id="skipFCntCheck"
                                       checked={!!state.value.skipFCntCheck}
                                       onChange={this.onActivationChange.bind(this, 'skipFCntCheck')}
                                     />
                                     Disable frame-counter validation
                            </label>
                        </div>
                        <p className="help-block">
                            Note that disabling the frame-counter validation
                            will compromise security as it enables people to
                            perform replay-attacks.
                        </p>
                    </div>
                </div>
                }
                {!isABP &&
                <div>
                    <div className="form-group">
                        <label className="control-label" htmlFor="appKey">
                            The Application Encryption Key for this device.
                        </label>
                        &emsp;
                        <button onClick={this.getRandom.bind(this, 'appKey', 32 )} className="btn btn-xs">generate</button>
                        <input type="text"
                               className="form-control"
                               name="appKey" placeholder="00000000000000000000000000000000"
                               value={state.value.appKey || ''}
                               pattern="[0-9a-fA-F]{32}"
                               onChange={this.onActivationChange.bind( this, 'appKey')} />
                        <p className="help-block">
                            A 32-hex-digit string used to identify the device
                            on LoRa networks.
                        </p>
                    </div>
                    { mac >= '1.1.0' && mac <= '1.2.0' && 
                    <div className="form-group">
                        <label className="control-label" htmlFor="nwkKey">
                        Network session key
                        </label>
                        &emsp;
                        <button onClick={this.getRandom.bind(this, 'deviceActivation.nwkKey', 32 )} className="btn btn-xs">generate</button>
                        <input className="form-control"
                            id="nwkKey"
                            type="text"
                            placeholder="00000000000000000000000000000000"
                            pattern="[A-Fa-f0-9]{32}"
                            value={state.value.deviceActivation.nwkKey || ''}
                            onChange={this.onActivationChange.bind(this, 'deviceActivation.nwkKey')} />
                    </div>
                    }
                </div>
                }
            </div>
        );
      }
}

export default LoRaDeviceNetworkSettings;

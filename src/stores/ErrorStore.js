import { EventEmitter } from "events";
import dispatcher from "../dispatcher";

/** Class representing a flux store for application errors */
class ErrorStore extends EventEmitter {
  /** Create a store */
  constructor() {
    super();
    this.errors = [];
  }
  /**
   * Get all errors
   * @return {Object[]} list of errors
   */
  getAll() {
    return this.errors;
  }
  /**
   * Remove all errors from state
   */
  clear() {
    this.errors = [];
    this.emit("change");
  }
  /**
   * Create an error
   * @param {Error} error 
   */
  createError(error) {
    const id = Date.now();

    this.errors.push({
      id: id,
      error: error,
    });

    this.emit("change");
  }
  /**
   * Delete an error
   * @param {string} id 
   */
  deleteError(id) {
    let err = null;

    for(var error of this.errors) {
      if(error.id === id) {
        err = error;
      }
    }

    this.errors.splice(this.errors.indexOf(err), 1);
    this.emit("change");
  }
  /**
   * Handle actions from dispatcher
   * @param {Object} param0 action 
   */
  handleActions({ type, error, id }) {
    switch(type) {
      case "CREATE_ERROR": return this.createError(error)
      case "DELETE_ERROR": return this.deleteError(id)
      default: return
    }
  }
}

const errorStore = new ErrorStore();
dispatcher.register(errorStore.handleActions.bind(errorStore));
export default errorStore;

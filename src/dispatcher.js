import { Dispatcher } from "flux";

const dispatcher = new Dispatcher();

export const dispatch = dispatcher.dispatch.bind(dispatcher)

export default dispatcher
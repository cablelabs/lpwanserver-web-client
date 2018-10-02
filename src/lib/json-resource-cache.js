import flyd from 'flyd'
import { find } from 'ramda'

export default class JsonResourceCache {
	constructor ({ idKey = 'id' } = {}) {
		this.idKey = idKey
		this.records = flyd.stream([])
  }
  load (val, prop) {
    if (!prop) prop = this.idKey
		return flyd.map(
			// used == instead of === because many IDs are ints.  change to === when IDs are strings.
			// eslint-disable-next-line
			find(x => x[prop] == val),
      this.records
    )
  }
  list (query, sortFn) {
    const keys = Object.keys(query)
    // eslint-disable-next-line
    const queryFilter = x => !keys.length || keys.every(key => x[key] == query[key])
		return flyd.map(
			xs => {
				const result = xs.filter(queryFilter)
			  if (sortFn) result.sort(sortFn)
				return result
			},
		  this.records
		)
	}
	insert (xs) {
    const { idKey } = this
    if (!Array.isArray(xs)) xs = [xs]
    xs = xs.filter(x => x && x[idKey] != null)
    return [
      // eslint-disable-next-line
      ...this.records().filter(y => !xs.some(x => x[idKey] == y[idKey])),
      ...xs
    ]
	}
	remove (id) {
    // eslint-disable-next-line
		this.records(this.records().filter(x => x[this.idKey] != id))
	}
}
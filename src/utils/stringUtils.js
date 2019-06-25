import { replace } from 'ramda';

export const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
export const removeUnderscores = str => replace(/_/g, ' ', str); // TODO: not working

// query-string module caused build errors, due to inability to be minified
// https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#npm-run-build-fails-to-minify
export function parseQueryString(str) {
  if (str[0] === '?') str = str.slice(1)
  return str.split('&').reduce((params, pair) => {
    const [key, val] = pair.split('=')
    params[decodeURIComponent(key)] = decodeURIComponent(val)
    return params
  }, {})
}

export function plural (word, pluralWord) {
  return n => n === 1 ? word : pluralWord
}

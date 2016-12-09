import postcss from 'postcss'
import postcssJs from 'postcss-js'

import mapKeys from 'lodash/mapKeys'
import flatMap from 'lodash/flatMap'
import toPairs from 'lodash/toPairs'
import flatten from 'lodash/flatten'
import omit from 'lodash/omit'
import defaults from 'lodash/defaults'

const mergeObjects = (objs) => {
  return defaults.apply(this, objs)
}
const appendClassPrefix = (js) => {
  return mapKeys(js, (v, k) => {
    return `.${k}`
  })
}

const getPseudo = (js) => {
  const r = toPairs(js).map( ([parentSelector, style]) => {
    return toPairs(style).map( ([maybePseudo, maybeStyles]) => {
      if(typeof maybeStyles !== "object" ){
        return false
      }
      return [parentSelector, maybePseudo]
    }).filter( (v) => v )
  })
  return flatten(r)
}

const psd = (parent, style, pseudo ) => {
  return {
    [`${parent}${pseudo}`]: style
  }
}

const flattenPseudo = (js) => {
  const pseudos = getPseudo(js)
  const styles = toPairs(js).map( ([parentSelector, style]) => {
    const pseuded = pseudos
      .filter( ([parent, _]) => (parent === parentSelector) )
      .map( ([_, pseudo]) => pseudo )

    if(pseuded.length > 0){
      const pseudoStyles = pseuded
        .map( (p) => psd(parentSelector, style[p], p))
      return [{
        [parentSelector]: omit(style, pseuded)
      }].concat(pseudoStyles)
    }
    return [{ [parentSelector]: style }]
  })
  return mergeObjects(flatten(styles))
}

export default (input) => {
  let json = appendClassPrefix(input)
  json = flattenPseudo(json)
  console.log(json)
  return postcss()
    .process(json, {parser: postcssJs})
}
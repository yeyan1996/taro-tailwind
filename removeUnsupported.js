const postcss = require('postcss')
const blackSelectorList = {
  weapp:['\\\\?:focus-within','\\\\?:hover','\\\\?:focus','>',"\\*"],
  tt:['\\\\?:focus-within','\\\\?:hover','\\\\?:focus'],
}

module.exports = postcss.plugin('tailwind-mini', (options = { platform: 'weapp'}) => {
  function isSupported(selector,blackList) {
    return !blackList.some(item => new RegExp(item).test(selector))
  }

  return root => {
    root.walkRules(rule => {
      if (rule.parent.name === 'media') {
        rule.parent.remove()
      }
      if (!isSupported(rule.selector,blackSelectorList[options.platform])) {
        rule.remove()
      }

      rule.walkDecls(decl => {
        if (decl.prop === 'visibility') {
          switch (decl.value) {
            case 'hidden':
              decl.replaceWith(decl.clone({ value: 'collapse'}))
              return
          }
        }

        if (options.platform === 'weapp' && decl.prop === 'vertical-align') {
          switch (decl.value) {
            case 'middle':
              decl.replaceWith(decl.clone({ value: 'center'}))
              return
          }
        }

        // allow using rem values (default unit in tailwind)
        if (decl.value.includes('rem') && !decl.value.includes('--')) {
          options.debug && console.log('replacing rem value', decl.prop, decl.value, '=>', '' + (parseFloat(decl.value) * 16))
          decl.value = '' + (parseFloat(decl.value) * 16) + 'px'
        }
      })
    })
  }
})


svg_ns = 'http://www.w3.org/2000/svg'
xlink_ns = 'http://www.w3.org/1999/xlink'

$ = (sel, ctx=null) ->
  ctx = ctx or document
  Array.prototype.slice.call(
    ctx.querySelectorAll(sel), 0).filter (e) -> e != ctx

matches = (el, selector) ->
  (el.matches || el.matchesSelector ||
   el.msMatchesSelector || el.mozMatchesSelector ||
    el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector)

sibl = (el, match=null) ->
  Array.prototype.filter.call el.parentElement.children, (child) ->
    child isnt el and (not match or matches(child, match))

Array.prototype.one = ->
  this.length > 0 and this[0] or {}

padding = 5
tooltip_timeout = null
r_translation = /translate\((\d+)[ ,]+(\d+)\)/

get_translation = (el) ->
  (r_translation.exec(el.getAttribute('transform')) or []).slice(
    1).map (x) -> +x

init = (ctx) ->
  if $('svg', ctx).length
    inner_svg = $('svg', ctx).one()
    parent = inner_svg.parentElement
    box = inner_svg.viewBox.baseVal
    bbox = parent.getBBox()

    xconvert = (x) -> ((x - box.x) / box.width) * bbox.width
    yconvert = (y) -> ((y - box.y) / box.height) * bbox.height
  else
    xconvert = yconvert = (x) -> x

  if window.pygal?.config?
    # Check if config is in config
    if window.pygal.config.no_prefix?
      # no_prefix
      config = window.pygal.config
    else
      uid = ctx.id.replace('chart-', '')
      config = window.pygal.config[uid]
  else
    # Compat
    config = window.config

  tooltip_el = null
  graph = $('.graph').one()
  tt = $('.tooltip', ctx).one()

  for el in $('.reactive', ctx)
    el.addEventListener 'mouseenter', do (el) -> ->
      el.classList.add 'active'
    el.addEventListener 'mouseleave', do (el) -> ->
      el.classList.remove 'active'

  for el in $('.activate-serie', ctx)
    num = el.id.replace('activate-serie-', '')

    el.addEventListener 'mouseenter', do (num) -> ->
      for re in $('.serie-' + num + ' .reactive', ctx)
        re.classList.add 'active'

    el.addEventListener 'mouseleave', do (num) -> ->
      for re in $('.serie-' + num + ' .reactive', ctx)
        re.classList.remove 'active'

    el.addEventListener 'click', do (el, num) -> ->
      rect = $('rect', el).one()
      show = rect.style.fill isnt ''
      rect.style.fill = if show then '' else 'transparent'
      for re in $('.serie-' + num + ' .reactive', ctx)
        re.style.display = if show then '' else 'none'
      for ov in $('.text-overlay .serie-' + num, ctx)
        ov.style.display = if show then '' else 'none'

  for el in $('.tooltip-trigger', ctx)
    el.addEventListener 'mouseenter', do (el) -> ->
      tooltip_el = tooltip(el)

  tt.addEventListener 'mouseenter', ->
    tooltip_el?.classList.add 'active'

  tt.addEventListener 'mouseleave', ->
    tooltip_el?.classList.remove 'active'

  ctx.addEventListener 'mouseleave', ->
    if tooltip_timeout
      clearTimeout tooltip_timeout
    untooltip(0)

  graph.addEventListener 'mousemove', (el) ->
    return if tooltip_timeout
    return unless matches el.target, '.background'
    untooltip(1000)

  tooltip = (el) ->
    clearTimeout(tooltip_timeout)
    tooltip_timeout = null

    tt.style.opacity = 1
    tt.style.display = ''

    text_group = $('g.text', tt).one()
    rect = $('rect', tt).one()

    text_group.innerHTML = ''

    label = sibl(el, '.label').one().textContent
    x_label = sibl(el, '.x_label').one().textContent
    value = sibl(el, '.value').one().textContent
    xlink = sibl(el, '.xlink').one().textContent

    serie_index = null
    parent = el
    traversal = []
    while parent
      traversal.push parent

      if parent.classList.contains('series')
        break

      parent = parent.parentElement

    if parent
      for cls in parent.classList
        if cls.indexOf('serie-') is 0
          serie_index = +cls.replace('serie-', '')
          break

    legend = null

    if serie_index isnt null
      legend = config.legends[serie_index]

    # text creation and vertical positionning
    dy = 0
    keys = [
        [label, 'label'],
    ]

    for subval, i in value.split('\n')
      keys.push([subval, 'value-' + i])

    if config.tooltip_fancy_mode
      keys.push [xlink, 'xlink']
      keys.unshift [x_label, 'x_label']
      keys.unshift [legend, 'legend']

    texts = {}
    for [key, name] in keys

      if key
        text = document.createElementNS svg_ns, 'text'
        text.textContent = key
        text.setAttribute 'x', padding
        text.setAttribute 'dy', dy
        text.classList.add if name.indexOf('value') is 0 then 'value' else name

        if name.indexOf('value') is 0 and config.tooltip_fancy_mode
          text.classList.add('color-' + serie_index)

        if name is 'xlink'
          a = document.createElementNS svg_ns, 'a'
          a.setAttributeNS xlink_ns, 'href', key
          a.textContent = undefined
          a.appendChild text
          text.textContent = 'Link >'
          text_group.appendChild a
        else
          text_group.appendChild text


        dy += text.getBBox().height + padding / 2
        baseline = padding
        if text.style.dominantBaseline isnt undefined
          text.style.dominantBaseline = 'text-before-edge'
        else
          baseline += text.getBBox().height * .8
        text.setAttribute 'y', baseline
        texts[name] = text

    # Tooltip sizing
    w = text_group.getBBox().width + 2 * padding
    h = text_group.getBBox().height + 2 * padding
    rect.setAttribute('width', w)
    rect.setAttribute('height', h)

    # Tspan horizontal processing
    if texts.value
      texts.value.setAttribute 'dx',
      (w - texts.value.getBBox().width) / 2 - padding

    if texts.x_label
      texts.x_label.setAttribute 'dx',
       w - texts.x_label.getBBox().width - 2 * padding

    if texts.xlink
      texts.xlink.setAttribute 'dx',
       w - texts.xlink.getBBox().width - 2 * padding

    x_elt = sibl(el, '.x').one()
    y_elt = sibl(el, '.y').one()

    x = parseInt x_elt.textContent
    if x_elt.classList.contains('centered')
      x -= w / 2
    else if x_elt.classList.contains('left')
      x -= w
    else if x_elt.classList.contains('auto')
      x = xconvert(el.getBBox().x + el.getBBox().width / 2) - w / 2

    y = parseInt y_elt.textContent
    if y_elt.classList.contains('centered')
      y -= h / 2
    else if y_elt.classList.contains('top')
      y -= h
    else if y_elt.classList.contains('auto')
      y = yconvert(el.getBBox().y + el.getBBox().height / 2) - h / 2

    [plot_x, plot_y] = get_translation(tt.parentElement)

    # Constraint tooltip in chart
    if x + w + plot_x > config.width
      x = config.width - w - plot_x

    if y + h + plot_y > config.height
      y = config.height - h - plot_y

    if x + plot_x < 0
      x = -plot_x

    if y + plot_y < 0
      y = -plot_y

    [current_x, current_y] = get_translation(tt)
    return el if current_x == x and current_y == y
    tt.setAttribute 'transform', "translate(#{x} #{y})"
    el

  untooltip = (ms) ->
    tooltip_timeout = setTimeout ->
      tt.style.display = 'none'
      tt.style.opacity = 0
      tooltip_el?.classList.remove 'active'
      tooltip_timeout = null
    , ms

init_svg = ->
  charts = $('.pygal-chart')
  if charts.length
    for chart in charts
      init chart

if document.readyState isnt 'loading'
  init_svg()
else
  document.addEventListener 'DOMContentLoaded', -> init_svg()

window.pygal = window.pygal or {}
window.pygal.init = init
window.pygal.init_svg = init_svg

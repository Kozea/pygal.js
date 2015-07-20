svg = 'http://www.w3.org/2000/svg'

$ = (sel, ctx=null) ->
  ctx = ctx or document
  Array.prototype.slice.call ctx.querySelectorAll(sel), 0

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
  tooltip_el = null
  graph = $('.graph').one()
  graph_bbox = graph.getBBox()

  for el in $('.text-overlay .series', ctx)
    el.style.display = 'none'

  for el in $('.reactive', ctx)
    el.addEventListener 'mouseenter', do (el) -> ->
      el.classList.add 'active'
    el.addEventListener 'mouseleave', do (el) -> ->
      el.classList.remove 'active'

  for el in $('.activate-serie', ctx)
    num = el.id.replace('activate-serie-', '')

    el.addEventListener 'mouseenter', do (num) -> ->
      for ov in $('.text-overlay .serie-' + num, ctx)
        ov.style.display = ''
      for re in $('.serie-' + num + ' .reactive', ctx)
        re.classList.add 'active'

    el.addEventListener 'mouseleave', do (num) -> ->
      for ov in $('.text-overlay .serie-' + num, ctx)
        ov.style.display = 'none'
      for re in $('.serie-' + num + ' .reactive', ctx)
        re.classList.remove 'active'

    el.addEventListener 'click', do (el, num) -> ->
      rect = $('rect', el).one()
      rect.style.fill = rect.style.fill is '' and 'transparent' or ''
      for re in $('.serie-' + num + ' .reactive', ctx)
        re.style.display = re.style.display is '' and 'none' or ''

  for el in $('.tooltip-trigger', ctx)
    el.addEventListener 'mouseenter', do (el) -> ->
      tooltip_el = tooltip(el)

  document.addEventListener 'mouseleave', ->
    return unless tooltip_el
    if tooltip_timeout
      clearTimeout tooltip_timeout
    untooltip(tooltip_el, 0)

  graph.addEventListener 'mousemove', (el) ->
    return unless tooltip_el
    return if tooltip_timeout
    return unless matches el.target, '.background'
    untooltip(tooltip_el, 1000)

  tooltip = (el) ->
    clearTimeout(tooltip_timeout)
    tooltip_timeout = null
    document.createElementNS svg, 'tooltip'

    tt = $('.tooltip', ctx).one()
    tt.style.opacity = 1
    tt.style.display = ''

    text = $('g.text', tt).one()
    rect = $('rect', tt).one()

    text.innerHTML = ''

    label = sibl(el, '.label').one().textContent
    value = sibl(el, '.value').one().textContent

    serie_index = null
    parent = el
    traversal = []
    while parent
      parent = parent.parentElement
      traversal.push parent

      if parent.classList.contains('series')
        break
    for cls in parent.classList
      if cls.indexOf('serie-') is 0
        serie_index = +cls.replace('serie-', '')
        break

    value_index = [].indexOf.call(
      traversal[traversal.length - 2].children, traversal[traversal.length - 3])

    x_label = null
    legend = null

    if serie_index isnt null
      legend = config.legends[serie_index]

    if value_index isnt null
      x_label = config.x_labels?[value_index]

    # text creation and vertical positionning
    dy = 0
    keys = [
        [label, 'label'],
        [value, 'value']
    ]
    if config.tooltip_fancy_mode
      keys.unshift [x_label, 'x_label']
      keys.unshift [legend, 'legend']

    tspans = {}
    for [key, name] in keys

      if key
        tspan = document.createElementNS svg, 'text'
        tspan.textContent = key
        tspan.setAttribute 'x', padding
        tspan.setAttribute 'dy', dy
        tspan.classList.add name

        if name is 'value' and config.tooltip_fancy_mode
          tspan.classList.add('color-' + serie_index)

        text.appendChild tspan

        dy += tspan.getBBox().height + padding / 2
        baseline = padding
        if tspan.style.dominantBaseline isnt undefined
          tspan.style.dominantBaseline = 'text-before-edge'
        else
          baseline += tspan.getBBox().height * .8
        tspan.setAttribute 'y', baseline
        tspans[name] = tspan

    # Tooltip sizing
    w = text.getBBox().width + 2 * padding
    h = text.getBBox().height + 2 * padding
    rect.setAttribute('width', w)
    rect.setAttribute('height', h)

    # Tspan horizontal processing
    if tspans.value
      tspans.value.setAttribute 'dx',
      (w - tspans.value.getBBox().width) / 2 - padding

    if tspans.x_label
      tspans.x_label.setAttribute 'dx',
       w - tspans.x_label.getBBox().width - 2 * padding

    x_elt = sibl(el, '.x').one()
    y_elt = sibl(el, '.y').one()

    x = parseInt x_elt.textContent
    if x_elt.classList.contains('centered')
      x -= w / 2
    else if x_elt.classList.contains('left')
      x -= w

    y = parseInt y_elt.textContent
    if y_elt.classList.contains('centered')
      y -= h / 2
    else if y_elt.classList.contains('top')
      y -= h

    [plot_x, plot_y] = get_translation(tt.parentElement)

    # Constraint tooltip in chart
    if x + w + plot_x > graph_bbox.width
      x = graph_bbox.width - w - plot_x

    if y + h + plot_y > graph_bbox.height
      y = graph_bbox.height - h - plot_y

    if x + plot_x < 0
      x = -plot_x

    if y + plot_y < 0
      y = -plot_y

    [current_x, current_y] = get_translation(tt)
    return if current_x == x and current_y == y
    tt.setAttribute 'transform', "translate(#{x} #{y})"
    tt

  untooltip = (el, ms) ->
    tooltip_timeout = setTimeout ->
      el.style.display = 'none'
      el.style.opacity = 0
      tooltip_el = null
      tooltip_timeout = null
    , ms

init_svg = ->
  charts = $('.pygal-chart')
  if charts.length
    for chart in charts
      init chart
  else
    init()


if document.readyState isnt 'loading'
  init_svg()
else
  document.addEventListener 'DOMContentLoaded', -> init_svg()


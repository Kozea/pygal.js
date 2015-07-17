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
tooltip_timeout = 0
r_translation = /translate\((\d+)[ ,]+(\d+)\)/

get_translation = (el) ->
  (r_translation.exec(el.getAttribute('transform')) or []).slice(1)

init = (ctx) ->
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
      tooltip(el)
    # el.addEventListener 'mouseleave', do (el) -> ->
      # untooltip(el)

  tooltip = (el) ->
    clearTimeout(tooltip_timeout)
    tt = $('#tooltip,.tooltip', ctx).one()
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

    # xlink = sibl(el, '.xlink').one().textContent or null
    # target = el.parentElement.getAttribute('target')
    # if xlink
    #   for a in $(tt, 'a')
    #     a.setAttribute 'href', xlink
    #     a.setAttribute 'target', target


    # text.setAttribute('x', padding)
    # text.setAttribute('y', padding + @config.tooltip_font_size)
    # value.setAttribute('x', padding)
    # value.setAttribute('dy',
    #   if label.textContent then @config.tooltip_font_size + padding else 0)

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

    [current_x, current_y] = get_translation(tt)
    return if current_x == x and current_y == y
    tt.setAttribute 'transform', "translate(#{x} #{y})"


  untooltip = ->
    tooltip_timeout = setTimeout ->
      tt = $('#tooltip,.tooltip', ctx).one()
      tt.style.display = 'none'
      tt.style.opacity = 0
    , 1000

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


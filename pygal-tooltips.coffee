padding = 5
tooltip_timeout = 0
tooltip_font_size = @config.tooltip_font_size
anim_steps = @config.animation_steps
r_translation = /translate\((\d+)[ ,]+(\d+)\)/

get_translation = ($elt) ->
    (r_translation.exec($elt.attr('transform')) or []).slice(1)


tooltip = ($elt) ->
    clearTimeout(tooltip_timeout)
    $tooltip = $('#tooltip').css(opacity: 1)
    $text = $tooltip.find('text')
    $label = $tooltip.find('tspan.label')
    $value = $tooltip.find('tspan.value')
    $rect = $tooltip.find('rect')
    $label.text($elt.siblings('.label').text())
    $value.text($elt.siblings('.value').text())
    xlink = $elt.siblings('.xlink').text() or null
    $tooltip.find('a').attr('href', xlink)
    $text.attr('x', padding)
    $text.attr('y', padding + tooltip_font_size)
    $value.attr('x', padding)
    $value.attr('dy', if $label.text() then tooltip_font_size + padding else 0)

    w = $text.width() + 2 * padding
    h = $text.height() + 2 * padding
    $rect.attr('width', w)
    $rect.attr('height', h)
    x_elt = $elt.siblings('.x')
    y_elt = $elt.siblings('.y')
    x = parseInt(x_elt.text())
    if x_elt.hasClass('centered')
        x -= w / 2
    else if x_elt.hasClass('left')
        x -= w

    y = parseInt(y_elt.text())
    if y_elt.hasClass('centered')
        y -= h / 2
    else if y_elt.hasClass('top')
        y -= h

    [current_x, current_y] = get_translation($tooltip)
    return if current_x == x and current_y == y
    $tooltip.attr('transform', "translate(#{x} #{y})")

untooltip = ->
    tooltip_timeout = setTimeout (->
        $('#tooltip').css(opacity: 0)), 1000


$ ->
    $('.text-overlay .series').hide()
    $('.reactive').hover((-> $(@).addClass('active')), (-> $(@).removeClass('active')))
    $('.activate-serie').hover((->
        num = @.id.replace('activate-serie-', '')
        $('.text-overlay .serie-' + num).show()
        $('.serie-' + num + ' .reactive').addClass('active')
        ), ->
        num = @.id.replace('activate-serie-', '')
        $('.text-overlay .serie-' + num).hide()
        $('.serie-' + num + ' .reactive').removeClass('active')
        )
    $('.tooltip-trigger').hover((-> tooltip($(@))), (-> untooltip()))

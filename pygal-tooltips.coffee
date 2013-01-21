padding = 5
tooltip_timeout = 0
r_translation = /translate\((\d+)[ ,]+(\d+)\)/

get_translation = ($elt) ->
    (r_translation.exec($elt.attr('transform')) or []).slice(1)

init = (ctx) ->
    $vg('.text-overlay .series', ctx).hide()
    $vg('.reactive', ctx).hover((-> $vg(@).addClass('active')), (-> $vg(@).removeClass('active')))
    $vg('.activate-serie', ctx).hover((->
        num = @.id.replace('activate-serie-', '')
        $vg('.text-overlay .serie-' + num, ctx).show()
        $vg('.serie-' + num + ' .reactive', ctx).addClass('active')
        ), ->
        num = @.id.replace('activate-serie-', '')
        $vg('.text-overlay .serie-' + num, ctx).hide()
        $vg('.serie-' + num + ' .reactive', ctx).removeClass('active')
        )
    $vg('.tooltip-trigger', ctx).hover((-> tooltip($vg(@))), (-> untooltip()))
    
    tooltip = ($elt) ->
        clearTimeout(tooltip_timeout)
        $tooltip = $vg('#tooltip', ctx).css(opacity: 1)
        $text = $tooltip.find('text')
        $label = $tooltip.find('tspan.label')
        $value = $tooltip.find('tspan.value')
        $rect = $tooltip.find('rect')
        $label.text($elt.siblings('.label').text())
        $value.text($elt.siblings('.value').text())
        xlink = $elt.siblings('.xlink').text() or null
        target = $elt.parent().attr('target')
        if xlink
            $tooltip.find('a').attr('href', xlink).attr('target', target)
        $text.attr('x', padding)
        $text.attr('y', padding + @config.tooltip_font_size)
        $value.attr('x', padding)
        $value.attr('dy', if $label.text() then @config.tooltip_font_size + padding else 0)

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
            $vg('#tooltip', ctx).css(opacity: 0)), 1000

@init_svg = (ctx) ->
    init($vg(ctx))

$vg ->
    init()
